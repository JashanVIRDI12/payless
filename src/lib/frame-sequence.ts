/**
 * The playback engine behind <HaulSequence>: 452 stills, scrubbed by scroll,
 * painted to a canvas at display refresh rate.
 *
 * Three decisions carry this file.
 *
 * 1. Frames are kept as HTMLImageElement, never ImageBitmap. A decoded
 *    1920x1080 frame is 8.3MB of RGBA; holding all 452 of them would ask for
 *    3.7GB. An <img> holds only the ~62KB of compressed bytes and lets the
 *    browser's own decoded-image cache decide what stays hot — and because
 *    scrubbing walks neighbouring frames, the working set it keeps hot is
 *    exactly the handful we are about to draw.
 *
 * 2. Loading is coarse-to-fine, then nearest-first. A stride pass grabs every
 *    Nth frame so the whole 15 seconds is scrubbable after ~30 files instead
 *    of 452; everything after that is fetched by distance from wherever the
 *    reader actually is. Scroll somewhere and that stretch sharpens first.
 *
 * 3. The source is 30fps and stays 30fps. Smoothness at 60fps+ comes from
 *    cross-dissolving each adjacent pair by the fraction between them, which
 *    is real sub-frame motion off real pixels. The footage is handheld and
 *    already carries heavy motion blur, so the dissolve reads as movement
 *    rather than as a double image.
 */

export type FrameSequenceOptions = {
  canvas: HTMLCanvasElement;
  /** Total frames in the sequence. */
  frames: number;
  /** Resolves a frame index to its URL. */
  src: (index: number) => string;
  /**
   * Cross-dissolve adjacent frames. Off for reduced-motion and for anything
   * that would rather have a crisp still than smooth motion.
   */
  blend?: boolean;
  /** Fired once the first frame has painted, for fading the poster out. */
  onFirstPaint?: () => void;
  /** Fired as loading advances, for the progress readout. */
  onLoadProgress?: (loaded: number, total: number) => void;
};

const ABSENT = 0;
const PENDING = 1;
const READY = 2;
const FAILED = 3;

/** Parallel requests. Enough to saturate HTTP/2, few enough to stay ordered. */
const CONCURRENCY = 6;
/** First pass takes every Nth frame, so the full arc is scrubbable early. */
const COARSE_STRIDE = 12;

/**
 * On a metered or slow connection, stop refining once every Nth frame is in.
 * The dissolve covers the gap — a quarter of the frames still reads as motion,
 * where a stalled loader reads as a broken page.
 */
function detailCap(total: number): number {
  const c = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!c) return total;
  if (c.saveData) return Math.ceil(total / COARSE_STRIDE);
  if (c.effectiveType === "slow-2g" || c.effectiveType === "2g") {
    return Math.ceil(total / COARSE_STRIDE);
  }
  if (c.effectiveType === "3g") return Math.ceil(total / 4);
  return total;
}

export class FrameSequence {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly total: number;
  private readonly srcOf: (index: number) => string;
  private readonly blend: boolean;
  private readonly onFirstPaint?: () => void;
  private readonly onLoadProgress?: (loaded: number, total: number) => void;

  private readonly images: (HTMLImageElement | null)[];
  private readonly state: Uint8Array;

  /** Float frame position, 0..total-1. */
  private playhead = 0;
  private inFlight = 0;
  private loaded = 0;
  private budget: number;
  private coarseCursor = 0;
  private painted = false;
  private destroyed = false;

  /** Last painted composition, so an unchanged frame costs nothing. */
  private lastA = -1;
  private lastB = -1;
  private lastT = -1;
  private dirty = true;

  constructor(options: FrameSequenceOptions) {
    const ctx = options.canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas context unavailable");

    this.canvas = options.canvas;
    this.ctx = ctx;
    this.total = options.frames;
    this.srcOf = options.src;
    this.blend = options.blend ?? true;
    this.onFirstPaint = options.onFirstPaint;
    this.onLoadProgress = options.onLoadProgress;

    this.images = new Array(this.total).fill(null);
    this.state = new Uint8Array(this.total);
    this.budget = detailCap(this.total);

    this.resize();
    this.pump();
  }

  /** Scroll progress, 0..1. Cheap: the paint happens in render(). */
  setProgress(p: number) {
    const next = Math.max(0, Math.min(1, p)) * (this.total - 1);
    if (next !== this.playhead) {
      this.playhead = next;
      this.dirty = true;
    }
  }

  /** Matches the backing store to the element's box. Call on resize. */
  resize() {
    /*
     * offsetWidth/Height, not getBoundingClientRect(): the rect includes the
     * CSS transform, and the scroll timeline scales this canvas between 1.045
     * and 1. Measuring the transformed box made the backing store grow and
     * shrink with the scroll position — a 1478px-wide store for a 1440px
     * element — so the cover maths was solving for a box that did not exist.
     */
    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;
    if (!width || !height) return;

    // Capped at 2: beyond that the backing store grows faster than anyone can
    // see, and this canvas is repainted every single frame.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(width * dpr);
    const h = Math.round(height * dpr);
    if (this.canvas.width === w && this.canvas.height === h) return;

    this.canvas.width = w;
    this.canvas.height = h;
    this.dirty = true;
  }

  /**
   * Paints the current playhead. Safe to call every tick — it returns
   * immediately unless the composition actually moved.
   */
  render() {
    if (this.destroyed || !this.dirty) return;

    const a = Math.floor(this.playhead);
    const t = this.playhead - a;
    const b = Math.min(a + 1, this.total - 1);

    // The exact frames if they are in, otherwise the nearest that is. A gap in
    // the ladder shows as a held frame, never as a blank.
    const near = this.nearestReady(a);
    if (near === -1) {
      this.request(a);
      return;
    }

    const imgA = this.images[near];
    if (!imgA) return;

    // Only dissolve between the true adjacent pair. Dissolving between two
    // substitutes that are twelve frames apart would smear, not smooth.
    const exact = near === a;
    const imgB =
      this.blend && exact && b !== a && this.state[b] === READY
        ? this.images[b]
        : null;
    const mix = imgB ? t : 0;

    const quantised = Math.round(mix * 255);
    if (near === this.lastA && (imgB ? b : -1) === this.lastB && quantised === this.lastT) {
      this.dirty = false;
      return;
    }

    this.paint(imgA, imgB, mix);

    this.lastA = near;
    this.lastB = imgB ? b : -1;
    this.lastT = quantised;
    this.dirty = false;

    // Whatever was substituted for, ask for the real thing next.
    if (!exact) this.request(a);
    if (this.blend && !imgB && b !== a) this.request(b);

    if (!this.painted) {
      this.painted = true;
      this.onFirstPaint?.();
    }
  }

  destroy() {
    this.destroyed = true;
    for (const img of this.images) {
      if (img) img.src = "";
    }
    this.images.fill(null);
  }

  /** Fraction of the sequence decoded and drawable. */
  get coverage(): number {
    return this.loaded / this.total;
  }

  /* ── painting ───────────────────────────────────────────────────────── */

  /** Cover-fit, centred — the same geometry `object-fit: cover` would give. */
  private paint(
    a: HTMLImageElement,
    b: HTMLImageElement | null,
    mix: number
  ) {
    const { ctx, canvas } = this;
    const iw = a.naturalWidth;
    const ih = a.naturalHeight;
    if (!iw || !ih) return;

    const scale = Math.max(canvas.width / iw, canvas.height / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.globalAlpha = 1;
    ctx.drawImage(a, x, y, w, h);

    if (b && mix > 0.004) {
      ctx.globalAlpha = mix;
      ctx.drawImage(b, x, y, w, h);
      ctx.globalAlpha = 1;
    }
  }

  /* ── loading ────────────────────────────────────────────────────────── */

  /** Nearest READY frame to `index`, searching outward. -1 if nothing is in. */
  private nearestReady(index: number): number {
    if (this.state[index] === READY) return index;
    for (let d = 1; d < this.total; d += 1) {
      const lo = index - d;
      if (lo >= 0 && this.state[lo] === READY) return lo;
      const hi = index + d;
      if (hi < this.total && this.state[hi] === READY) return hi;
    }
    return -1;
  }

  /** Puts one frame at the front of the queue. */
  private request(index: number) {
    if (index < 0 || index >= this.total) return;
    if (this.state[index] !== ABSENT) return;
    this.start(index);
  }

  /**
   * Picks the next frame worth fetching: finish the coarse lattice first so
   * the whole sequence is scrubbable, then fill inward from the playhead.
   */
  private nextIndex(): number {
    while (this.coarseCursor < this.total) {
      const i = this.coarseCursor;
      this.coarseCursor += COARSE_STRIDE;
      if (this.state[i] === ABSENT) return i;
    }

    if (this.loaded >= this.budget) return -1;

    const here = Math.round(this.playhead);
    for (let d = 0; d < this.total; d += 1) {
      const lo = here - d;
      if (lo >= 0 && this.state[lo] === ABSENT) return lo;
      const hi = here + d;
      if (hi < this.total && this.state[hi] === ABSENT) return hi;
    }
    return -1;
  }

  /** Keeps CONCURRENCY requests in the air. */
  private pump() {
    while (!this.destroyed && this.inFlight < CONCURRENCY) {
      const i = this.nextIndex();
      if (i === -1) return;
      this.start(i);
    }
  }

  private start(index: number) {
    if (this.destroyed || this.state[index] !== ABSENT) return;

    this.state[index] = PENDING;
    this.inFlight += 1;

    const img = new Image();
    img.decoding = "async";
    // The lattice is what makes the section usable; the fill-in can wait
    // behind anything else the page still wants.
    img.fetchPriority = index % COARSE_STRIDE === 0 ? "high" : "low";

    const settle = (ok: boolean) => {
      this.inFlight -= 1;
      if (this.destroyed) return;

      if (ok) {
        this.state[index] = READY;
        this.images[index] = img;
        this.loaded += 1;
        this.onLoadProgress?.(this.loaded, this.total);
        // A newly arrived frame may be a better match than what is on screen.
        this.dirty = true;
      } else {
        this.state[index] = FAILED;
      }
      this.pump();
    };

    img.onload = () => {
      // decode() before marking it ready, so drawImage never blocks the
      // compositor on a synchronous decode mid-scroll.
      if (typeof img.decode === "function") {
        img.decode().then(
          () => settle(true),
          // A decode rejection on an image that loaded is usually a detached
          // element, not a corrupt file — it is still drawable.
          () => settle(true)
        );
      } else {
        settle(true);
      }
    };
    img.onerror = () => settle(false);
    img.src = this.srcOf(index);
  }
}

/** Picks the narrowest tier that still covers the viewport at its pixel density. */
export function pickTier<T extends { width: number }>(tiers: readonly T[]): T {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const need = window.innerWidth * dpr;
  const ordered = [...tiers].sort((a, b) => a.width - b.width);
  return ordered.find((t) => t.width >= need) ?? ordered[ordered.length - 1];
}

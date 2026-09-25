/**
 * The playback engine behind the hero film: a scroll-scrubbed image sequence
 * painted to a canvas at display refresh rate.
 *
 * Four decisions carry this file, and the first three are what keep it at
 * 60fps.
 *
 * 1. Bytes and pixels are separated. The network layer fetches each frame as a
 *    Blob — compressed bytes, a few tens of KB, cheap to hold for all of them.
 *    The paint layer holds ImageBitmaps, which are already-decoded pixels, for
 *    a bounded window around the playhead only. A full sequence of decoded
 *    1920x1080 frames would be gigabytes, so it cannot all be resident; a
 *    window of it can, and that is the only form `drawImage` can consume with
 *    no risk of a decode.
 *
 *    This is the whole point. An HTMLImageElement looks cheap — it holds only
 *    the compressed bytes — but the decoded pixels behind it live in a cache
 *    the browser evicts on its own global heuristics, with no way to pin.
 *    Draw an evicted frame and `drawImage` decodes it synchronously, on the
 *    main thread, mid-scroll: 5-15ms against a 16.6ms budget. That is a
 *    dropped frame every time the cache turns over, which is exactly the
 *    stutter this engine exists to remove. An ImageBitmap cannot be evicted
 *    behind our back — it is ours until we `close()` it.
 *
 * 2. Frames are cropped at decode time to exactly the region that ends up on
 *    screen, so painting is a blit with no resample. `createImageBitmap` does
 *    that crop off the main thread.
 *
 * 3. Loading is sequential from frame 0. The playhead starts at 0 and only
 *    advances with the scroll, so in-order loading is naturally ahead of the
 *    reader: the frame they are about to need is the next one that was going
 *    to arrive anyway. (An earlier version fetched a coarse stride first, on
 *    the theory that the whole arc should be scrubbable early. It made every
 *    part of the sequence equally gappy instead, and a gap paints as a held
 *    frame — that was the judder you could see.)
 *
 * 4. The source is 30fps, shipped at every 2nd frame, and stays there.
 *    Smoothness above that rate comes from cross-dissolving each adjacent pair
 *    by the fraction between them, which is real sub-frame motion off real
 *    pixels. The footage is handheld and already carries heavy motion blur, so
 *    the dissolve reads as movement rather than as a double image.
 *
 * Internally the engine works in *slots*, not frame numbers. On a good
 * connection they are the same thing. On a poor one the plan fetches every
 * Nth frame, and slots keep what it did fetch contiguous — so the window, the
 * nearest-frame search and the dissolve all operate on frames that exist,
 * rather than having to reason about holes.
 */

export type FrameSequenceOptions = {
  canvas: HTMLCanvasElement;
  /** Total frames in the sequence. */
  frames: number;
  /** Resolves a frame index to its URL. */
  src: (index: number) => string;
  /** Native pixel size of one frame, used to cap the backing store. */
  frameWidth: number;
  frameHeight: number;
  /**
   * Cross-dissolve adjacent frames. Off for reduced-motion and for anything
   * that would rather have a crisp still than smooth motion.
   */
  blend?: boolean;
  /**
   * Fetch only every Nth frame. Raised on a metered or slow connection: the
   * dissolve covers the gap, where a loader that never finishes does not.
   */
  stride?: number;
  /** Fired once the first frame has painted, for fading the poster out. */
  onFirstPaint?: () => void;
  /** Fired as the fetch advances, for the loader's readout. */
  onLoadProgress?: (loaded: number, total: number) => void;
};

/**
 * Parallel fetches. Enough to keep the pipe full on HTTP/2, few enough that
 * the browser still returns them roughly in the order we asked.
 */
const FETCH_CONCURRENCY = 8;

/**
 * Parallel decodes. `createImageBitmap` runs off the main thread, but each one
 * still costs a worker and some IPC; past a handful they queue behind each
 * other and arrive no sooner.
 */
const DECODE_CONCURRENCY = 3;

/**
 * How many decoded frames to hold, as a budget in whole frames. A 1624x1080
 * bitmap is about 7MB, so 24 of them is roughly 165MB — the size of a modest
 * video buffer, and the price of never decoding on the main thread.
 */
function windowSize(): number {
  const gb = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof gb !== "number") return 24;
  if (gb >= 8) return 32;
  if (gb >= 4) return 24;
  return 14;
}

/**
 * On a metered or slow connection, ship fewer frames rather than the same
 * frames more slowly. A quarter of the sequence still reads as motion once the
 * dissolve spans the gaps; a loader stuck at 40% reads as a broken page.
 */
export function loadStride(): number {
  const c = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (!c) return 1;
  if (c.saveData) return 4;
  if (c.effectiveType === "slow-2g" || c.effectiveType === "2g") return 4;
  if (c.effectiveType === "3g") return 2;
  return 1;
}

/** Whether this browser can do the off-thread decode the engine depends on. */
export function canDecodeOffThread(): boolean {
  return typeof createImageBitmap === "function";
}

/** Where a frame is cropped from, and how big the canvas it lands on is. */
type Geometry = {
  storeW: number;
  storeH: number;
  /** Source crop — the part of the frame that survives the cover fit. */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export class FrameSequence {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly srcOf: (index: number) => string;
  private readonly frameW: number;
  private readonly frameH: number;
  private readonly blend: boolean;
  private readonly onFirstPaint?: () => void;
  private readonly onLoadProgress?: (loaded: number, total: number) => void;

  /** Frame index behind each slot. Contiguous by construction. */
  private readonly slots: number[];
  private readonly count: number;

  /** Compressed bytes, one slot each. Null until fetched. */
  private readonly blobs: (Blob | null)[];
  /** Decoded pixels, bounded. Anything in here is drawable for free. */
  private readonly bitmaps = new Map<number, ImageBitmap>();
  private readonly decoding = new Set<number>();
  private readonly failed = new Set<number>();

  private fetchCursor = 0;
  private fetching = 0;

  private geometry: Geometry | null = null;
  private readonly capacity = windowSize();

  /** Float slot position, 0..count-1. */
  private playhead = 0;
  /** +1 scrolling forward, -1 back. Biases which side of the window fills. */
  private direction = 1;

  private loadedCount = 0;
  private painted = false;
  private destroyed = false;

  /** Last painted composition, so an unchanged frame costs nothing. */
  private lastA = -1;
  private lastB = -1;
  private lastT = -1;
  private dirty = true;
  /** Never evicted: whatever is on screen right now. */
  private pinned = -1;

  constructor(options: FrameSequenceOptions) {
    const ctx = options.canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("2D canvas context unavailable");

    this.canvas = options.canvas;
    this.ctx = ctx;
    this.srcOf = options.src;
    this.frameW = options.frameWidth;
    this.frameH = options.frameHeight;
    this.blend = options.blend ?? true;
    this.onFirstPaint = options.onFirstPaint;
    this.onLoadProgress = options.onLoadProgress;

    const stride = Math.max(1, Math.floor(options.stride ?? 1));
    const slots: number[] = [];
    for (let i = 0; i < options.frames; i += stride) slots.push(i);
    // The last frame is kept whatever the stride does: the end card rides on
    // it, and holding the one before it for double the distance is visible
    // right where the reader stops to look.
    if (slots[slots.length - 1] !== options.frames - 1) {
      slots.push(options.frames - 1);
    }

    this.slots = slots;
    this.count = slots.length;
    this.blobs = new Array(this.count).fill(null);

    this.resize();
    this.pumpFetch();
  }

  /* ── the scrub ──────────────────────────────────────────────────────── */

  /** Scroll progress, 0..1. Cheap: the paint happens in render(). */
  setProgress(p: number) {
    const next = Math.max(0, Math.min(1, p)) * (this.count - 1);
    if (next === this.playhead) return;
    this.direction = next > this.playhead ? 1 : -1;
    this.playhead = next;
    this.dirty = true;
  }

  /**
   * Paints the current playhead and keeps the decode window centred on it.
   * Safe to call every tick — the paint returns immediately unless the
   * composition actually moved.
   */
  render() {
    if (this.destroyed) return;

    this.tendWindow();
    if (!this.dirty || !this.geometry) return;

    const a = Math.floor(this.playhead);
    const t = this.playhead - a;
    const b = Math.min(a + 1, this.count - 1);

    // The exact frame if it is decoded, otherwise the nearest that is. During
    // a flick the window cannot keep up with the playhead and this substitutes
    // — invisible at that speed, and resolved the moment the scroll settles.
    const near = this.nearestDecoded(a);
    if (near === -1) return;

    const imgA = this.bitmaps.get(near);
    if (!imgA) return;

    // Only dissolve between the true adjacent pair. Dissolving between two
    // substitutes several frames apart would smear, not smooth.
    const exact = near === a;
    const imgB =
      this.blend && exact && b !== a ? this.bitmaps.get(b) ?? null : null;
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
    this.pinned = near;
    this.dirty = false;

    if (!this.painted) {
      this.painted = true;
      this.onFirstPaint?.();
    }
  }

  /**
   * Matches the backing store to the element's box. Call on resize — it
   * invalidates every decoded frame, because they were cropped to a geometry
   * that no longer exists.
   */
  resize() {
    const next = this.measure();
    if (!next) return;

    const prev = this.geometry;
    if (
      prev &&
      prev.storeW === next.storeW &&
      prev.storeH === next.storeH &&
      prev.sw === next.sw &&
      prev.sh === next.sh
    ) {
      return;
    }

    this.geometry = next;
    this.canvas.width = next.storeW;
    this.canvas.height = next.storeH;

    for (const bitmap of this.bitmaps.values()) bitmap.close();
    this.bitmaps.clear();
    this.lastA = -1;
    this.lastB = -1;
    this.lastT = -1;
    this.pinned = -1;
    this.dirty = true;
  }

  destroy() {
    this.destroyed = true;
    for (const bitmap of this.bitmaps.values()) bitmap.close();
    this.bitmaps.clear();
    this.blobs.fill(null);
  }

  /** Frames fetched so far. */
  get loaded(): number {
    return this.loadedCount;
  }

  /** Frames this plan intends to fetch — not always the number shipped. */
  get expected(): number {
    return this.count;
  }

  /** True once every frame the plan asked for has either arrived or failed. */
  get ready(): boolean {
    return this.loadedCount + this.failed.size >= this.count;
  }

  /** True once there is something real on the canvas. */
  get live(): boolean {
    return this.painted;
  }

  /* ── geometry ───────────────────────────────────────────────────────── */

  /**
   * The backing store, capped so the cover fit never scales a frame *up*.
   *
   * The naive store is `cssWidth * devicePixelRatio`, which on a retina laptop
   * asks for 2880 device px across and then feeds it a 1920px frame — paying
   * 2.25x the fill rate, on every painted frame, to resample a source with no
   * more detail to give. Capping at the frame's own resolution costs nothing
   * visible and saves two thirds of the pixels.
   *
   * offsetWidth/Height, not getBoundingClientRect(): the rect includes the CSS
   * transform, and the scroll timeline scales this canvas between 1.045 and 1.
   * Measuring the transformed box made the backing store grow and shrink with
   * the scroll position, so the cover maths was solving for a box that did not
   * exist.
   */
  private measure(): Geometry | null {
    const cssW = this.canvas.offsetWidth;
    const cssH = this.canvas.offsetHeight;
    if (!cssW || !cssH) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const elementAspect = cssW / cssH;
    const frameAspect = this.frameW / this.frameH;

    let storeW: number;
    let storeH: number;
    if (elementAspect >= frameAspect) {
      // Wider than the frame: the cover fit is solved by width, so width is
      // what has to stay inside the source.
      storeW = Math.min(Math.round(cssW * dpr), this.frameW);
      storeH = Math.max(1, Math.round(storeW / elementAspect));
    } else {
      storeH = Math.min(Math.round(cssH * dpr), this.frameH);
      storeW = Math.max(1, Math.round(storeH * elementAspect));
    }

    // The source region that survives the cover fit. With the cap above, the
    // scale is at most 1, so this is always inside the frame.
    const scale = Math.max(storeW / this.frameW, storeH / this.frameH);
    const sw = Math.min(this.frameW, Math.round(storeW / scale));
    const sh = Math.min(this.frameH, Math.round(storeH / scale));

    return {
      storeW,
      storeH,
      sx: Math.max(0, Math.round((this.frameW - sw) / 2)),
      sy: Math.max(0, Math.round((this.frameH - sh) / 2)),
      sw,
      sh,
    };
  }

  /* ── painting ───────────────────────────────────────────────────────── */

  /**
   * A blit, not a transform. The bitmaps were cropped at decode time to the
   * exact region the cover fit wants, so nothing is left to scale here beyond
   * the sub-pixel rounding between the crop and the store.
   */
  private paint(a: ImageBitmap, b: ImageBitmap | null, mix: number) {
    const { ctx, geometry } = this;
    if (!geometry) return;
    const { storeW, storeH } = geometry;

    ctx.globalAlpha = 1;
    ctx.drawImage(a, 0, 0, storeW, storeH);

    if (b && mix > 0.004) {
      ctx.globalAlpha = mix;
      ctx.drawImage(b, 0, 0, storeW, storeH);
      ctx.globalAlpha = 1;
    }
  }

  /* ── the decode window ──────────────────────────────────────────────── */

  /**
   * Keeps a bounded run of decoded frames centred on the playhead, weighted
   * towards wherever the reader is heading. Everything outside it is closed —
   * an ImageBitmap is real memory and nothing else will reclaim it.
   */
  private tendWindow() {
    if (!this.geometry) return;

    const here = Math.round(this.playhead);
    // Two thirds ahead, a third behind: scrolling back up happens, but not as
    // often, and holding frames nobody is returning to costs exactly as much
    // as holding frames they are about to reach.
    const lead = Math.round(this.capacity * 0.68);
    const trail = this.capacity - lead;
    const ahead = this.direction >= 0 ? lead : trail;
    const behind = this.direction >= 0 ? trail : lead;
    const lo = Math.max(0, here - behind);
    const hi = Math.min(this.count - 1, here + ahead);

    for (const [slot, bitmap] of this.bitmaps) {
      if ((slot < lo || slot > hi) && slot !== this.pinned) {
        bitmap.close();
        this.bitmaps.delete(slot);
      }
    }

    // Fill outward from the playhead, so the frame most likely to be asked for
    // next is the one that arrives next.
    const span = Math.max(hi - here, here - lo);
    for (let d = 0; d <= span && this.decoding.size < DECODE_CONCURRENCY; d += 1) {
      const forward = here + d * this.direction;
      if (forward >= lo && forward <= hi && this.wantsDecode(forward)) {
        this.decode(forward);
      }
      if (this.decoding.size >= DECODE_CONCURRENCY) break;
      const back = here - d * this.direction;
      if (back >= lo && back <= hi && this.wantsDecode(back)) {
        this.decode(back);
      }
    }
  }

  private wantsDecode(slot: number): boolean {
    return (
      this.blobs[slot] !== null &&
      !this.bitmaps.has(slot) &&
      !this.decoding.has(slot)
    );
  }

  private decode(slot: number) {
    const blob = this.blobs[slot];
    const geometry = this.geometry;
    if (!blob || !geometry) return;

    this.decoding.add(slot);
    // The crop overload, not resizeWidth/resizeHeight: it is the part of this
    // API Safari has had for as long as it has had createImageBitmap at all,
    // and with the store capped to the source there is nothing left to resize.
    createImageBitmap(blob, geometry.sx, geometry.sy, geometry.sw, geometry.sh)
      .then((bitmap) => {
        this.decoding.delete(slot);
        // A resize between the request and its arrival changes the crop, which
        // makes this bitmap the wrong shape for the store it would land in.
        if (this.destroyed || this.geometry !== geometry) {
          bitmap.close();
          return;
        }
        this.bitmaps.set(slot, bitmap);
        this.dirty = true;
      })
      .catch(() => {
        this.decoding.delete(slot);
        this.failed.add(slot);
      });
  }

  /** Nearest decoded slot to `slot`, searching outward. -1 if none is in. */
  private nearestDecoded(slot: number): number {
    if (this.bitmaps.has(slot)) return slot;
    for (let d = 1; d < this.count; d += 1) {
      const lo = slot - d;
      if (lo >= 0 && this.bitmaps.has(lo)) return lo;
      const hi = slot + d;
      if (hi < this.count && this.bitmaps.has(hi)) return hi;
    }
    return -1;
  }

  /* ── the network ────────────────────────────────────────────────────── */

  /** Keeps FETCH_CONCURRENCY requests in the air, in slot order. */
  private pumpFetch() {
    while (
      !this.destroyed &&
      this.fetching < FETCH_CONCURRENCY &&
      this.fetchCursor < this.count
    ) {
      const slot = this.fetchCursor;
      this.fetchCursor += 1;
      this.fetchSlot(slot);
    }
  }

  private fetchSlot(slot: number) {
    this.fetching += 1;
    fetch(this.srcOf(this.slots[slot]), { credentials: "omit" })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.blob();
      })
      .then((blob) => {
        if (this.destroyed) return;
        this.blobs[slot] = blob;
        this.loadedCount += 1;
        this.onLoadProgress?.(this.loadedCount, this.count);
        this.dirty = true;
      })
      .catch(() => {
        this.failed.add(slot);
      })
      .finally(() => {
        this.fetching -= 1;
        if (!this.destroyed) this.pumpFetch();
      });
  }
}

/** Picks the narrowest tier that still covers the viewport at its pixel density. */
export function pickTier<T extends { width: number }>(tiers: readonly T[]): T {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const need = window.innerWidth * dpr;
  const ordered = [...tiers].sort((a, b) => a.width - b.width);
  return ordered.find((t) => t.width >= need) ?? ordered[ordered.length - 1];
}

/**
 * Halves the shipped frame count of the scroll sequence, in place.
 *
 * The sequence was exported at the source's native 30fps — every frame of the
 * 15s cut, 452 files per tier. At the track length the hero actually uses
 * (480vh, ~8px of scroll per frame) that is about twice the temporal
 * resolution anyone can resolve, and it costs twice the bytes, twice the
 * requests and twice the decode pressure for it.
 *
 * This keeps every Nth frame and renumbers what is left. It is a file copy,
 * not a transcode: no frame is re-encoded, so the frames that ship are bit
 * for bit the ones ffmpeg produced. The originals are in git if the full rate
 * is ever wanted back.
 *
 * The cross-dissolve in <FrameSequence> still interpolates between the pairs
 * that remain, so the sub-frame motion that made 30fps of source read as 60fps
 * of playback is unaffected — it simply spans twice the distance.
 *
 * Usage:
 *   node scripts/thin-sequence.mjs            # keep every 2nd frame
 *   node scripts/thin-sequence.mjs --step 3
 *   node scripts/thin-sequence.mjs --dry-run
 */
import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const SEQ = path.join(root, "public", "sequence");
const MANIFEST = path.join(root, "src", "lib", "sequence.ts");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const STEP = Number(arg("step", 2));
const DRY = Boolean(arg("dry-run", false));
/** The master's frame rate, which the timecode readout still reports in. */
const SOURCE_FPS = 30;

if (!Number.isInteger(STEP) || STEP < 2) {
  throw new Error(`--step must be an integer >= 2 (got ${arg("step", 2)})`);
}

/** `w1920` -> 1920, and nothing else in the directory counts as a tier. */
const tierDirs = (await readdir(SEQ, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && /^w\d+$/.test(e.name))
  .map((e) => e.name)
  .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));

if (!tierDirs.length) throw new Error(`No w<width> tiers under ${SEQ}`);

let kept = 0;
let before = 0;
let after = 0;

for (const dir of tierDirs) {
  const from = path.join(SEQ, dir);
  const frames = (await readdir(from))
    .filter((name) => name.endsWith(".webp"))
    .sort();

  // Every tier has to end up with the same indices, or `frameSrc` would
  // resolve to a different moment depending on the viewport width.
  const selected = frames.filter((_, i) => i % STEP === 0);
  if (kept && selected.length !== kept) {
    throw new Error(
      `${dir} has ${frames.length} frames; earlier tiers thinned to ${kept}, this one to ${selected.length}`
    );
  }
  kept = selected.length;

  for (const name of frames) {
    before += (await stat(path.join(from, name))).size;
  }

  if (DRY) {
    console.log(`${dir}: ${frames.length} -> ${selected.length}`);
    continue;
  }

  // Written beside the tier and swapped in, so an interrupted run can never
  // leave a directory half renumbered.
  const staging = path.join(SEQ, `.${dir}.thinning`);
  await rm(staging, { recursive: true, force: true });
  await mkdir(staging, { recursive: true });

  for (const [index, name] of selected.entries()) {
    const target = path.join(staging, `${String(index).padStart(4, "0")}.webp`);
    await copyFile(path.join(from, name), target);
    after += (await stat(target)).size;
  }

  await rm(from, { recursive: true, force: true });
  await rename(staging, from);
  console.log(`${dir}: ${frames.length} -> ${selected.length} frames`);
}

if (DRY) {
  console.log(`Dry run. Would keep ${kept} frames per tier.`);
  process.exit(0);
}

/* ── manifest ─────────────────────────────────────────────────────────── */

const tiers = await Promise.all(
  tierDirs.map(async (dir) => {
    const width = Number(dir.slice(1));
    const sharp = (await import("sharp")).default;
    const meta = await sharp(path.join(SEQ, dir, "0000.webp")).metadata();
    return { width, height: meta.height };
  })
);
tiers.sort((a, b) => a.width - b.width);

const poster = await (await import("sharp")).default(path.join(SEQ, "poster.webp")).metadata();
const aspect = Number((poster.width / poster.height).toFixed(6));

// `from` is the smallest viewport a tier is the best choice for: the previous
// tier's width, so 1280 covers everything up to 1280 device px and 1920 takes
// over above it. Mirrors what build-sequence.mjs writes.
const tierLines = tiers
  .map((t, i) => `    { width: ${t.width}, height: ${t.height}, from: ${i === 0 ? 0 : tiers[i - 1].width} },`)
  .join("\n");

const existing = await import("node:fs/promises").then((fs) => fs.readFile(MANIFEST, "utf8"));
const posterBlur = existing.match(/posterBlur: "([^"]+)"/)?.[1];
if (!posterBlur) throw new Error("Could not read posterBlur out of the existing manifest");

await writeFile(
  MANIFEST,
  `/**
 * Generated by scripts/build-sequence.mjs, then thinned by
 * scripts/thin-sequence.mjs — do not edit by hand.
 * Source: media/download.mp4 (${poster.width}x${poster.height} @ ${SOURCE_FPS}fps),
 * shipped at every ${STEP === 2 ? "2nd" : `${STEP}th`} frame.
 */
export type SequenceTier = {
  /** Rendered width in px; also the directory name, as \`w\${width}\`. */
  width: number;
  height: number;
  /** Smallest viewport width this tier is the best choice for. */
  from: number;
};

export const SEQUENCE = {
  /** Frames are \`\${base}/w\${width}/\${index padded to 4}.webp\`. */
  base: "/sequence",
  poster: "/sequence/poster.webp",
  /** Inline 20px placeholder for the poster's first paint. */
  posterBlur: "${posterBlur}",
  frames: ${kept},
  /**
   * Playback rate of the frames that ship. The master is ${SOURCE_FPS}fps and
   * every ${STEP === 2 ? "2nd" : `${STEP}th`} frame of it is here, so the cut still runs its original
   * ${((kept - 1) * STEP / SOURCE_FPS).toFixed(1)}s — the timecode readout derives seconds from this.
   */
  fps: ${SOURCE_FPS / STEP},
  /** The master's rate, for reporting a source frame number in the timecode. */
  sourceFps: ${SOURCE_FPS},
  /** Source frames per shipped frame. */
  step: ${STEP},
  aspect: ${aspect},
  tiers: [
${tierLines}
  ] as SequenceTier[],
} as const;

/** Zero-padded frame path for a tier. */
export function frameSrc(tierWidth: number, index: number): string {
  return \`\${SEQUENCE.base}/w\${tierWidth}/\${String(index).padStart(4, "0")}.webp\`;
}
`
);

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)}MB`;
console.log(`Kept ${kept} frames per tier (every ${STEP}${STEP === 2 ? "nd" : "th"}).`);
console.log(`Sequence payload ${mb(before)} -> ${mb(after)} across ${tierDirs.length} tiers.`);
console.log(`Rewrote ${path.relative(root, MANIFEST)}.`);

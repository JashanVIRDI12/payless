/**
 * Turns `media/download.mp4` into the scroll-scrubbed image sequence behind
 * <HaulSequence>.
 *
 * The master lives in `media/`, not `public/`: everything under `public/` is
 * copied verbatim into the static export, and shipping a 16MB mp4 that no
 * page references would put it in the cPanel upload for nothing.
 *
 * Why an image sequence and not the <video> element: scrubbing `currentTime`
 * against scroll is at the mercy of the demuxer. Seeking to an arbitrary time
 * decodes from the previous keyframe, so a backwards scroll stalls, and Safari
 * and Firefox disagree about how often they will honour a seek at all. A
 * decoded still per frame is the only way to guarantee that scroll position N
 * always paints frame N, on every browser, in both directions.
 *
 * Quality: frames are encoded from the original 1920x1080 stream with no
 * downscale on the full tier and no frame dropping anywhere — every source
 * frame becomes a file. WebP at q88 sits above the h.264 source's own
 * intra-frame fidelity, so the sequence is not the weak link; the mp4 is.
 *
 * Frame rate: the source is 30fps and stays 30fps here. The 60fps smoothness
 * is produced at render time, where <HaulSequence> cross-dissolves each pair
 * of adjacent frames by the fractional distance between them. That is real
 * sub-frame motion off real pixels — unlike `minterpolate`, which invents
 * pixels and tears the spinning wheels and the road rushing past. Pass
 * `--interpolate` if you want to compare; it is not the default for a reason.
 *
 * Usage:
 *   FFMPEG=/path/to/ffmpeg node scripts/build-sequence.mjs
 *   node scripts/build-sequence.mjs --quality 92 --widths 1920,1280
 *   node scripts/build-sequence.mjs --input media/other-cut.mp4
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));

/** CLI: `--flag value` pairs, plus bare `--flag` booleans. */
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith("--") ? next : true;
}

const SOURCE = path.resolve(root, String(arg("input", "media/download.mp4")));
const OUT = path.join(root, "public", "sequence");
const MANIFEST = path.join(root, "src", "lib", "sequence.ts");

/**
 * Tiers, widest first. The widest is served at the source's native 1920 so it
 * is a straight transcode — no resample, no softening. Narrow viewports get
 * 1280, which still covers a 3x phone (≈1170 device px) without upscaling.
 */
const WIDTHS = String(arg("widths", "1920,1280"))
  .split(",")
  .map((w) => Number(w.trim()))
  .filter(Boolean);
const QUALITY = Number(arg("quality", 88));
/** Narrow tiers can afford a little less: they are never seen at 1:1. */
const NARROW_QUALITY = Number(arg("narrowQuality", 82));
const INTERPOLATE = arg("interpolate", false) === true;
const FPS = arg("fps", "native");

/** ffmpeg-static if a dependency, else $FFMPEG, else whatever is on PATH. */
async function resolveFfmpeg() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try {
    const mod = await import("ffmpeg-static");
    if (mod.default) return mod.default;
  } catch {
    /* not installed — fine */
  }
  return "ffmpeg";
}

const ffmpeg = await resolveFfmpeg();

async function probe() {
  // ffmpeg writes stream info to stderr and then exits non-zero for want of an
  // output file, so the failure *is* the result here.
  const info = await run(ffmpeg, ["-hide_banner", "-i", SOURCE]).catch((e) => e);
  const text = String(info.stderr ?? "");
  const stream = text.match(/Video:.*?(\d{2,5})x(\d{2,5}).*?([\d.]+) fps/s);
  const duration = text.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!stream) throw new Error(`Could not read a video stream from ${SOURCE}`);
  return {
    width: Number(stream[1]),
    height: Number(stream[2]),
    fps: Number(stream[3]),
    duration: duration
      ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3])
      : 0,
  };
}

const source = await probe();
console.log(
  `source  ${source.width}x${source.height} @ ${source.fps}fps, ${source.duration.toFixed(2)}s`
);

/** Filters run in order: rate change first, then scale. */
function filters(width) {
  const chain = [];
  if (INTERPOLATE && FPS !== "native") {
    chain.push(`minterpolate=fps=${FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1`);
  } else if (FPS !== "native") {
    chain.push(`fps=${FPS}`);
  }
  // Never upscale, and never resample the tier that matches the source.
  if (width < source.width) chain.push(`scale=${width}:-2:flags=lanczos`);
  return chain;
}

const tiers = [];

for (const width of WIDTHS) {
  const dir = path.join(OUT, `w${width}`);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  const chain = filters(width);
  const quality = width >= source.width ? QUALITY : NARROW_QUALITY;

  const args = [
    "-y",
    "-v", "error",
    "-i", SOURCE,
    "-an",
    // passthrough, not cfr: emit exactly the frames the decoder produced,
    // so frame count is deterministic and nothing is dropped or doubled.
    "-fps_mode", "passthrough",
    ...(chain.length ? ["-vf", chain.join(",")] : []),
    "-c:v", "libwebp",
    "-quality", String(quality),
    "-preset", "picture",
    "-compression_level", "6",
    "-start_number", "0",
    path.join(dir, "%04d.webp"),
  ];

  const started = Date.now();
  await run(ffmpeg, args, { maxBuffer: 1 << 26 });

  const files = (await readdir(dir)).filter((f) => f.endsWith(".webp")).sort();
  const bytes = (
    await Promise.all(files.map((f) => stat(path.join(dir, f)).then((s) => s.size)))
  ).reduce((a, b) => a + b, 0);

  const height = Math.round((width / source.width) * source.height / 2) * 2;
  tiers.push({ width, height, quality, frames: files.length, bytes });

  console.log(
    `w${width}  q${quality}  ${files.length} frames  ` +
      `${(bytes / 1048576).toFixed(1)}MB  (avg ${(bytes / files.length / 1024).toFixed(1)}KB)  ` +
      `${((Date.now() - started) / 1000).toFixed(1)}s`
  );
}

const frames = tiers[0].frames;
if (tiers.some((t) => t.frames !== frames)) {
  throw new Error(
    `Tiers disagree on frame count (${tiers.map((t) => `${t.width}:${t.frames}`).join(", ")}). ` +
      `The player indexes every tier with the same number.`
  );
}

/**
 * A poster for the section's first paint and for reduced-motion readers, who
 * never load the sequence at all. Frame 0 is the wide establishing shot.
 */
await run(ffmpeg, [
  "-y", "-v", "error",
  "-i", SOURCE,
  "-frames:v", "1",
  "-c:v", "libwebp", "-quality", "90", "-preset", "picture",
  path.join(OUT, "poster.webp"),
]);

/*
 * A 20px-wide copy of frame 0, inlined into the manifest as a data URL. The
 * poster is the hero's LCP element, so it gets next/image's `priority` — and a
 * blurDataURL means the very first paint is the right colours in the right
 * places rather than a navy rectangle. Too small to be worth a request of its
 * own, which is exactly why it travels in the JS.
 */
const blurFile = path.join(OUT, "poster-blur.webp");
await run(ffmpeg, [
  "-y", "-v", "error",
  "-i", SOURCE,
  "-frames:v", "1",
  "-vf", "scale=20:-2:flags=lanczos",
  "-c:v", "libwebp", "-quality", "60", "-preset", "picture",
  blurFile,
]);
const blur = `data:image/webp;base64,${(await readFile(blurFile)).toString("base64")}`;
await rm(blurFile, { force: true });

const outFps = FPS === "native" ? source.fps : Number(FPS);

// Emitted as a module rather than JSON in public/: the player needs the frame
// count to lay out its scroll distance on the very first frame, and a fetch
// for it would put a network round trip in front of that.
await writeFile(
  MANIFEST,
  `/**
 * Generated by scripts/build-sequence.mjs — do not edit by hand.
 * Source: ${path.relative(root, SOURCE)} (${source.width}x${source.height} @ ${source.fps}fps)
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
  posterBlur: "${blur}",
  frames: ${frames},
  fps: ${outFps},
  aspect: ${(source.width / source.height).toFixed(6)},
  tiers: [
${tiers
  .slice()
  .sort((a, b) => a.width - b.width)
  .map(
    (t, i, all) =>
      `    { width: ${t.width}, height: ${t.height}, from: ${i === 0 ? 0 : all[i - 1].width} },`
  )
  .join("\n")}
  ] as SequenceTier[],
} as const;

/** Zero-padded frame path for a tier. */
export function frameSrc(tierWidth: number, index: number): string {
  return \`\${SEQUENCE.base}/w\${tierWidth}/\${String(index).padStart(4, "0")}.webp\`;
}
`,
  "utf8"
);

const total = tiers.reduce((a, t) => a + t.bytes, 0);
console.log(`manifest  ${path.relative(root, MANIFEST)}`);
console.log(`total     ${(total / 1048576).toFixed(1)}MB across ${tiers.length} tier(s)`);

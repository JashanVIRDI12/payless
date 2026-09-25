/**
 * The channel between the hero's frame loader and the overlay that reports it.
 *
 * Progress arrives once per decoded frame — 226 times on a full load — so it
 * must not go through React state. <FilmLoader> registers a pair of imperative
 * handlers that write to the DOM directly, and <Hero> calls them without
 * knowing whether an overlay exists at all.
 *
 * Calls made before the overlay mounts are held and replayed, because the
 * fetch can outrun the effect that registers it on a warm cache.
 */

export type FilmLoaderHandle = {
  /** 0..1, the share of frames in. */
  progress(value: number): void;
  /** Play the exit and release the page. Idempotent. */
  dismiss(): void;
};

let handle: FilmLoaderHandle | null = null;
let heldProgress = 0;
let heldDismiss = false;

export function registerFilmLoader(next: FilmLoaderHandle | null) {
  handle = next;
  if (!next) return;
  if (heldProgress > 0) next.progress(heldProgress);
  if (heldDismiss) next.dismiss();
}

export function setFilmProgress(value: number) {
  heldProgress = Math.max(0, Math.min(1, value));
  handle?.progress(heldProgress);
}

export function dismissFilmLoader() {
  heldDismiss = true;
  handle?.dismiss();
}

/**
 * Whether the film has already been waited for once this session.
 *
 * A client-side navigation back to the home page remounts the loader, and by
 * then the frames are in the HTTP cache — so there is nothing to wait for. The
 * card removes itself on the spot rather than playing an exit nobody needs to
 * see twice.
 */
export function filmLoaderSettled(): boolean {
  return heldDismiss;
}

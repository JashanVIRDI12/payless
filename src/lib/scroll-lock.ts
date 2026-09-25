/**
 * A one-instance registry for the page's smooth scroller, so anything that
 * needs to hold the page still can do it without being handed a Lenis
 * reference through the component tree.
 *
 * <SmoothScroll> registers on mount; <FilmLoader> is the only caller so far.
 * The lock has to reach both scrollers — Lenis for the wheel and the anchor
 * handling, and the document for the touch and keyboard paths Lenis leaves
 * alone with `syncTouch: false`.
 */

type Scroller = { start(): void; stop(): void };

let scroller: Scroller | null = null;
let depth = 0;

export function registerScroller(instance: Scroller | null) {
  scroller = instance;
  // A scroller that mounts while a lock is up has to come up stopped, or the
  // page starts moving under a loader that is still on screen.
  if (instance && depth > 0) instance.stop();
}

/** Holds the page still. Nested calls are counted, so the last one wins. */
export function lockScroll() {
  depth += 1;
  if (depth > 1) return;
  scroller?.stop();
  document.documentElement.classList.add("is-scroll-locked");
}

export function unlockScroll() {
  if (depth === 0) return;
  depth -= 1;
  if (depth > 0) return;
  document.documentElement.classList.remove("is-scroll-locked");
  scroller?.start();
}

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * One Lenis instance for the page, driven by GSAP's ticker so smooth scroll and
 * ScrollTrigger share a single clock. Never created under prefers-reduced-motion.
 * Touch scrolling stays native (Lenis' default `syncTouch: false`).
 */
let lenis: Lenis | null = null;
let locks = 0;
const tick = (time: number) => lenis?.raf(time * 1000);

export function startSmooth() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return lenis;
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    // Scrollable overlays (project sheet, palette list) keep native scrolling.
    prevent: node => !!node.closest?.("[data-lenis-prevent], [role=dialog]"),
  });
  lenis.on("scroll", ScrollTrigger.update);
  document.addEventListener("click", onAnchor);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  if (locks > 0) lenis.stop();
  return lenis;
}

export function stopSmooth() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  document.removeEventListener("click", onAnchor);
  lenis.destroy();
  lenis = null;
}

export const getLenis = () => lenis;


/** Scroll to a section so its top lands just under the fixed header. Works while Lenis is paused. */
export function scrollToId(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return;
  // Lenis already honours html { scroll-padding-top } (the header height), so no extra offset.
  if (lenis) lenis.scrollTo(el, { immediate: !smooth, force: true });
  else el.scrollIntoView({ behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto" });
}

// In-page links glide with Lenis. The skip link stays native so focus moves to <main>.
function onAnchor(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const a = (e.target as Element | null)?.closest?.("a[href^='#']");
  const id = a?.getAttribute("href")?.slice(1);
  if (!a || !id || id === "main" || !document.getElementById(id)) return;
  e.preventDefault();
  // Let React close the menu (and release the scroll lock) first.
  requestAnimationFrame(() => scrollToId(id));
}

/** Pause smooth scrolling while a dialog, palette or menu is open. Calls are counted. */
export function lockScroll(locked: boolean) {
  locks = Math.max(0, locks + (locked ? 1 : -1));
  if (!lenis) return;
  if (locks > 0) lenis.stop(); else lenis.start();
}

/** Jump instantly (used when keyboard focus moves into the pinned gallery). */
export function jumpTo(top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "auto" });
  ScrollTrigger.update();
}

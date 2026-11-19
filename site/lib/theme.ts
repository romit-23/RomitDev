import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
const THEME_COLOR: Record<Theme, string> = { light: "#f1efe9", dark: "#0b0b0a" };

export const currentTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  try { localStorage.setItem("theme", theme); } catch { /* private mode: the choice lasts for this visit only */ }
}

/**
 * Switch theme. With View Transitions support (and motion allowed) the new theme
 * spreads out in a circle from the point the user clicked; otherwise it swaps instantly.
 */
export function setTheme(theme: Theme, origin?: { x: number; y: number }) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (!doc.startViewTransition || reduce) { apply(theme); return; }
  const x = origin?.x ?? window.innerWidth - 40, y = origin?.y ?? 36;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const root = document.documentElement;
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-r", `${radius}px`);
  try { doc.startViewTransition(() => apply(theme)); } catch { apply(theme); }
}

/** Current theme, kept in sync if it changes anywhere (other components, the inline head script). */
export function useTheme() {
  const [theme, set] = useState<Theme>("light");
  useEffect(() => {
    set(currentTheme());
    const mo = new MutationObserver(() => set(currentTheme()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

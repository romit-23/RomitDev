import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Custom cursor for fine pointers only: an exact dot plus a trailing ring.
 * Elements with `data-cursor="Label"` grow the ring and show the label.
 * The native cursor is hidden only after the first real mouse move, and never under reduced motion.
 */
export default function Cursor({ disabled }: { disabled: boolean }) {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 420, damping: 36, mass: 0.6 });
  const [active, setActive] = useState(false), [label, setLabel] = useState(""), [hover, setHover] = useState(false), [down, setDown] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (disabled || !window.matchMedia("(pointer: fine)").matches) { root.classList.remove("has-cursor"); setActive(false); return; }
    const SELECTOR = "[data-cursor], a, button, [role=tab], [role=option], input";
    const last = { x: -1, y: -1 };
    let frame = 0;
    const sync = (el: Element | null) => {
      const target = el?.closest?.(SELECTOR) ?? null;
      setHover(!!target);
      setLabel(target?.getAttribute("data-cursor") ?? "");
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      last.x = e.clientX; last.y = e.clientY;
      x.set(e.clientX); y.set(e.clientY);
      if (!root.classList.contains("has-cursor")) { root.classList.add("has-cursor"); setActive(true); }
      sync(e.target as Element | null);
    };
    // Scrolling moves the page under a still pointer (wheel, keys, the pinned gallery), and no
    // pointermove fires, so re-check what is under the pointer once per frame while scrolling.
    const rescan = () => {
      if (frame || last.x < 0) return;
      frame = requestAnimationFrame(() => { frame = 0; sync(document.elementFromPoint(last.x, last.y)); });
    };
    const leave = () => setActive(false);
    const enter = () => root.classList.contains("has-cursor") && setActive(true);
    const press = () => setDown(true), release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", rescan, { passive: true, capture: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", rescan, { capture: true });
      cancelAnimationFrame(frame);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointerenter", enter);
      root.classList.remove("has-cursor");
    };
  }, [disabled, x, y]);

  if (disabled) return null;
  return (
    <div className={`cursor ${active ? "is-active" : ""} ${hover ? "is-hover" : ""} ${label ? "has-label" : ""} ${down ? "is-down" : ""}`} aria-hidden="true">
      <motion.div className="cursor-ring" style={{ x: rx, y: ry }}><span>{label}</span></motion.div>
      <motion.div className="cursor-dot" style={{ x, y }} />
    </div>
  );
}

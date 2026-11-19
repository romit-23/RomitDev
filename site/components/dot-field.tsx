import { useEffect, useRef } from "react";

/**
 * Interactive dot matrix behind the hero.
 * - Dots swell and drift away from the pointer; those closest turn signal orange.
 * - A slow diagonal wave keeps the field alive when the pointer is idle.
 * - One rAF loop, DPR capped at 2, stopped when off-screen, paused, or the tab is hidden.
 * - `still` draws a single static frame (reduced motion / motion toggle).
 */
export default function DotField({ still }: { still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const GAP = 26;
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let ink = "14,14,13", signal = "255,77,18";
    const readColours = () => {
      const styles = getComputedStyle(canvas);
      ink = styles.getPropertyValue("--field-ink").trim() || ink;
      signal = styles.getPropertyValue("--field-signal").trim() || signal;
    };
    readColours();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // Ease the pointer so the field trails it rather than snapping.
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      const R = Math.min(220, Math.max(140, w * 0.14));
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const wave = still ? 0.5 : (Math.sin(x * 0.012 + y * 0.008 - t * 1.4) + 1) / 2;
          const dx = x - pointer.x, dy = y - pointer.y;
          const d = Math.hypot(dx, dy);
          const k = d < R ? 1 - d / R : 0; // 0..1 influence of the pointer
          const push = k * k * 18;
          const px = d > 0 ? x + (dx / d) * push : x;
          const py = d > 0 ? y + (dy / d) * push : y;
          const size = 0.9 + wave * 0.9 + k * 3.2;
          const alpha = 0.12 + wave * 0.12 + k * 0.6;
          ctx.fillStyle = k > 0.35 ? `rgba(${signal},${Math.min(1, alpha + 0.2)})` : `rgba(${ink},${alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = () => {
      t += 1 / 60;
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const start = () => { if (!still && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const r = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - r.left; pointer.ty = e.clientY - r.top;
      if (pointer.x < -1000) { pointer.x = pointer.tx; pointer.y = pointer.ty; }
    };
    const onLeave = () => { pointer.tx = -9999; pointer.ty = -9999; };
    // Theme switch: pick up the new dot colour and repaint a still field.
    const themeMO = new MutationObserver(() => { readColours(); if (still) draw(); });
    themeMO.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else stop(); });
    const onVis = () => (document.hidden ? stop() : start());
    const ro = new ResizeObserver(resize);

    resize();
    ro.observe(canvas);
    io.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    if (!still) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      start();
    } else draw();

    return () => {
      stop(); ro.disconnect(); io.disconnect(); themeMO.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [still]);

  return <canvas ref={ref} className="dot-field" aria-hidden="true" />;
}

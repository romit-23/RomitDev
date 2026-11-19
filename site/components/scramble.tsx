import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_-+*";

/**
 * Decodes text on hover/focus of its closest interactive parent (or itself).
 * The real text is kept in an sr-only span; the animated copy is aria-hidden,
 * runs only on interaction, and always settles to the exact source string.
 */
export default function Scramble({ text, className = "", disabled = false }: { text: string; className?: string; disabled?: boolean }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(0);

  useEffect(() => setOut(text), [text]);
  useEffect(() => {
    const host = ref.current?.closest("a, button, [data-scramble-host]") ?? ref.current;
    if (!host || disabled) return;
    const run = () => {
      window.clearInterval(timer.current);
      let frame = 0;
      const total = Math.max(8, Math.min(18, text.length * 1.4));
      timer.current = window.setInterval(() => {
        frame++;
        const settled = Math.floor((frame / total) * text.length);
        setOut(text.split("").map((ch, i) => (i < settled || ch === " " ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join(""));
        if (frame >= total) { window.clearInterval(timer.current); setOut(text); }
      }, 28);
    };
    host.addEventListener("pointerenter", run);
    host.addEventListener("focus", run);
    return () => { host.removeEventListener("pointerenter", run); host.removeEventListener("focus", run); window.clearInterval(timer.current); setOut(text); };
  }, [text, disabled]);

  return (
    <span ref={ref} className={`scramble ${className}`}>
      <span className="sr-only">{text}</span>
      {/* The invisible sizer reserves the settled width so neighbours never shift. */}
      <span className="scramble-sizer" aria-hidden="true">{text}</span>
      <span className="scramble-out" aria-hidden="true">{out}</span>
    </span>
  );
}

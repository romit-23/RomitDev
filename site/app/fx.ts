import { useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { jumpTo, startSmooth, stopSmooth } from "@/lib/smooth";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * All scroll choreography for the page, created top-to-bottom so ScrollTrigger
 * refreshes in page order. Everything lives inside gsap.matchMedia(): under
 * prefers-reduced-motion nothing is split, hidden or pinned, and switching the
 * preference reverts every tween and inline style automatically.
 *
 * Content is only ever faded with `opacity` (never `visibility`) so text stays
 * readable to assistive tech and in-page search before it animates in.
 */
export function useScrollFX(root: RefObject<HTMLElement | null>, { pinned }: { pinned: boolean }) {
  const gallery = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1000px) and (min-height: 620px)" }, ctx => {
      const { motion } = ctx.conditions as { motion: boolean; desktop: boolean };
      if (!motion) return;
      startSmooth();

      // 1. Hero: the two halves of the name drift apart as you leave, the field dims.
      const hero = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      hero.to(".hero-name .line:first-child", { xPercent: -6, ease: "none" }, 0)
        .to(".hero-name .line-2", { xPercent: 5, ease: "none" }, 0)
        .to(".dot-field", { opacity: 0.25, ease: "none" }, 0)
        .to(".hero-foot", { y: -60, opacity: 0, ease: "none" }, 0);

      // 2. Section titles: lines rise out of a mask once, as they enter.
      gsap.utils.toArray<HTMLElement>(".title, .contact-title, .about-hi").forEach(el => {
        SplitText.create(el, {
          type: "lines", mask: "lines", autoSplit: true,
          onSplit: self => gsap.from(self.lines, {
            yPercent: 105, duration: 1.1, ease: "expo.out", stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }),
        });
      });

      // 3. About statement: each word brightens as the reader passes it (scrubbed).
      // aria "none": the words stay readable as normal text (a label on a <p> is not reliably announced).
      SplitText.create(".statement", {
        type: "words", autoSplit: true, aria: "none",
        onSplit: self => gsap.fromTo(self.words, { opacity: 0.16 }, {
          opacity: 1, ease: "none", stagger: 0.1,
          scrollTrigger: { trigger: ".statement", start: "top 80%", end: "bottom 45%", scrub: true },
        }),
      });
      gsap.from(".about-grid > *", { y: 50, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: ".about-grid", start: "top 85%", once: true } });

      // 4. Work: pin the stage and slide the track sideways 1:1 with scroll.
      if (pinned) {
        const stage = root.current?.querySelector<HTMLElement>(".gallery-stage");
        const track = root.current?.querySelector<HTMLElement>(".gallery-track");
        if (stage && track) {
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
          const count = root.current!.querySelectorAll(".panel").length;
          const counter = root.current!.querySelector<HTMLElement>(".gallery-count");
          const bar = root.current!.querySelector<HTMLElement>(".gallery-bar span");
          const slide = gsap.to(track, {
            x: () => -distance(), ease: "none", // ease "none" keeps scroll and position in lockstep
            scrollTrigger: {
              trigger: stage, pin: true, start: "top top", end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true,
              onUpdate: self => {
                const step = (track.children[0] as HTMLElement).offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
                const i = Math.min(count - 1, Math.round((self.progress * distance()) / step));
                if (counter) counter.textContent = `0${i + 1} / 0${count}`;
                if (bar) gsap.set(bar, { scaleX: gsap.utils.mapRange(0, 1, 1 / count, 1, self.progress) });
              },
            },
          });
          gallery.current = slide.scrollTrigger ?? null;
          // Inside the moving track: big numbers and diagrams parallax against the panel.
          gsap.utils.toArray<HTMLElement>(".panel").forEach(panel => {
            gsap.fromTo(panel.querySelector(".panel-num"), { xPercent: 60 }, { xPercent: -10, ease: "none", scrollTrigger: { containerAnimation: slide, trigger: panel, start: "left right", end: "right left", scrub: true } });
            gsap.fromTo(panel.querySelector(".diagram"), { x: 70 }, { x: -70, ease: "none", scrollTrigger: { containerAnimation: slide, trigger: panel, start: "left right", end: "right left", scrub: true } });
          });
        }
      } else {
        gsap.utils.toArray<HTMLElement>(".panel").forEach(panel => gsap.from(panel, { y: 48, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: panel, start: "top 88%", once: true } }));
      }

      // 5. Publication: architecture steps cascade in.
      gsap.from(".arch li", { x: 60, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".arch", start: "top 80%", once: true } });

      // 6. Experience: each row draws its rule, then its content rises.
      gsap.utils.toArray<HTMLElement>(".xp-row").forEach(row => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } });
        tl.from(row.querySelector(".xp-rule"), { scaleX: 0, duration: 1.2, ease: "expo.inOut" })
          .from(row.querySelectorAll(".xp-head > *, .xp-body li, .xp-body .tags"), { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.05 }, 0.25);
      });

      // 7. Toolkit: chips arrive in staggered batches as their column scrolls in.
      ScrollTrigger.batch(".chips span", {
        start: "top 92%", once: true,
        onEnter: batch => gsap.from(batch, { y: 24, opacity: 0, scale: 0.9, duration: 0.6, ease: "back.out(2)", stagger: 0.025 }),
      });

      // 8. Contact: the email line slides in; footer name rises from below.
      gsap.from(".contact-email", { xPercent: -8, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".contact-email", start: "top 90%", once: true } });
      // Footer name: each letter rises out of its word-mask in a scroll-scrubbed stagger.
      // The name is split into chars; words have overflow:clip so the motion is a clean upward reveal.
      SplitText.create(".footer-name-wrap", {
        type: "chars", aria: "none", autoSplit: true,
        onSplit: self => gsap.from(self.chars, {
          yPercent: 115, rotate: 5, transformOrigin: "0% 100%", ease: "none", stagger: 0.03,
          scrollTrigger: { trigger: ".footer", start: "top 85%", end: "bottom bottom", scrub: 0.6 },
        }),
      });

      // Magnetic primary buttons: they lean toward the pointer (fine pointers only).
      if (window.matchMedia("(pointer: fine)").matches) {
        gsap.utils.toArray<HTMLElement>(".btn-signal, .talk, .btn-ink").forEach(btn => {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
          const move = (e: PointerEvent) => { const r = btn.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); };
          const leave = () => { xTo(0); yTo(0); };
          btn.addEventListener("pointermove", move);
          btn.addEventListener("pointerleave", leave);
          ctx.add(() => () => { btn.removeEventListener("pointermove", move); btn.removeEventListener("pointerleave", leave); });
        });
      }

      // Fonts change line breaks and widths: re-measure once they are in.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => { gallery.current = null; stopSmooth(); };
    });

    return () => mm.revert();
  }, { scope: root, dependencies: [pinned], revertOnUpdate: true });

  /** Keyboard focus moved into panel i: scroll so that panel is centred in the pinned track. */
  const focusPanel = (i: number) => {
    const st = gallery.current;
    const track = root.current?.querySelector<HTMLElement>(".gallery-track");
    if (!st || !track) return;
    const panel = track.children[i] as HTMLElement | undefined;
    if (!panel) return;
    const distance = Math.max(0, track.scrollWidth - window.innerWidth);
    const offset = Math.min(distance, Math.max(0, panel.offsetLeft - (window.innerWidth - panel.offsetWidth) / 2));
    jumpTo(st.start + (distance ? (offset / distance) * (st.end - st.start) : 0));
  };

  return { focusPanel };
}

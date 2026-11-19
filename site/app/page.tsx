"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Code2, Command, Copy, Download, Mail, Menu, Moon, Pause, Play, Search, Sun, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import Cursor from "@/components/cursor";
import DotField from "@/components/dot-field";
import ProjectDiagram, { Pulse } from "@/components/project-diagram";
import Scramble from "@/components/scramble";
import { Github, Linkedin } from "@/components/social-icons";
import { lockScroll, scrollToId } from "@/lib/smooth";
import { currentTheme, setTheme, useTheme } from "@/lib/theme";
import { email, education, experience, links, profile, projects, resumeUrl, toolkit, type Project } from "./content";
import { useScrollFX } from "./fx";

const ease = [0.2, 0.8, 0.2, 1] as const;
const nav = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "toolkit", label: "Toolkit" },
  { id: "about", label: "About" },
];

function useMotionPreference() {
  const preference = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated && !!preference;
}

function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** Section label: "(01) Selected work" in mono. */
function Label({ index, children }: { index: string; children: ReactNode }) {
  return <span className="label"><span className="label-index">({index})</span>{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

/** Sun/moon switch. The new theme spreads out in a circle from the button. */
function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button className="theme-toggle" data-theme-state={theme} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}
      onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }}>
      <span className="theme-icon" aria-hidden="true"><Sun size={17} className="icon-sun" /><Moon size={17} className="icon-moon" /></span>
    </button>
  );
}

function Header({ onPalette, still }: { onPalette: () => void; still: boolean }) {
  const [menu, setMenu] = useState(false), [tone, setTone] = useState("light"), [active, setActive] = useState(""), [isMac, setIsMac] = useState(false);
  useEffect(() => { setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent)); }, []);
  // The header reads the tone of whichever section sits under it, so it inverts over dark bands.
  useEffect(() => {
    const toneIO = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setTone((e.target as HTMLElement).dataset.tone || "light"); }), { rootMargin: "-36px 0px -96% 0px" });
    const navIO = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: "-20% 0px -60% 0px" });
    document.querySelectorAll("[data-tone]").forEach(el => toneIO.observe(el));
    document.querySelectorAll("main section[id]").forEach(el => navIO.observe(el));
    return () => { toneIO.disconnect(); navIO.disconnect(); };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("menu-lock");
    lockScroll(true);
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.classList.remove("menu-lock"); lockScroll(false); };
  }, [menu]);
  return (
    <header className={`site-header tone-${menu ? "dark" : tone}`}>
      <a className="monogram" href="#home" onClick={() => setMenu(false)} aria-label="Romit Addagatla, home"><span>R</span><span className="monogram-dot" />A</a>
      <nav className={menu ? "main-nav menu-open" : "main-nav"} aria-label="Main navigation" id="main-navigation">
        {nav.map((item, i) => <a key={item.id} href={`#${item.id}`} className={active === item.id ? "is-active" : ""} aria-current={active === item.id ? "location" : undefined} onClick={() => setMenu(false)}>
          <span className="nav-num" aria-hidden="true">0{i + 1}</span><Scramble text={item.label} disabled={still} />
        </a>)}
        <a className="menu-only" href="#contact" onClick={() => setMenu(false)}><span className="nav-num" aria-hidden="true">05</span>Contact</a>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <button className="search-trigger" onClick={onPalette} aria-label="Open quick search" aria-keyshortcuts="Control+K Meta+K"><Search size={15} /><kbd>{isMac ? <Command size={11} /> : "Ctrl "}K</kbd></button>
        <a className="talk" href="#contact" data-cursor="Say hi"><span className="talk-dot" />Let’s talk</a>
        <button className="menu-toggle" aria-label={menu ? "Close navigation" : "Open navigation"} aria-expanded={menu} aria-controls="main-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Command palette                                                     */
/* ------------------------------------------------------------------ */

type PaletteItem = { id: string; group: string; label: string; hint?: string; icon: ReactNode; run: () => void };

function CommandPalette({ open, onOpenChange, items }: { open: boolean; onOpenChange: (open: boolean) => void; items: PaletteItem[] }) {
  const [query, setQuery] = useState(""), [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter(item => `${item.label} ${item.group} ${item.hint ?? ""}`.toLowerCase().includes(q)) : items;
  }, [items, query]);
  useEffect(() => { if (open) { setQuery(""); setIndex(0); } }, [open]);
  useEffect(() => { setIndex(0); }, [query]);
  useEffect(() => { listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" }); }, [index]);
  const run = (item: PaletteItem | undefined) => { if (!item) return; onOpenChange(false); setTimeout(item.run, 60); };
  let lastGroup = "";
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="overlay" />
        <DialogPrimitive.Content className="palette" aria-describedby={undefined} onKeyDown={e => {
          if (e.key === "ArrowDown") { e.preventDefault(); setIndex(i => (i + 1) % Math.max(results.length, 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setIndex(i => (i - 1 + results.length) % Math.max(results.length, 1)); }
          if (e.key === "Enter") { e.preventDefault(); run(results[index]); }
        }}>
          <DialogPrimitive.Title className="sr-only">Quick search</DialogPrimitive.Title>
          <div className="palette-input"><Search size={17} aria-hidden="true" />
            <input autoFocus name="palette-search" autoComplete="off" spellCheck={false} value={query} onChange={e => setQuery(e.target.value)} placeholder="Jump to a section, project or link…" aria-label="Search the portfolio" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={results[index] ? `palette-${results[index].id}` : undefined} />
            <kbd>Esc</kbd>
          </div>
          <div className="palette-list" data-lenis-prevent id="palette-list" role="listbox" aria-label="Results" ref={listRef}>
            {results.length === 0 && <p className="palette-empty">No matches for “{query}”.</p>}
            {results.map((item, i) => {
              const header = item.group !== lastGroup ? item.group : null; lastGroup = item.group;
              return <div key={item.id}>
                {header && <div className="palette-group" aria-hidden="true">{header}</div>}
                <div id={`palette-${item.id}`} data-index={i} role="option" aria-selected={i === index} className="palette-item" onPointerMove={() => setIndex(i)} onClick={() => run(item)}>
                  <span className="palette-icon">{item.icon}</span><span className="palette-label">{item.label}</span>{item.hint && <span className="palette-hint">{item.hint}</span>}<ArrowRight size={14} className="palette-enter" aria-hidden="true" />
                </div>
              </div>;
            })}
          </div>
          <div className="palette-foot" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span></div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Letters({ text, delay, still }: { text: string; delay: number; still: boolean }) {
  return <>{text.split("").map((c, i) => <motion.span key={i} className="ch" initial={still ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease, delay: delay + i * 0.045 }}>{c}</motion.span>)}</>;
}

function Hero({ still }: { still: boolean }) {
  const fade = (d: number) => ({ initial: still ? false : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease, delay: d } }) as const;
  return (
    <section id="home" className="hero" data-tone="light">
      <DotField still={still} />
      <div className="wrap hero-inner">
        <motion.div className="hero-meta" {...fade(0.05)}>
          <span><i className="live-dot" />{profile.role}</span>
          <span>{profile.location}</span>
          <a href="#experience">Currently at {profile.current}<ArrowUpRight size={13} aria-hidden="true" /></a>
        </motion.div>
        <h1 className="hero-name" aria-label={profile.name}>
          <span className="line" aria-hidden="true"><span className="word"><Letters text="Romit" delay={0.15} still={still} /></span></span>
          <span className="line line-2" aria-hidden="true"><span className="serif"><Letters text="Addagatla" delay={0.35} still={still} /></span><motion.span className="hero-stop" initial={still ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, ease, delay: 0.95 }} /></span>
        </h1>
        <div className="hero-foot">
          <motion.p className="hero-desc" {...fade(0.8)}>{profile.heroLines[0]}<br />{profile.heroLines[1]}</motion.p>
          <motion.div className="hero-ctas" {...fade(0.9)}>
            <a href="#work" className="btn btn-signal" data-cursor="Scroll"><span>Explore my work</span><ArrowDown size={17} aria-hidden="true" /></a>
            <a href={resumeUrl} download className="btn btn-line" data-cursor="PDF"><Download size={17} aria-hidden="true" /><span>Download resume</span></a>
          </motion.div>
          <motion.a href="#about" className="scroll-cue" aria-label="Scroll to about" {...fade(1)}><span className="scroll-line" /><span>Scroll</span></motion.a>
        </div>
      </div>
    </section>
  );
}

function Marquee({ still }: { still: boolean }) {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skew = useSpring(useTransform(velocity, [-2500, 0, 2500], [7, 0, -7], { clamp: true }), { stiffness: 220, damping: 40 });
  const items = [...profile.specialties, ...profile.specialties];
  return (
    <div className={`marquee ${still ? "is-paused" : ""}`} data-tone="dark" aria-label={`Specialties: ${profile.specialties.join(", ")}`}>
      <motion.div className="marquee-skew" style={still ? undefined : { skewX: skew }}>
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map(r => <div className="marquee-set" key={r}>{items.map((t, i) => <span key={i} className={i % 2 ? "serif" : ""}>{t}<i>✳</i></span>)}</div>)}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Statement (about): words light up as you read                       */
/* ------------------------------------------------------------------ */

function About() {
  return (
    <section id="about" className="about" data-tone="light">
      <div className="wrap">
        <div className="about-top"><Label index="01">About</Label><h2 className="about-hi">Hi, I’m <em>Romit.</em></h2></div>
        <p className="statement">{profile.aboutLead}</p>
        <div className="about-grid">
          <p className="about-body">{profile.aboutBody}</p>
          <div className="edu">
            <span className="edu-label">Education · {education.period}</span>
            <h3>{education.degree}</h3>
            <p>{education.school}</p>
            <div className="edu-tags">{education.focus.map(f => <span key={f}>{f}</span>)}</div>
          </div>
          <div className="about-links">
            <a href={links.github} target="_blank" rel="noopener noreferrer" className="row-link" data-cursor="Open"><Github size={18} /><span>GitHub</span><span className="row-link-meta">romit-23</span><ArrowUpRight size={18} /></a>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="row-link" data-cursor="Open"><Linkedin size={18} /><span>LinkedIn</span><span className="row-link-meta">romit-addagatla</span><ArrowUpRight size={18} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Work: horizontal gallery pinned while you scroll                    */
/* ------------------------------------------------------------------ */

function ProjectPanel({ project, onOpen, onFocusPanel }: { project: Project; onOpen: (el: HTMLButtonElement) => void; onFocusPanel?: () => void }) {
  return (
    <article className="panel" onFocus={onFocusPanel}>
      <div className="panel-copy">
        <div className="panel-top"><span className="panel-num">{project.number}</span><span className="panel-cat">{project.category}</span></div>
        <h3>{project.title}</h3>
        <p className="panel-sub">{project.subtitle}</p>
        <p className="panel-desc">{project.description}</p>
        <div className="tags">{project.tags.map(t => <span key={t}>{t}</span>)}</div>
        <div className="panel-actions">
          <button className="btn btn-signal" onClick={e => onOpen(e.currentTarget)} aria-label={`Explore ${project.title}`} data-cursor="Open"><span>Explore project</span><ArrowRight size={16} aria-hidden="true" /></button>
          <a className="btn btn-line" href={project.link} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} source on GitHub`} data-cursor="GitHub"><Github size={16} /><span>Source</span></a>
          {"publication" in project && <span className="ieee-badge"><BookOpen size={13} />IEEE published</span>}
        </div>
      </div>
      <div className="panel-visual"><ProjectDiagram project={project} /></div>
    </article>
  );
}

function Work({ pinned, onOpen, onFocusPanel }: { pinned: boolean; onOpen: (p: Project, el: HTMLButtonElement) => void; onFocusPanel: (i: number) => void }) {
  return (
    <section id="work" className="work" data-tone="dark">
      <div className="wrap work-head">
        <Label index="02">Selected work</Label>
        <h2 className="title">Ideas, put to <em>work.</em></h2>
        <p className="work-intro">Four projects across agentic AI, research tools, ML, and computer vision.</p>
      </div>
      {/* Structure stays identical in both modes so GSAP's pin wrapper never fights React. */}
      <div className={pinned ? "gallery is-pinned" : "gallery"}>
        <div className="gallery-stage">
          <div className="gallery-track">
            {projects.map((p, i) => <ProjectPanel key={p.id} project={p} onOpen={el => onOpen(p, el)} onFocusPanel={() => onFocusPanel(i)} />)}
            <a className="panel-end" href={links.github} target="_blank" rel="noopener noreferrer" data-cursor="GitHub" onFocus={() => onFocusPanel(projects.length)} tabIndex={pinned ? undefined : -1} aria-hidden={pinned ? undefined : true}><span className="panel-end-label">More on GitHub</span><span className="panel-end-handle">romit-23</span><ArrowUpRight size={40} /></a>
          </div>
          <div className="gallery-progress" aria-hidden="true"><span className="gallery-count">01 / 0{projects.length}</span><div className="gallery-bar"><span /></div><span className="gallery-hint">Keep scrolling</span></div>
        </div>
      </div>
      <div className="wrap github-wrap"><a className="row-link github-row" href={links.github} target="_blank" rel="noopener noreferrer"><Github size={18} /><span>Explore the code, architecture, and implementation on GitHub.</span><span className="row-link-meta">romit-23</span><ArrowUpRight size={18} /></a></div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Publication, experience, toolkit, contact                           */
/* ------------------------------------------------------------------ */

function Publication() {
  const g = projects.find(p => p.id === "guardnet")!;
  const steps = [
    { k: "Input", t: "CCTV footage" },
    { k: "Spatial features", t: "ConvNeXt-Tiny" },
    { k: "Temporal modelling", t: "LSTM" },
    { k: "Focus", t: "Attention" },
    { k: "Output", t: "Real-time violence detection" },
  ];
  return (
    <section id="publication" className="publication" data-tone="light">
      <div className="wrap pub-grid">
        <div className="pub-copy">
          <Label index="03">Published research</Label>
          <h2 className="title">GuardNet<span className="signal">.</span></h2>
          <p className="pub-sub"><em>{g.subtitle}</em></p>
          <p className="pub-desc">{g.description}</p>
          <div className="pub-actions">
            <a className="btn btn-ink" href={links.ieee} target="_blank" rel="noopener noreferrer" data-cursor="Read"><BookOpen size={17} /><span>Read on IEEE Xplore</span></a>
            <a className="btn btn-line" href={g.link} target="_blank" rel="noopener noreferrer" data-cursor="GitHub"><Github size={17} /><span>View source</span></a>
          </div>
        </div>
        <ol className="arch" aria-label="GuardNet architecture">
          <svg className="arch-wire" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true"><Pulse d="M1 0 V100" /><Pulse d="M1 0 V100" delay={1.5} /></svg>
          {steps.map((s, i) => <li key={s.t} className={i === 1 ? "is-key" : ""}><span className="arch-n">0{i + 1}</span><span className="arch-k">{s.k}</span><strong>{s.t}</strong></li>)}
          <li className="arch-stack" aria-label="Stack">{g.tags.map(t => <span key={t}>{t}</span>)}</li>
        </ol>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section id="experience" className="experience" data-tone="light">
      <div className="wrap">
        <div className="section-head"><Label index="04">Experience</Label><h2 className="title">Research to <em>real-world.</em></h2><p className="section-aside">Building, shipping, and refining AI systems in practice.</p></div>
        <ol className="xp">
          {experience.map(job => <li key={job.role} className="xp-row"><span className="xp-rule" aria-hidden="true" />
            <div className="xp-head">
              <span className="xp-period">{job.period}</span>
              <h3>{job.role}</h3>
              <span className="xp-company">{job.company}{job.current && <span className="xp-now">Current role</span>}</span>
              <span className="xp-place">{job.place}</span>
            </div>
            <div className="xp-body">
              <ul>{job.bullets.map(b => <li key={b}>{b}</li>)}</ul>
              <div className="tags">{job.tags.map(t => <span key={t}>{t}</span>)}</div>
            </div>
          </li>)}
        </ol>
      </div>
    </section>
  );
}

function Toolkit() {
  return (
    <section id="toolkit" className="toolkit" data-tone="dark">
      <div className="wrap">
        <div className="section-head"><Label index="05">Toolkit</Label><h2 className="title">The stack behind <em>the systems.</em></h2></div>
        <div className="stack">
          {toolkit.map(col => <div className="stack-col" key={col.id}>
            <h3>{col.name}</h3>
            {col.groups.map(g => <div className="stack-group" key={g.label}>
              <span className="stack-label">{g.label}</span>
              <div className="chips">{g.skills.map(s => <span key={s}>{s}</span>)}</div>
            </div>)}
          </div>)}
        </div>
      </div>
    </section>
  );
}

function Contact({ copied, copyError, onCopy }: { copied: boolean; copyError: boolean; onCopy: () => void }) {
  return (
    <section id="contact" className="contact" data-tone="signal">
      <div className="wrap">
        <Label index="06">Get in touch</Label>
        <h2 className="contact-title">Let’s make the next <em>connection.</em></h2>
        <a className="contact-email" href={`mailto:${email}`} data-cursor="Write"><span>{email}</span><ArrowUpRight aria-hidden="true" /></a>
        <div className="contact-actions">
          <button onClick={onCopy} className="btn btn-ink" aria-label="Copy email address" data-cursor="Copy">{copied ? <Check size={18} /> : <Copy size={18} />}<span>{copied ? "Copied" : "Copy email"}</span></button>
          <a href={resumeUrl} download className="btn btn-line-ink" data-cursor="PDF"><Download size={18} /><span>Resume</span></a>
          <a href={links.github} target="_blank" rel="noopener noreferrer" className="btn btn-line-ink" data-cursor="Open"><Github size={18} /><span>GitHub</span></a>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-line-ink" data-cursor="Open"><Linkedin size={18} /><span>LinkedIn</span></a>
        </div>
        <span role="status" className="sr-only">{copyError ? "Copy unavailable. You can select the email address or open the email link." : copied ? "Email address copied." : ""}</span>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [selected, setSelected] = useState<Project | null>(null), [paused, setPaused] = useState(false), [copied, setCopied] = useState(false), [copyError, setCopyError] = useState(false), [palette, setPalette] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const reduce = useMotionPreference(), still = paused || reduce;
  const wide = useMedia("(min-width: 1000px) and (min-height: 620px)");
  const rootRef = useRef<HTMLDivElement>(null);
  const pinned = wide && !reduce;
  const { focusPanel } = useScrollFX(rootRef, { pinned });
  // Smooth scroll pauses while the project sheet or quick search is open.
  useEffect(() => { if (!selected) return; lockScroll(true); return () => lockScroll(false); }, [selected]);
  useEffect(() => { if (!palette) return; lockScroll(true); return () => lockScroll(false); }, [palette]);
  const { scrollYProgress } = useScroll(), progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(p => !p); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true); setCopyError(false);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch { setCopyError(true); }
  }
  const go = (id: string) => scrollToId(id, !still);
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  const paletteItems: PaletteItem[] = [
    ...[...nav, { id: "publication", label: "Publication" }, { id: "contact", label: "Contact" }].map(s => ({ id: `go-${s.id}`, group: "Go to", label: s.label, icon: <ArrowRight size={15} />, run: () => go(s.id) })),
    ...projects.map(p => ({ id: `project-${p.id}`, group: "Projects", label: p.title, hint: p.category.toLowerCase(), icon: <Code2 size={15} />, run: () => { trigger.current = null; setSelected(p); } })),
    { id: "copy-email", group: "Actions", label: "Copy email address", hint: email, icon: <Copy size={15} />, run: copyEmail },
    { id: "send-email", group: "Actions", label: "Send an email", icon: <Mail size={15} />, run: () => { window.location.href = `mailto:${email}`; } },
    { id: "resume", group: "Actions", label: "Download resume", hint: "PDF", icon: <Download size={15} />, run: () => { const a = document.createElement("a"); a.href = resumeUrl; a.download = ""; a.click(); } },
    { id: "github", group: "Links", label: "GitHub", hint: "romit-23", icon: <Github size={15} />, run: () => open(links.github) },
    { id: "linkedin", group: "Links", label: "LinkedIn", hint: "romit-addagatla", icon: <Linkedin size={15} />, run: () => open(links.linkedin) },
    { id: "ieee", group: "Links", label: "GuardNet on IEEE Xplore", icon: <BookOpen size={15} />, run: () => open(links.ieee) },
    { id: "theme", group: "Actions", label: "Toggle dark / light mode", hint: "theme", icon: <Moon size={15} />, run: () => setTheme(currentTheme() === "dark" ? "light" : "dark") },
  ];

  return <MotionConfig reducedMotion="user"><div ref={rootRef} className={still ? "site motion-paused" : "site"}>
    <a className="skip-link" href="#main">Skip to content</a>
    <motion.div className="scroll-progress" style={{ scaleX: still ? scrollYProgress : progress }} aria-hidden="true" />
    <Cursor disabled={reduce} />
    <Header onPalette={() => setPalette(true)} still={still} />
    <CommandPalette open={palette} onOpenChange={setPalette} items={paletteItems} />

    <main id="main">
      <Hero still={still} />
      <Marquee still={still} />
      <About />
      <Work pinned={pinned} onOpen={(p, el) => { trigger.current = el; setSelected(p); }} onFocusPanel={focusPanel} />
      <Publication />
      <Experience />
      <Toolkit />
      <Contact copied={copied} copyError={copyError} onCopy={copyEmail} />
    </main>

    <DialogPrimitive.Root open={!!selected} onOpenChange={o => { if (!o) setSelected(null); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="overlay" />
        {selected && <DialogPrimitive.Content className="sheet" data-lenis-prevent onCloseAutoFocus={e => { e.preventDefault(); trigger.current?.focus(); }}>
          <div className="sheet-head">
            <span className="label"><span className="label-index">({selected.number})</span>{selected.category}</span>
            <DialogPrimitive.Close className="sheet-close" aria-label="Close"><X size={20} /></DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Title className="sheet-title">{selected.title}</DialogPrimitive.Title>
          <p className="sheet-sub"><em>{selected.subtitle}</em></p>
          <DialogPrimitive.Description className="sheet-desc">{selected.description}</DialogPrimitive.Description>
          <div className="sheet-visual"><ProjectDiagram project={selected} /></div>
          <h3 className="sheet-h">Inside the project</h3>
          <ul className="sheet-list">{selected.details.map(d => <li key={d}>{d}</li>)}</ul>
          <div className="tags">{selected.tags.map(t => <span key={t}>{t}</span>)}</div>
          <div className="sheet-actions">
            <a className="btn btn-signal" href={selected.link} target="_blank" rel="noopener noreferrer"><Github size={17} /><span>View source on GitHub</span></a>
            {"publication" in selected && <a className="btn btn-line" href={selected.publication} target="_blank" rel="noopener noreferrer"><BookOpen size={17} /><span>IEEE publication</span></a>}
          </div>
        </DialogPrimitive.Content>}
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>

    <footer className="footer" data-tone="dark">
      <div className="wrap footer-row">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <div className="footer-actions">
          <a href="#home" className="footer-link" data-cursor="Up"><Scramble text="Back to top" disabled={still} /></a>
          <button className="footer-icon" onClick={() => setPalette(true)} aria-label="Open quick search"><Search size={16} /></button>
          <a className="footer-icon" href={links.github} target="_blank" rel="noopener noreferrer" aria-label="Romit on GitHub"><Github size={18} /></a>
          <a className="footer-icon" href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Romit on LinkedIn"><Linkedin size={18} /></a>
          <button className="motion-toggle" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Resume decorative animations" : "Pause decorative animations"}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>Motion {still ? "off" : "on"}</span></button>
        </div>
      </div>
      <div className="footer-giant" aria-hidden="true">
        <div className="footer-name-wrap">
          <span className="footer-name-word">Romit</span>
          <span className="footer-name-word footer-name-word--accent">Addagatla</span>
        </div>
      </div>
    </footer>
    <AnimatePresence>{copied && <motion.div className="toast" role="status" initial={still ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><Check size={16} />Email copied to clipboard</motion.div>}</AnimatePresence>
  </div></MotionConfig>;
}

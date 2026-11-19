# Romit Addagatla — AI Engineering Portfolio

Personal portfolio of **Romit Addagatla**, Python AI Engineer in Mumbai, who builds multi-agent workflows, RAG pipelines, and REST APIs.

GitHub Pages address: https://romit-23.github.io/MyPortfolio/
(The live address shows whatever was last built and pushed to `main`. This redesign is local until it is committed and pushed.)

![Hero: oversized name over an interactive dot field](docs/screenshots/hero.png)

## The design

An editorial layout with one signal-orange accent, in **light and dark themes**. In light mode the page is warm "paper" with ink-black bands. In dark mode paper and ink trade places, the bands sit a notch lighter than the page, and the orange contact band stays orange.

Scrolling is smoothed by [Lenis](https://github.com/darkroomengineering/lenis), and the scroll choreography is built with [GSAP](https://gsap.com) ScrollTrigger and SplitText. Both share one animation clock, so pinned and scrubbed effects stay exactly in step with the smooth scroll.

| Section | What happens |
| --- | --- |
| **Hero** | The name is revealed letter by letter over a field of dots. The dots swell and turn orange around your cursor while a slow wave keeps them moving. As you scroll away, the two halves of the name drift apart and the hero fades. |
| **Marquee** | The specialties scroll in an endless band that leans with your scroll speed. |
| **About** | The summary lights up word by word as you scroll through it. Education and links rise in after it. |
| **Selected work** | GSAP pins the section, and the four projects slide sideways one-for-one with your scroll. Inside each panel, the large number and the diagram move at different speeds for depth. Each project opens a full-height detail sheet. |
| **Publication** | GuardNet, published at IEEE. Its model pipeline steps cascade in. |
| **Experience** | Three roles in large type. Each row draws its rule line, then its content rises in. |
| **Toolkit** | The full stack in three columns. The skill chips pop in in batches and react when you hover them. |
| **Contact** | A full-bleed orange band with a large email link, copy button, and links. |
| **Footer** | The name, set at full width. Each letter rises out of its own mask in a stagger, scrubbed to your scroll, and settles exactly as you reach the bottom of the page. |

### Dark mode

The sun/moon button in the header switches themes, and so does "Toggle dark / light mode" in quick search. The new theme spreads out in a circle from the button. On a first visit the site follows the system setting; after that it remembers the visitor's choice. A small script in `<head>` applies the theme before the page paints, so there is no flash of the wrong colours.

![Dark hero](docs/screenshots/dark-hero.png)

![Dark work gallery](docs/screenshots/dark-work-gallery.png)

<p>
  <img src="docs/screenshots/dark-about.png" alt="Dark about section" width="49%" />
  <img src="docs/screenshots/dark-experience.png" alt="Dark experience section" width="49%" />
</p>

<p>
  <img src="docs/screenshots/dark-mobile-hero.png" alt="Dark mobile hero" width="260" />
  &nbsp;
  <img src="docs/screenshots/dark-mobile-menu.png" alt="Dark mobile menu" width="260" />
</p>

## Typography

Type follows the [better-typography](https://github.com/jakubkrehel/skills) guidelines:

| Role | Typeface |
| --- | --- |
| Headings and display text | **Bricolage Grotesque**, a variable font with optical sizing, so large headings automatically get its display cut |
| Body and interface | **Geist**, a text cut built for reading sizes |
| Labels, numbers, code-like details | **Geist Mono** |
| Italic accents | **Instrument Serif** |

- All four are self-hosted through Fontsource, with no external font requests.
- Font sizes are set in `rem`, so a visitor's browser font-size setting still applies.
- Line heights are unitless, and letter-spacing is in `em` and tuned for each size.
- Long text is capped at 65 characters per line. Headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`.
- Changing numbers (dates, the gallery counter) use tabular figures.
- Buttons and pills trim their text box so labels sit optically centred.
- Underlines follow the font's own metrics.

### Selected work

![Work section intro](docs/screenshots/work-intro.png)

![Pinned work gallery](docs/screenshots/work.png)

![Gallery mid-scroll](docs/screenshots/work-gallery.png)

![Project detail sheet](docs/screenshots/project-sheet.png)

### About, publication, experience, toolkit

![About](docs/screenshots/about.png)

![Publication](docs/screenshots/publication.png)

![Experience](docs/screenshots/experience.png)

![Toolkit](docs/screenshots/toolkit.png)

### Contact and footer

![Contact](docs/screenshots/contact.png)

![Footer](docs/screenshots/footer.png)

### Quick search (Ctrl+K / ⌘K)

Press **Ctrl+K** (⌘K on macOS), or use the search button in the header or footer. From there you can jump to any section, open a project, copy the email, download the resume, or open GitHub, LinkedIn and the IEEE paper. ↑ and ↓ move, Enter opens, Esc closes.

![Quick search](docs/screenshots/quick-search.png)

### Mobile

<p>
  <img src="docs/screenshots/mobile-hero.png" alt="Mobile hero" width="260" />
  &nbsp;
  <img src="docs/screenshots/mobile-menu.png" alt="Mobile menu" width="260" />
  &nbsp;
  <img src="docs/screenshots/mobile-work.png" alt="Mobile project card" width="260" />
</p>

## Interaction details

- **Custom cursor:** a dot and a trailing ring. The ring grows over links and shows labels such as "Open", "PDF" and "Copy". It appears only with a mouse, after the first movement, so touch screens keep their normal behaviour.
- **Scramble text:** navigation and footer links briefly decode through random characters when hovered or focused. Screen readers always get the real word.
- **Section titles:** each line rises out of a mask as it enters (GSAP SplitText). The lines re-split automatically when the window resizes or the fonts load.
- **Magnetic buttons:** the primary buttons lean toward a mouse pointer.
- **Header:** inverts automatically over dark and orange sections.
- **Buttons and links:** colour fills sweep in on hover, arrows nudge, and buttons press down on click.
- **Diagrams:** each project has a schematic of its pipeline with light pulses running along the wires. The diagrams show only what the resume describes and invent no scores, screenshots or metrics.

## Accessibility and motion

- A skip link is provided, and one high-contrast focus ring works on paper, ink and orange, in both themes.
- Text on the orange band is fixed to black in both themes so it keeps its contrast.
- Dialogs return focus to the button that opened them.
- When a keyboard user tabs into a project in the sideways gallery, the page jumps so that project is in view.
- Smooth scrolling pauses while a sheet, the quick search or the mobile menu is open, and those panels scroll natively. Touch scrolling is always native.
- Elements fade in using opacity only, never `visibility`, so screen readers and in-page search can find all text before it animates.
- Every button and link outside running text is at least 44 px tall (measured at 1440, 1024, 768 and 390 px wide).
- With `prefers-reduced-motion` turned on:
  - Smooth scrolling is off, and no GSAP animation runs (everything sits inside `gsap.matchMedia()`).
  - The dot field shows a still frame.
  - The letters, marquee and diagram pulses stop.
  - The work gallery becomes a vertical stack.
  - The custom cursor is off.
- The footer's **Motion on/off** button pauses the looping animations: the marquee, the diagram pulses, the dot field's wave and the hero letters. Smooth scrolling and the scroll-linked effects keep running, because they move only when you scroll.

## Content

All text, facts, dates and links are carried over unchanged from the previous version of the site, which was built from the shared resume ([`site/resume.tex`](site/resume.tex)). Nothing new was added. The headings and short labels (for example "Selected work" or "Keep scrolling") are design copy and add no facts.

## Run locally

Run these commands inside this folder, where `package.json` lives (Node 22.13+):

```bash
npm install
npm run dev
```

Open the local URL Vite prints, including `/MyPortfolio/` (for example http://localhost:5173/MyPortfolio/).

## Build and preview

```bash
npm run typecheck
npm run build
npm run preview
```

The build first creates `.build/`, then copies the finished static HTML, assets and resume to the repository root. The repository root on `main` is the existing GitHub Pages source. If the build fails, the previous root files are left untouched.

To publish, commit both the source changes and the generated files, then push `main`.

To roll back, revert the commit and push again.

## Verify

While `npm run preview` is running:

```bash
# macOS / Linux
PORTFOLIO_URL=http://localhost:4173/MyPortfolio npm run verify
```

```powershell
# Windows PowerShell
$env:PORTFOLIO_URL = "http://localhost:4173/MyPortfolio"; npm run verify
```

The script uses an installed Google Chrome (set `CHROME_PATH` to use another Chromium). It checks:

- The resume content is present and previously removed claims are absent.
- Every external link is one of the original links.
- GSAP pins the gallery and it scrolls sideways.
- Each project sheet has the right links, closes on Escape and returns focus, and keyboard focus brings its panel into view.
- Quick search works.
- The theme toggle flips the colours, the choice survives a reload, and a first visit follows the system colour scheme.
- Both resume URLs serve the original PDF.
- Copying the email and the motion toggle work.
- There is no horizontal overflow at 1440, 1024, 768, 390 and 320 px, and the mobile menu works.
- Reduced motion and touch behave as described above.
- The browser reports no runtime errors.

Screenshots are written to the ignored `outputs/` folder.

### Mobile and tablet audit

```bash
# macOS / Linux
PORTFOLIO_URL=http://localhost:4173/MyPortfolio npm run verify:mobile
```

```powershell
# Windows PowerShell
$env:PORTFOLIO_URL = "http://localhost:4173/MyPortfolio"; npm run verify:mobile
```

This runs the site on 10 device sizes as touch devices:

| Group | Sizes |
| --- | --- |
| Phones | 320, 360, 375, 393 (dark) and 412 |
| Landscape phone | 852×393 |
| iPads | iPad mini, iPad Air (dark) and iPad Pro |
| Landscape tablet | 1180×820 |

On each one it checks:

- No sideways scrolling, and nothing on screen poking past the edges.
- No clipped labels, and no overlapping controls in rows.
- Every tap target is at least 44 px, and no text is below about 10.5 px.
- The hero name and main button fit the first screen.
- The menu fits and doesn't run under the header, its links land in the right place, and it closes afterwards.
- The project sheet fits the screen and closes.
- Quick search fits the screen.
- The gallery is pinned or stacked as expected for the screen size.
- Every footer letter lands at the bottom of the page.
- The email stays on one line.

A screenshot of every section on every device goes to `outputs/mobile/`.

## Edit

| File | Purpose |
| --- | --- |
| `site/app/content.ts` | All content: profile, projects, experience, toolkit, education, email, and links |
| `site/app/page.tsx` | Page layout, sections, gallery, sheet, quick search |
| `site/app/fx.ts` | All GSAP scroll choreography (ScrollTrigger, SplitText, pin, magnetic buttons) |
| `site/lib/smooth.ts` | Lenis smooth scroll, wired to GSAP's ticker; pause/resume helpers |
| `site/lib/theme.ts` | Light/dark theme: apply, remember, circular reveal |
| `site/app/globals.css` | Design tokens (light and dark), typography, layout, responsiveness, animation |
| `site/components/dot-field.tsx` | Interactive canvas dot field behind the hero |
| `site/components/cursor.tsx` | Custom cursor |
| `site/components/scramble.tsx` | Hover scramble text |
| `site/components/project-diagram.tsx` | Animated project schematics |
| `site/public/Romit-Addagatla-Resume.pdf` | The exact PDF supplied through [Google Drive](https://drive.google.com/file/d/1usb3TlPHBtoR4Z3ScONdjTCy2A6WqPtc/view), updated on October 6, 2026 |
| `site/index.html` | Page metadata, favicon, and the pre-paint theme script |
| `site/resume.tex` | An editable LaTeX copy of the resume. The site publishes the original PDF and does not regenerate it from this file. |
| `docs/screenshots/` | The screenshots in this README |

The root `index.html` is generated by the build, so edit `site/index.html` instead. The older `ML-Resume-Romit-2026.pdf` filename is kept as an alias that serves the same PDF. When you replace the resume, update both PDFs in `site/public/` before building.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · GSAP (ScrollTrigger, SplitText, @gsap/react) · Lenis · Motion · Radix UI · lucide-react · Canvas 2D · Fontsource (Bricolage Grotesque, Geist, Geist Mono, Instrument Serif) · View Transitions API · Playwright (verification)

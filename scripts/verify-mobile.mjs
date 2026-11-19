// Mobile and tablet audit across real device sizes. Run against `npm run preview`:
//   PORTFOLIO_URL=http://localhost:4173/MyPortfolio npm run verify:mobile
// Screenshots of every section per device are written to outputs/mobile/.
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const base = (process.env.PORTFOLIO_URL || 'http://localhost:4173/MyPortfolio').replace(/\/$/, '');
const outDir = new URL('../outputs/mobile/', import.meta.url);
await fs.mkdir(outDir, { recursive: true });
const shot = name => fileURLToPath(new URL(name, outDir));

const touch = { isMobile: true, hasTouch: true };
const devices = [
  { name: 'small-320', viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, ...touch },
  { name: 'galaxy-360', viewport: { width: 360, height: 740 }, deviceScaleFactor: 3, ...touch },
  { name: 'iphone-se-375', viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, ...touch },
  { name: 'iphone-393-dark', viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, colorScheme: 'dark', ...touch },
  { name: 'pixel-412', viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.6, ...touch },
  { name: 'phone-landscape-852', viewport: { width: 852, height: 393 }, deviceScaleFactor: 3, ...touch },
  { name: 'ipad-mini-768', viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, ...touch },
  { name: 'ipad-air-820-dark', viewport: { width: 820, height: 1180 }, deviceScaleFactor: 2, colorScheme: 'dark', ...touch },
  { name: 'ipad-pro-1024', viewport: { width: 1024, height: 1366 }, deviceScaleFactor: 2, ...touch },
  { name: 'tablet-landscape-1180', viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, ...touch },
];
const sections = ['home', 'about', 'work', 'publication', 'experience', 'toolkit', 'contact'];

/** In-page layout checks; returns a list of problems (empty = pass). */
function layoutProblems() {
  const vw = document.documentElement.clientWidth, problems = [];
  // Fully transparent (an element still waiting for its entrance animation) is not visible.
  const transparent = el => { for (let n = el; n && n !== document.body; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) < 0.05) return true; return false; };
  // Only what is on screen now: elements further down may still sit in their pre-animation positions.
  const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && s.visibility !== 'hidden' && !transparent(el) && s.display !== 'none' && !el.closest('[aria-hidden="true"], .cursor'); };
  // Intentionally wider than the screen: marquee loop, sideways gallery track, giant hero/footer type in their masks.
  const allowedWide = el => el.closest('.marquee, .gallery-track, .hero-name, .footer-giant, .gallery-stage');
  const label = el => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 28)}"`;

  if (document.documentElement.scrollWidth > vw + 1) problems.push(`page scrolls sideways (${document.documentElement.scrollWidth}px > ${vw}px)`);
  for (const el of document.querySelectorAll('main *, header *, footer *')) {
    if (!visible(el) || allowedWide(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) problems.push(`off-screen: ${label(el)} (${Math.round(r.left)}–${Math.round(r.right)})`);
  }
  // Text clipped inside its own box (overflow hidden on buttons, chips, labels).
  for (const el of document.querySelectorAll('a, button, .tags span, .chips span, .label, h1, h2, h3, p')) {
    if (!visible(el) || allowedWide(el) || el.closest('.scramble')) continue;
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') problems.push(`text clipped: ${label(el)}`);
  }
  // Tap targets outside running text.
  for (const el of document.querySelectorAll('a, button')) {
    if (!visible(el) || el.closest('p') || allowedWide(el) || el.classList.contains('skip-link')) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 43.5) problems.push(`tap target ${Math.round(r.height)}px: ${label(el)}`);
  }
  // Siblings that overlap inside rows of controls.
  for (const row of document.querySelectorAll('.header-actions, .hero-meta, .hero-ctas, .panel-actions, .contact-actions, .footer-actions, .xp-head, .panel-top, .pub-actions, .tags, .chips')) {
    const kids = [...row.children].filter(visible);
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const a = kids[i].getBoundingClientRect(), b = kids[j].getBoundingClientRect();
      const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (ox > 2 && oy > 2) problems.push(`overlap in .${row.className.split(' ')[0]}: ${label(kids[i])} × ${label(kids[j])}`);
    }
  }
  // Smallest visible text.
  for (const el of document.querySelectorAll('main *, header *, footer *')) {
    if (!visible(el) || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 10.5) problems.push(`tiny text ${size}px: ${label(el)}`);
  }
  return [...new Set(problems)];
}

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, headless: true } : { channel: 'chrome', headless: true });
const report = [];
let failures = 0;
try {
  for (const d of devices) {
    const { name, ...options } = d;
    const ctx = await browser.newContext(options);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1600);
    await page.evaluate(() => { const s = document.createElement('style'); s.textContent = '.cursor{display:none!important}'; document.head.appendChild(s); });
    const vh = options.viewport.height, vw = options.viewport.width;
    const problems = [];
    const add = (where, list) => list.forEach(p => problems.push(`[${where}] ${p}`));
    let pinned = false;
    try {

    // Hero: the name and the main button are on the first screen (or the name at least, on short landscape screens).
    const hero = await page.evaluate(() => { const h = document.querySelector('.hero-name').getBoundingClientRect(), c = document.querySelector('.hero-ctas .btn').getBoundingClientRect(); return { nameBottom: h.bottom, ctaBottom: c.bottom }; });
    if (hero.nameBottom > vh) problems.push(`[hero] name runs below the first screen (${Math.round(hero.nameBottom)} > ${vh})`);
    if (vh >= 560 && hero.ctaBottom > vh + 1) problems.push(`[hero] main button below the first screen (${Math.round(hero.ctaBottom)} > ${vh})`);

    // Walk each section, let its animations settle, check layout and screenshot it.
    for (const id of sections) {
      await page.evaluate(i => { const el = document.getElementById(i); scrollTo(0, el.getBoundingClientRect().top + scrollY - (i === 'home' ? 0 : 64)); }, id);
      await page.waitForTimeout(1500);
      add(id, await page.evaluate(layoutProblems));
      await page.screenshot({ path: shot(`${name}-${id}.png`) });
    }

    // Gallery mode: pinned sideways only on wide, tall screens; stacked otherwise.
    pinned = await page.evaluate(() => document.querySelector('.gallery').classList.contains('is-pinned'));
    const shouldPin = vw >= 1000 && vh >= 620;
    if (pinned !== shouldPin) problems.push(`[work] gallery ${pinned ? 'pinned' : 'stacked'}, expected ${shouldPin ? 'pinned' : 'stacked'}`);
    if (pinned) {
      const fit = await page.evaluate(() => { const p = document.querySelector('.panel').getBoundingClientRect(); return { h: p.height, vh: innerHeight }; });
      if (fit.h > fit.vh - 72) problems.push(`[work] pinned panel taller than the screen (${Math.round(fit.h)}px)`);
    }

    // Bottom of the page: every footer letter has landed inside the footer.
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(1800);
    const foot = await page.evaluate(() => {
      const f = document.querySelector('.footer').getBoundingClientRect();
      const chars = [...document.querySelectorAll('.footer-giant .sans div, .footer-giant .serif div')];
      const raised = chars.filter(c => Math.abs(new DOMMatrix(getComputedStyle(c).transform).m42) > 0.5).length;
      const lowest = Math.max(...chars.map(c => c.getBoundingClientRect().bottom), 0);
      const widest = Math.max(...[...document.querySelectorAll('.footer-giant .sans, .footer-giant .serif')].map(w => w.getBoundingClientRect().right));
      return { raised, letters: chars.length, inside: lowest <= f.bottom + 1, overflowRight: widest > document.documentElement.clientWidth + 1 };
    });
    if (foot.raised) problems.push(`[footer] ${foot.raised}/${foot.letters} letters not landed at the bottom of the page`);
    if (!foot.inside) problems.push('[footer] name cut off at the bottom');
    if (foot.overflowRight) problems.push('[footer] name wider than the screen');
    // The email should stay on one line in the contact band.
    if (await page.evaluate(() => { const e = document.querySelector('.contact-email span'); const r = document.createRange(); r.selectNodeContents(e); return r.getClientRects().length > 1; })) problems.push('[contact] email wraps onto two lines');
    add('footer', await page.evaluate(layoutProblems));
    await page.screenshot({ path: shot(`${name}-footer.png`) });

    // Menu (narrow screens): opens full-screen, a link lands its section under the header, menu closes.
    if (vw < 860) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(300);
      await page.getByRole('button', { name: 'Open navigation' }).tap();
      await page.waitForTimeout(500);
      await page.screenshot({ path: shot(`${name}-menu.png`) });
      const links = await page.evaluate(() => [...document.querySelectorAll('#main-navigation a')].map(a => { const r = a.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top >= 0; }));
      if (links.some(v => !v)) problems.push('[menu] not every menu link fits on screen');
      const underHeader = await page.evaluate(() => { const h = document.querySelector('.monogram').getBoundingClientRect().bottom; const first = document.querySelector('#main-navigation a').getBoundingClientRect().top; return first < h - 1; });
      if (underHeader) problems.push('[menu] first link sits under the header');
      await page.getByRole('navigation').getByRole('link', { name: 'Toolkit' }).tap();
      await page.waitForTimeout(2200);
      const landed = await page.evaluate(() => Math.round(document.getElementById('toolkit').getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header'))));
      if (Math.abs(landed) > 6) problems.push(`[menu] Toolkit link landed ${landed}px off`);
      if (await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded') !== 'false') problems.push('[menu] did not close after choosing a link');
    }

    // Project sheet: fits the screen, scrolls inside, closes with its button.
    await page.evaluate(() => document.getElementById('work').scrollIntoView());
    await page.waitForTimeout(1200);
    const trigger = page.getByRole('button', { name: 'Explore GuardNet', exact: true });
    // In the pinned gallery the panel is off to the side: focusing it scrolls it into view (site behaviour).
    if (pinned) await trigger.focus(); else await trigger.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);
    await trigger.tap();
    await page.waitForTimeout(800);
    const sheet = await page.evaluate(() => { const s = document.querySelector('.sheet'); const r = s.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, scrolls: s.scrollHeight > s.clientHeight }; });
    if (sheet.left < -1 || sheet.right > vw + 1 || sheet.top < -1 || sheet.bottom > vh + 1) problems.push(`[sheet] outside the screen ${JSON.stringify(sheet)}`);
    add('sheet', await page.evaluate(() => { const vw = document.documentElement.clientWidth; return [...document.querySelectorAll('.sheet *')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > vw + 1 || r.left < -1) && !el.closest('.diagram'); }).map(el => `off-screen in sheet: ${el.tagName.toLowerCase()}.${el.className}`); }));
    await page.screenshot({ path: shot(`${name}-sheet.png`) });
    await page.getByRole('button', { name: 'Close' }).tap();
    await page.waitForTimeout(600);
    if (await page.locator('.sheet').count()) problems.push('[sheet] did not close');

    // Quick search: fits the screen.
    await page.getByRole('button', { name: 'Open quick search' }).first().tap();
    await page.waitForTimeout(500);
    const pal = await page.evaluate(() => { const r = document.querySelector('.palette').getBoundingClientRect(); return { left: r.left, right: r.right, bottom: r.bottom }; });
    if (pal.left < 0 || pal.right > vw || pal.bottom > vh) problems.push(`[search] palette outside the screen ${JSON.stringify(pal)}`);
    await page.screenshot({ path: shot(`${name}-search.png`) });
    await page.keyboard.press('Escape');
    } catch (e) { problems.push(`[run] check stopped: ${String(e.message).split('\n')[0]}`); }

    if (errors.length) problems.push(...errors.map(e => `[console] ${e}`));
    failures += problems.length;
    report.push({ device: `${name} (${vw}×${vh}${options.colorScheme === 'dark' ? ', dark' : ''})`, gallery: pinned ? 'pinned' : 'stacked', problems });
    await ctx.close();
  }
} finally {
  await browser.close();
}
for (const r of report) {
  console.log(`${r.problems.length ? '✗' : '✓'} ${r.device} — gallery ${r.gallery}${r.problems.length ? '' : ', no problems'}`);
  for (const p of r.problems) console.log(`    ${p}`);
}
console.log(`\n${failures ? `${failures} problem(s)` : 'All devices passed'}. Screenshots: ${fileURLToPath(outDir)}`);
process.exitCode = failures ? 1 : 0;

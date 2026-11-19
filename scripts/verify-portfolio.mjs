// Browser checks for the portfolio. Run against `npm run preview`:
//   PORTFOLIO_URL=http://localhost:4173/MyPortfolio npm run verify
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium, expect } from '@playwright/test';

const base = (process.env.PORTFOLIO_URL || 'http://localhost:4173/MyPortfolio').replace(/\/$/, '');
const artifactPath = new URL('../outputs/', import.meta.url);
await fs.mkdir(artifactPath, { recursive: true });
// Uses installed Google Chrome by default; set CHROME_PATH to point at another Chromium build.
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, headless: true } : { channel: 'chrome', headless: true });
const shot = name => fileURLToPath(new URL(name, artifactPath));
const errors = [];
const checks = [];
const watch = page => {
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
};

// Where a section's top sits after in-page navigation: just under the fixed header.
const landed = (page, id) => expect.poll(() => page.evaluate(i => { const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')); return Math.abs(document.getElementById(i).getBoundingClientRect().top - h); }, id), { timeout: 6000 }).toBeLessThan(6);

const projects = [
  ['JobApply', 'https://github.com/romit-23/jobapply'],
  ['Research Reader', 'https://github.com/romit-23/research-reader'],
  ['Financial Fraud Detection System', 'https://github.com/romit-23/Fraud-Detection-Model'],
  ['GuardNet', 'https://github.com/romit-23/GuardNet'],
];
const allowedLinks = new Set([
  'https://github.com/romit-23', 'https://linkedin.com/in/romit-addagatla', 'https://ieeexplore.ieee.org/document/11284226',
  'mailto:addromit2307@gmail.com', ...projects.map(([, link]) => link),
]);

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  watch(page);
  const response = await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  await page.getByRole('heading', { name: 'Romit Addagatla', level: 1, exact: true }).waitFor();
  await page.waitForTimeout(1500);
  assert.equal(await page.title(), 'Romit Addagatla | AI Engineer');
  assert.equal(await page.locator('.panel').count(), 4);
  assert.equal(await page.locator('.xp-row').count(), 3);
  await page.screenshot({ path: shot('desktop-hero.png') });

  // Content: original resume wording present, previously removed claims absent.
  const text = await page.locator('body').innerText();
  for (const removed of ['RAG Pipeline for Hotels', 'Chatbots', 'GPT-5.4', 'Vision Transformers', 'IndicTrans2', 'TTSMMS', 'News, beyond language', 'Orbital', 'GTM', 'SMB', 'lead scoring', 'data enrichment']) {
    assert.equal(text.includes(removed), false, `Removed claim: ${removed}`);
  }
  assert.doesNotMatch(text, /\bNER\b/);
  for (const must of ['Shipped production multi-agent AI systems', 'persistent memory for context-aware retrieval', 'agricultural imagery', 'Four projects', 'SIES Graduate School of Technology', 'Production AI, from retrieval to autonomous agents.']) {
    assert.match(text, new RegExp(must.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing: ${must}`);
  }
  checks.push('Resume content present, four projects, three roles, no removed claims');

  // Every external link is one of the original links.
  const hrefs = await page.locator('a[href^="http"], a[href^="mailto:"]').evaluateAll(els => [...new Set(els.map(a => a.getAttribute('href')))]);
  for (const href of hrefs) assert(allowedLinks.has(href), `Unexpected external link: ${href}`);
  checks.push('Every external link is one of the original portfolio links');

  // Pinned gallery: scrolling vertically moves the track sideways.
  const gallery = page.locator('.gallery');
  assert.equal(await gallery.evaluate(el => el.classList.contains('is-pinned')), true, 'Gallery pinned at 1440');
  const galleryTop = await gallery.evaluate(el => el.getBoundingClientRect().top + scrollY);
  const trackX = () => page.locator('.gallery-track').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m41);
  await page.evaluate(y => scrollTo(0, y), galleryTop + 1500);
  await expect.poll(trackX).toBeLessThan(-500);
  await page.screenshot({ path: shot('gallery.png') });
  checks.push('Work gallery pins and scrolls horizontally');

  // Cursor label follows scrolling: hover 'More on GitHub', wheel past it without moving the mouse.
  const endTop = await page.evaluate(() => { const t = document.querySelector('.gallery-track'); const pin = document.querySelector('.gallery-stage').parentElement; return pin.getBoundingClientRect().top + scrollY + t.scrollWidth - innerWidth - 20; });
  await page.evaluate(y => scrollTo(0, y), endTop);
  await page.waitForTimeout(800);
  const card = await page.locator('.panel-end').boundingBox();
  await page.mouse.move(card.x + card.width / 2, card.y + card.height / 2);
  await expect(page.locator('.cursor')).toHaveClass(/has-label/);
  for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(60); }
  await page.waitForTimeout(1200);
  await expect(page.locator('.cursor')).not.toHaveClass(/has-label/);
  checks.push('Cursor label clears when scrolling moves the page away from the hovered card');

  await page.getByRole('navigation').getByRole('link', { name: 'Toolkit' }).click();
  await landed(page, 'toolkit');
  await page.getByRole('navigation').getByRole('link', { name: 'Work' }).click();
  await landed(page, 'work');
  checks.push('Header links land each section just under the header (past the pinned gallery too)');

  // Project sheets: correct links, Escape closes, focus returns, keyboard focus brings panels into view.
  await page.evaluate(() => scrollTo(0, 0));
  for (const [title, link] of projects) {
    const trigger = page.getByRole('button', { name: `Explore ${title}`, exact: true });
    await trigger.focus();
    await page.waitForTimeout(200);
    const box = await trigger.boundingBox();
    assert(box && box.x >= 0 && box.x + box.width <= 1440 && box.y >= 72 && box.y + box.height <= 900, `Focused "${title}" trigger is on screen: ${JSON.stringify(box)}`);
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: title });
    await dialog.waitFor();
    assert.equal(await dialog.getByRole('link', { name: 'View source on GitHub' }).getAttribute('href'), link);
    if (title === 'JobApply') { await expect(dialog).toContainText('five job boards'); await expect(dialog).toContainText('deduplication ledger'); }
    if (title === 'Research Reader') { await expect(dialog).toContainText('Markdown notes with export'); await expect(dialog).toContainText('Groq, DeepSeek, and Ollama'); }
    if (title === 'GuardNet') {
      assert.equal(await dialog.getByRole('link', { name: 'IEEE publication' }).getAttribute('href'), 'https://ieeexplore.ieee.org/document/11284226');
      await page.waitForTimeout(600);
      await page.screenshot({ path: shot('project-sheet.png') });
    }
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await expect(trigger).toBeFocused();
  }
  checks.push('Project sheets: links, IEEE link, Escape, focus return, focused panels scroll into view');

  // Quick search.
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Quick search' });
  await palette.waitFor();
  await page.keyboard.type('research');
  await expect(palette.getByRole('option').first()).toContainText('Research Reader');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Research Reader' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Open quick search' }).first().click();
  await page.keyboard.type('zzzz');
  await expect(page.getByRole('dialog', { name: 'Quick search' })).toContainText('No matches');
  await page.keyboard.press('Escape');
  checks.push('Quick search opens with Ctrl+K and the header button, filters, and opens projects');

  // Resume downloads serve the exact supplied PDF.
  const resumeLink = await page.getByRole('link', { name: 'Download resume', exact: true }).getAttribute('href');
  const resumeUrl = new URL(resumeLink, page.url()).href;
  assert.equal(new URL(resumeUrl).pathname, '/MyPortfolio/Romit-Addagatla-Resume.pdf');
  const source = await fs.readFile(new URL('../site/public/Romit-Addagatla-Resume.pdf', import.meta.url));
  const resume = await context.request.get(resumeUrl);
  assert.equal(resume.status(), 200);
  assert.deepEqual(await resume.body(), source);
  const legacy = await context.request.get(new URL('./ML-Resume-Romit-2026.pdf', page.url()).href);
  assert.equal(legacy.status(), 200);
  assert.deepEqual(await legacy.body(), source);
  checks.push('Both resume URLs serve the exact shared PDF');

  // Copy email and motion toggle.
  await page.getByRole('button', { name: 'Copy email address' }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'addromit2307@gmail.com');
  await page.getByRole('button', { name: 'Pause decorative animations' }).click();
  assert.equal(await page.locator('.marquee-track').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
  await page.getByRole('button', { name: 'Resume decorative animations' }).click();
  checks.push('Copy email and the motion toggle');

  // Theme: toggle flips light/dark, text and background invert, the choice survives a reload.
  const theme = () => page.evaluate(() => document.documentElement.dataset.theme);
  const colours = () => page.evaluate(() => { const b = getComputedStyle(document.body); return b.color + ' on ' + b.backgroundColor; });
  const start = await theme();
  const before = await colours();
  await page.getByRole('button', { name: /Switch to (dark|light) mode/ }).click();
  await expect.poll(theme).not.toBe(start);
  await expect.poll(colours).not.toBe(before);
  const flipped = await theme();
  assert.equal(await page.evaluate(() => localStorage.getItem('theme')), flipped);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await theme(), flipped, 'Theme persists across reload');
  await page.getByRole('button', { name: /Switch to (dark|light) mode/ }).click();
  await expect.poll(theme).toBe(start);
  await page.waitForTimeout(800);
  checks.push('Dark/light toggle flips colours and persists across reloads');

  // Responsive: no sideways scroll; mobile menu opens and closes.
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `No horizontal overflow at ${width}px`);
    if (width < 600) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await page.getByRole('navigation').getByRole('link', { name: 'Experience' }).click();
      await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
      await landed(page, 'experience');
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(400);
      await page.screenshot({ path: shot(`mobile-${width}.png`) });
      await page.getByRole('button', { name: 'Explore GuardNet', exact: true }).click();
      await page.waitForTimeout(700);
      const box = await page.getByRole('dialog').boundingBox();
      assert(box.x >= -1 && box.x + box.width <= width + 1, `Sheet inside ${width}px viewport`);
      await page.keyboard.press('Escape');
    }
  }
  checks.push('Responsive at 1440, 1024, 768, 390 and 320 px; mobile navigation; sheet fits');

  // Reduced motion: no loops, nothing hidden, gallery falls back to a vertical stack.
  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await reduced.newPage();
  watch(rp);
  await rp.goto(`${base}/`, { waitUntil: 'networkidle' });
  assert.equal(await rp.locator('.marquee-track').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.equal(await rp.locator('.gallery').evaluate(el => el.classList.contains('is-pinned')), false);
  const hidden = await rp.locator('.hero-name .ch').evaluateAll(els => els.filter(el => new DOMMatrix(getComputedStyle(el).transform).m42 !== 0).length);
  assert.equal(hidden, 0, 'Hero letters rest in place under reduced motion');
  assert.equal(await rp.evaluate(() => document.documentElement.classList.contains('has-cursor')), false);
  checks.push('Reduced motion: loops off, letters at rest, gallery stacked, native cursor kept');

  const darkCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const dp = await darkCtx.newPage();
  watch(dp);
  await dp.goto(`${base}/`, { waitUntil: 'networkidle' });
  assert.equal(await dp.evaluate(() => document.documentElement.dataset.theme), 'dark', 'First visit follows the system dark setting');
  checks.push('First visit follows the system colour scheme');

  // Touch: no custom cursor, no overflow.
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const tp = await touch.newPage();
  watch(tp);
  await tp.goto(`${base}/`, { waitUntil: 'networkidle' });
  assert.equal(await tp.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  assert.equal(await tp.evaluate(() => document.documentElement.classList.contains('has-cursor')), false);
  // Let the panel finish sliding in before tapping (a real visitor sees it first).
  const tapTarget = tp.getByRole('button', { name: 'Explore JobApply', exact: true });
  await tapTarget.scrollIntoViewIfNeeded();
  await tp.waitForTimeout(1500);
  await tapTarget.tap();
  await tp.getByRole('dialog', { name: 'JobApply' }).waitFor();
  checks.push('Touch screens: native cursor, no overflow, sheets open on tap');

  assert.deepEqual(errors, [], 'No browser runtime errors');
  checks.push('No browser runtime errors');
  console.log(JSON.stringify({ passed: checks, screenshots: fileURLToPath(artifactPath) }, null, 2));
} finally {
  await browser.close();
}

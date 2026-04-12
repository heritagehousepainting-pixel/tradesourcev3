import { chromium } from 'playwright';

const BASE = 'https://project-bdhbf.vercel.app';
const VIEWPORTS = {
  'Desktop': { width: 1440, height: 900 },
  '390px':   { width: 390,  height: 844 },
  '375px':   { width: 375,  height: 812 },
  '430px':   { width: 430,  height: 932 },
  '320px':   { width: 320,  height: 568 },
};

const FOUNDERS = {
  admin:   { email: 'info@tradesource.app',  password: 'Test1234' },
  mike:    { email: 'mike-thompson-1775755454641@gauntlet.test',  password: 'GauntletMike1!' },
  sarah:   { email: 'sarah-chen-1775755454641@gauntlet.test',   password: 'GauntletSarah2!' },
};

const results = {};
let passed = 0, failed = 0;

function score(r) { return r === 'PASS' ? '✓' : r === 'FAIL' ? '✗' : '~'; }

async function withBrowser(fn) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    return await fn(page, browser, ctx);
  } finally {
    await browser.close();
  }
}

async function checkDesktop(fn) {
  const vp = VIEWPORTS['Desktop'];
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });
  try {
    return await fn(page, browser);
  } finally {
    await browser.close();
  }
}

async function checkMobile(width, fn) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 844 });
  try {
    return await fn(page, browser);
  } finally {
    await browser.close();
  }
}

async function loginAs(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', email).catch(() => {});
  await page.fill('input[type="password"]', password).catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(2000);
}

async function founderLogin(page) {
  await page.goto(`${BASE}/founder-login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"]', FOUNDERS.admin.email).catch(() => {});
  await page.fill('input[type="password"]', FOUNDERS.admin.password).catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(2000);
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
async function auditHomepage() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P2' };

  // Desktop
  await checkDesktop(async (page) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    const footerCount = await page.locator('footer').count();
    const navVisible = await page.locator('nav, header').first().isVisible().catch(() => false);
    const heroText = await page.locator('section').first().textContent().catch(() => '').then(t => t?.slice(0, 80));
    const ctaBtns = await page.locator('button').count();
    const links = await page.locator('a').count();
    const hasStats = await page.locator('text=contractors').count();
    const hasCoverage = await page.locator('text=Montgomery').count();
    const hasPhase1 = await page.locator('text=Phase 1').count();

    if (footerCount !== 1) { r.desktop.layout = 'FAIL'; r.sim.push('Double footer: ' + footerCount + ' footers'); }
    if (!navVisible) { r.desktop.layout = 'FAIL'; r.sim.push('Nav not visible'); }
    if (ctaBtns < 2) { r.desktop.function = 'FAIL'; r.sim.push('Fewer than 2 CTA buttons'); }
    if (!hasCoverage) { r.desktop.ux = 'FAIL'; r.sim.push('No county coverage visible'); }
    if (!hasPhase1) { r.desktop.ux = 'FAIL'; r.sim.push('No Phase 1 indicator'); }

    r.exp.push(`H1: "${h1?.slice(0, 50)}"`);
    r.exp.push(`CTAs: ${ctaBtns}, Links: ${links}`);
    r.exp.push(`Stats row: ${hasStats > 0 ? 'YES' : 'MISSING'}`);
    r.exp.push(`Footer: ${footerCount} (expected 1)`);
  });

  // Mobile (375px)
  await checkMobile(375, async (page) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const footerCount = await page.locator('footer').count();
    const hamburger = await page.locator('button[class*="hamburger"], button[class*="menu"], [aria-label*="menu"]').count();
    const heroReadable = await page.locator('h1').first().isVisible().catch(() => false);
    const ctaVisible = await page.locator('button').first().isVisible().catch(() => false);
    const textOverflow = await page.evaluate(() => {
      const el = document.querySelector('h1');
      return el ? el.getBoundingClientRect().width > window.innerWidth : false;
    });

    if (footerCount !== 1) { r.mobile.layout = 'FAIL'; r.sim.push('Mobile double footer: ' + footerCount); }
    if (!heroReadable) { r.mobile.layout = 'FAIL'; r.sim.push('H1 not visible on mobile'); }
    if (!ctaVisible) { r.mobile.function = 'FAIL'; r.sim.push('CTA not visible on mobile'); }
    if (textOverflow) { r.mobile.ux = 'FAIL'; r.sim.push('H1 overflows mobile viewport'); }

    r.exp.push(`Hamburger: ${hamburger > 0 ? 'YES' : 'MISSING'}`);
    r.exp.push(`Hero readable: ${heroReadable}`);
    r.exp.push(`Text overflow: ${textOverflow}`);
  });

  return r;
}

// ─── JOBS BROWSE ──────────────────────────────────────────────────────────────
async function auditJobsBrowse() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P1' };

  await checkDesktop(async (page) => {
    await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    const filterBar = await page.locator('input, select').count();
    const cards = await page.locator('[class*="card"], [class*="job"]').count();
    const emptyState = await page.locator('text=/no jobs|empty|0 jobs/i').count();
    const footerCount = await page.locator('footer').count();

    if (emptyState > 0) { r.sim.push('Empty state shown — no jobs in DB'); }
    if (cards === 0 && emptyState === 0) { r.desktop.function = 'PARTIAL'; r.sim.push('No job cards and no empty state'); }
    if (filterBar === 0) { r.desktop.function = 'FAIL'; r.sim.push('No filter bar'); }
    if (footerCount !== 1) { r.desktop.layout = 'FAIL'; r.sim.push('Double footer: ' + footerCount); }

    r.exp.push(`H1: "${h1?.slice(0, 50)}"`);
    r.exp.push(`Filters: ${filterBar}, Cards: ${cards}`);
    r.exp.push(`Empty: ${emptyState > 0 ? 'YES' : 'NO'}`);
    r.exp.push(`Footer: ${footerCount}`);
  });

  await checkMobile(375, async (page) => {
    await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const footerCount = await page.locator('footer').count();
    const cards = await page.locator('[class*="card"], [class*="job"]').count();
    const filters = await page.locator('input, select').count();
    const ctaVisible = await page.locator('button').first().isVisible().catch(() => false);

    if (footerCount !== 1) { r.mobile.layout = 'FAIL'; r.sim.push('Mobile double footer'); }
    if (!ctaVisible) { r.mobile.function = 'PARTIAL'; r.sim.push('CTA not visible'); }
    if (filters > 0) {
      const filterInView = await page.locator('input').first().isVisible().catch(() => false);
      if (!filterInView) { r.mobile.function = 'PARTIAL'; r.sim.push('Filters exist but off-screen'); }
    }

    r.exp.push(`Mobile cards: ${cards}`);
    r.exp.push(`Mobile filters: ${filters}`);
  });

  return r;
}

// ─── LOGIN + FOUNDER LOGIN ────────────────────────────────────────────────────
async function auditLogin() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P2' };

  await checkDesktop(async (page) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    const emailField = await page.locator('input[type="email"]').count();
    const passwordField = await page.locator('input[type="password"]').count();
    const submitBtn = await page.locator('button[type="submit"]').count();
    const divider = await page.locator('text=or').count();

    await page.fill('input[type="email"]', 'bad@test.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    const errorMsg = await page.locator('text=/error|invalid|wrong|incorrect/i').count();

    if (emailField === 0) { r.desktop.function = 'FAIL'; r.sim.push('No email field'); }
    if (submitBtn === 0) { r.desktop.function = 'FAIL'; r.sim.push('No submit button'); }
    if (currentUrl.includes('/login') && errorMsg === 0) { r.desktop.function = 'PARTIAL'; r.sim.push('Bad credentials: stayed on login, no error shown'); }

    r.exp.push(`Email field: ${emailField > 0 ? 'YES' : 'NO'}`);
    r.exp.push(`After bad creds: ${currentUrl}`);
    r.exp.push(`Error shown: ${errorMsg > 0 ? 'YES' : 'NO'}`);
  });

  await checkDesktop(async (page) => {
    await page.goto(`${BASE}/founder-login`, { waitUntil: 'networkidle' });
    const emailField = await page.locator('input[type="email"]').count();
    await page.fill('input[type="email"]', FOUNDERS.admin.email);
    await page.fill('input[type="password"]', FOUNDERS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const url = page.url();
    const onAdmin = url.includes('/admin');

    if (!onAdmin) { r.sim.push('Founder login: redirected to ' + url + ' not /admin'); }
    r.exp.push(`Founder login redirect: ${onAdmin ? '/admin' : url}`);
  });

  await checkMobile(375, async (page) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    const keyboardTriggered = await page.locator('input[type="email"]').isVisible().catch(() => false);
    const ctaBtn = await page.locator('button[type="submit"]').isVisible().catch(() => false);
    if (!keyboardTriggered) { r.mobile.function = 'FAIL'; }
    if (!ctaBtn) { r.mobile.function = 'FAIL'; }
    r.exp.push(`Mobile email field visible: ${keyboardTriggered}`);
    r.exp.push(`Mobile submit visible: ${ctaBtn}`);
  });

  return r;
}

// ─── APPLY ────────────────────────────────────────────────────────────────────
async function auditApply() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P1' };

  await checkDesktop(async (page) => {
    await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
    const formFields = await page.locator('input, select, textarea').count();
    const submitBtn = await page.locator('button[type="submit"]').count();
    const phase1 = await page.locator('text=/phase 1/i').count();
    const trustRow = await page.locator('text=/vetted|verified|trusted/i').count();

    await page.click('button[type="submit"]').catch(() => {});
    await page.waitForTimeout(2000);
    const url = page.url();
    const onPending = url.includes('/pending');

    if (formFields < 3) { r.desktop.function = 'FAIL'; r.sim.push('Too few form fields: ' + formFields); }
    if (!onPending) { r.sim.push('Apply submit did not redirect to /pending'); }
    if (phase1 === 0) { r.desktop.ux = 'PARTIAL'; r.sim.push('No Phase 1 reference on apply page'); }

    r.exp.push(`H1: "${h1?.slice(0, 50)}"`);
    r.exp.push(`Form fields: ${formFields}`);
    r.exp.push(`After submit: ${url}`);
    r.exp.push(`Phase 1 shown: ${phase1 > 0 ? 'YES' : 'NO'}`);
  });

  await checkMobile(375, async (page) => {
    await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
    const formFields = await page.locator('input, select, textarea').count();
    const btn = await page.locator('button[type="submit"]').isVisible().catch(() => false);
    const keyboardOverlap = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (!btn) return false;
      const r = btn.getBoundingClientRect();
      return r.top > window.innerHeight * 0.85;
    });

    if (formFields < 3) { r.mobile.function = 'FAIL'; }
    if (!btn) { r.mobile.function = 'FAIL'; }
    if (keyboardOverlap) { r.mobile.ux = 'PARTIAL'; r.sim.push('Submit button pushed off-screen by keyboard'); }

    r.exp.push(`Mobile fields: ${formFields}, btn visible: ${btn}`);
  });

  return r;
}

// ─── PENDING ─────────────────────────────────────────────────────────────────
async function auditPending() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P1' };

  await checkDesktop(async (page) => {
    await page.goto(`${BASE}/pending`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
    const copy = await page.locator('p').count();
    const nextStep = await page.locator('text=/next step|check email|email.*sent/i').count();

    r.exp.push(`H1: "${h1?.slice(0, 60)}"`);
    r.exp.push(`Paragraphs: ${copy}`);
    r.exp.push(`Next step: ${nextStep > 0 ? 'YES' : 'NO'}`);
    r.exp.push(`Status: ${r.desktop.layout}/${r.desktop.function}/${r.desktop.ux}`);
  });

  await checkMobile(375, async (page) => {
    await page.goto(`${BASE}/pending`, { waitUntil: 'networkidle' });
    const visible = await page.locator('h1, h2').first().isVisible().catch(() => false);
    if (!visible) { r.mobile.layout = 'FAIL'; r.sim.push('H1 not visible on mobile'); }
    r.exp.push(`Mobile visible: ${visible}`);
  });

  return r;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
async function auditDashboard() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P1' };

  // As approved contractor (Mike)
  await checkDesktop(async (page) => {
    await loginAs(page, FOUNDERS.mike.email, FOUNDERS.mike.password);
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const url = page.url();
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
    const statCards = await page.locator('[class*="card"]').count();
    const tabs = await page.locator('[role="tab"], button').count();
    const nav = await page.locator('nav, header').first().isVisible().catch(() => false);

    if (!url.includes('/dashboard')) { r.desktop.function = 'FAIL'; r.sim.push('Did not reach dashboard: ' + url); }
    if (statCards === 0) { r.desktop.ux = 'PARTIAL'; r.sim.push('No stat cards on dashboard'); }

    r.exp.push(`URL: ${url}`);
    r.exp.push(`H1: "${h1?.slice(0, 50)}"`);
    r.exp.push(`Cards: ${statCards}, Tabs/Buttons: ${tabs}`);
    r.exp.push(`Nav: ${nav ? 'visible' : 'hidden'}`);
  });

  await checkMobile(375, async (page) => {
    await loginAs(page, FOUNDERS.mike.email, FOUNDERS.mike.password);
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const url = page.url();
    const h1 = await page.locator('h1, h2').first().isVisible().catch(() => false);
    const cards = await page.locator('[class*="card"]').count();
    const tabs = await page.locator('[role="tab"], button').count();
    const tabOverflow = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      if (tabs.length === 0) return false;
      const last = tabs[tabs.length - 1].getBoundingClientRect();
      return last.right > window.innerWidth;
    });

    if (tabOverflow) { r.mobile.ux = 'PARTIAL'; r.sim.push('Tabs overflow off-screen on mobile'); }
    r.exp.push(`Mobile URL: ${url}`);
    r.exp.push(`Mobile H1: ${h1}`);
    r.exp.push(`Cards: ${cards}, Tabs overflow: ${tabOverflow}`);
  });

  return r;
}

// ─── POST JOB ─────────────────────────────────────────────────────────────────
async function auditPostJob() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P1' };

  await checkDesktop(async (page) => {
    await loginAs(page, FOUNDERS.mike.email, FOUNDERS.mike.password);
    await page.goto(`${BASE}/post-job`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
    const formFields = await page.locator('input, select, textarea').count();
    const scopeSection = await page.locator('text=/scope|service type|ai/i').count();
    const photoSection = await page.locator('text=/photo/i').count();
    const submitBtn = await page.locator('button[type="submit"]').count();
    const url = page.url();

    if (!url.includes('/post-job')) { r.desktop.function = 'FAIL'; r.sim.push('Not on post-job page'); }
    if (formFields < 5) { r.desktop.function = 'FAIL'; r.sim.push('Too few fields: ' + formFields); }
    if (scopeSection === 0) { r.desktop.ux = 'PARTIAL'; r.sim.push('No AI scope section visible'); }

    r.exp.push(`H1: "${h1?.slice(0, 50)}"`);
    r.exp.push(`Fields: ${formFields}, Photo: ${photoSection > 0 ? 'YES' : 'NO'}, Scope: ${scopeSection > 0 ? 'YES' : 'NO'}`);
    r.exp.push(`Submit btn: ${submitBtn}`);
  });

  await checkMobile(375, async (page) => {
    await loginAs(page, FOUNDERS.mike.email, FOUNDERS.mike.password);
    await page.goto(`${BASE}/post-job`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const formFields = await page.locator('input, select, textarea').count();
    const btn = await page.locator('button[type="submit"]').isVisible().catch(() => false);
    const ctaBelowKeyboard = await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (!btn) return false;
      return btn.getBoundingClientRect().top > window.innerHeight * 0.8;
    });

    if (!btn) { r.mobile.function = 'FAIL'; }
    if (ctaBelowKeyboard) { r.mobile.ux = 'PARTIAL'; r.sim.push('CTA hidden by keyboard'); }
    r.exp.push(`Mobile fields: ${formFields}, submit visible: ${btn}`);
  });

  return r;
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
async function auditAdmin() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P0' };

  await checkDesktop(async (page) => {
    await founderLogin(page);
    await page.waitForTimeout(2000);
    const url = page.url();
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
    const tabs = await page.locator('[role="tab"], button').count();
    const tableRows = await page.locator('tr').count();
    const approveBtn = await page.locator('text=/approve|accept/i').count();
    const rejectBtn = await page.locator('text=/reject|decline/i').count();
    const notesField = await page.locator('textarea, [placeholder*="note" i]').count();

    if (!url.includes('/admin')) { r.desktop.function = 'FAIL'; r.sim.push('Not on admin: ' + url); }
    if (tabs === 0) { r.desktop.function = 'FAIL'; r.sim.push('No tabs'); }
    if (tableRows === 0) { r.desktop.function = 'PARTIAL'; r.sim.push('No applicant rows'); }
    if (approveBtn === 0) { r.desktop.function = 'PARTIAL'; r.sim.push('No approve buttons visible'); }
    if (rejectBtn === 0) { r.desktop.function = 'PARTIAL'; r.sim.push('No reject buttons'); }

    r.exp.push(`URL: ${url}`);
    r.exp.push(`H1: "${h1?.slice(0, 50)}"`);
    r.exp.push(`Tabs: ${tabs}, Rows: ${tableRows}`);
    r.exp.push(`Approve: ${approveBtn > 0 ? 'YES' : 'NO'}, Reject: ${rejectBtn > 0 ? 'YES' : 'NO'}`);
    r.exp.push(`Notes fields: ${notesField}`);
  });

  await checkMobile(375, async (page) => {
    await founderLogin(page);
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const h1 = await page.locator('h1, h2').first().isVisible().catch(() => false);
    const tabs = await page.locator('[role="tab"]').count();
    const tabScrollable = await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return false;
      const container = tabs[0].parentElement;
      return container ? container.scrollWidth > container.clientWidth : false;
    });
    const tableFit = await page.evaluate(() => {
      const table = document.querySelector('table');
      return table ? table.getBoundingClientRect().width <= window.innerWidth : true;
    });

    if (!h1) { r.mobile.layout = 'FAIL'; r.sim.push('Admin H1 not visible on mobile'); }
    if (!tableFit) { r.mobile.layout = 'PARTIAL'; r.sim.push('Admin table overflows mobile width'); }

    r.exp.push(`H1: ${h1}, Tabs: ${tabs}, Tab scrollable: ${tabScrollable}`);
    r.exp.push(`Table fits: ${tableFit}`);
  });

  return r;
}

// ─── TERMS + PRIVACY ─────────────────────────────────────────────────────────
async function auditTerms() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P2' };

  for (const path of ['/terms', '/privacy-policy']) {
    await checkDesktop(async (page) => {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const h1 = await page.locator('h1').first().textContent().catch(() => '');
      const content = await page.locator('p').count();
      const footerCount = await page.locator('footer').count();

      if (footerCount !== 1) { r.desktop.layout = 'FAIL'; }
      if (content < 5) { r.desktop.function = 'PARTIAL'; r.sim.push(path + ': thin content'); }
      r.exp.push(`${path}: H1="${h1?.slice(0,40)}", p=${content}, footer=${footerCount}`);
    });
  }

  await checkMobile(375, async (page) => {
    await page.goto(`${BASE}/terms`, { waitUntil: 'networkidle' });
    const h1 = await page.locator('h1').first().isVisible().catch(() => false);
    const footer = await page.locator('footer').count();
    if (!h1) { r.mobile.layout = 'FAIL'; }
    if (footer !== 1) { r.mobile.layout = 'FAIL'; }
    r.exp.push(`Terms mobile: H1=${h1}, footer=${footer}`);
  });

  return r;
}

// ─── MY JOBS + JOB DETAIL ─────────────────────────────────────────────────────
async function auditMyJobs() {
  const r = { desktop: { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               mobile:  { layout: 'PASS', function: 'PASS', ux: 'PASS' },
               sim: [], exp: [], severity: 'P2' };

  await checkDesktop(async (page) => {
    await loginAs(page, FOUNDERS.mike.email, FOUNDERS.mike.password);
    await page.goto(`${BASE}/my-jobs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const url = page.url();
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => '');
    const cards = await page.locator('[class*="card"]').count();
    const emptyState = await page.locator('text=/no jobs|empty/i').count();

    if (!url.includes('/my-jobs')) { r.desktop.function = 'FAIL'; }
    r.exp.push(`URL: ${url}, H1: "${h1?.slice(0,40)}", Cards: ${cards}, Empty: ${emptyState > 0}`);
  });

  return r;
}

// ─── RUN ALL AUDITS ───────────────────────────────────────────────────────────
const pages = {
  '1. Homepage': auditHomepage,
  '2. Jobs Browse': auditJobsBrowse,
  '3. Login + Founder Login': auditLogin,
  '4. Apply': auditApply,
  '5. Pending': auditPending,
  '6. Dashboard': auditDashboard,
  '7. Post Job': auditPostJob,
  '8. Admin Portal': auditAdmin,
  '9. Terms + Privacy': auditTerms,
  '10. My Jobs': auditMyJobs,
};

const allResults = {};
for (const [name, fn] of Object.entries(pages)) {
  process.stdout.write(`Running ${name}...`);
  try {
    allResults[name] = await fn();
    process.stdout.write(` done\n`);
  } catch(e) {
    allResults[name] = { desktop: { layout: 'FAIL', function: 'FAIL', ux: 'FAIL' },
                          mobile: { layout: 'FAIL', function: 'FAIL', ux: 'FAIL' },
                          sim: [`ERROR: ${e.message}`], exp: [], severity: 'P0' };
    process.stdout.write(` ERROR: ${e.message}\n`);
  }
}

// ─── PRINT SUMMARY ────────────────────────────────────────────────────────────
console.log('\n\n' + '═'.repeat(80));
console.log('FULL AUDIT RESULTS');
console.log('═'.repeat(80));

for (const [name, r] of Object.entries(allResults)) {
  const ds = score(r.desktop.layout)[0] + score(r.desktop.function)[0] + score(r.desktop.ux)[0];
  const ms = score(r.mobile.layout)[0]  + score(r.mobile.function)[0]  + score(r.mobile.ux)[0];
  console.log(`\n${name} [${r.severity}]`);
  console.log(`  Desktop:  ${r.desktop.layout}/${r.desktop.function}/${r.desktop.ux}  [${ds}]`);
  console.log(`  Mobile:   ${r.mobile.layout}/${r.mobile.function}/${r.mobile.ux}   [${ms}]`);
  if (r.sim.length > 0) {
    console.log(`  SIM notes:`);
    r.sim.forEach(s => console.log(`    • ${s}`));
  }
  if (r.exp.length > 0) {
    console.log(`  EXP:`);
    r.exp.forEach(s => console.log(`    → ${s}`));
  }
}

console.log('\n' + '═'.repeat(80));

// Count issues
let issues = [];
Object.entries(allResults).forEach(([name, r]) => {
  ['desktop', 'mobile'].forEach(platform => {
    const p = r[platform];
    Object.entries(p).forEach(([cat, val]) => {
      if (val === 'FAIL') issues.push(`[${name}] ${platform}.${cat}`);
    });
  });
  r.sim.forEach(s => issues.push(`[SIM] ${name}: ${s}`));
});

console.log(`\nTotal FAIL items: ${issues.length}`);
issues.forEach(i => console.log('  ' + i));
console.log('═'.repeat(80));

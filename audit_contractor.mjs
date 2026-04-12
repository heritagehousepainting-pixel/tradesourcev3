import { chromium } from 'playwright';

const BASE = 'https://project-bdhbf.vercel.app';

// We need to log in as an approved contractor
// info@tradesource.app is the founder — let's try to sign in with a known account
// Actually, let's check the supabase auth users
// For this test, we'll simulate what happens when we ARE authenticated as an approved contractor

const results = {};

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  // Check if already logged in
  const url0 = page.url();
  if (!url0.includes('login')) return true; // already logged in
  
  await page.fill('input[type="email"]', email).catch(() => {});
  await page.fill('input[type="password"]', password).catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(3000);
  return !page.url().includes('/login');
}

// Check what pages show for a logged-out user
async function auditPublicGates() {
  console.log('\n=== PUBLIC GATE STATES ===');
  
  const browser = await chromium.launch();
  
  // Unauthenticated state
  const anon = await browser.newPage();
  await anon.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await anon.waitForTimeout(1500);
  console.log(`Dashboard (anon): ${anon.url()}`);
  console.log(`  H1: ${(await anon.locator('h1, h2').first().textContent().catch(() => 'none'))?.slice(0, 60)}`);
  
  await anon.goto(`${BASE}/post-job`, { waitUntil: 'networkidle' });
  await anon.waitForTimeout(1500);
  console.log(`Post-job (anon): ${anon.url()}`);
  console.log(`  H1: ${(await anon.locator('h1, h2').first().textContent().catch(() => 'none'))?.slice(0, 60)}`);
  
  await anon.goto(`${BASE}/my-jobs`, { waitUntil: 'networkidle' });
  await anon.waitForTimeout(1500);
  console.log(`My Jobs (anon): ${anon.url()}`);
  
  await anon.goto(`${BASE}/profile`, { waitUntil: 'networkidle' });
  await anon.waitForTimeout(1500);
  console.log(`Profile (anon): ${anon.url()}`);
  
  await anon.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
  await anon.waitForTimeout(1500);
  console.log(`Apply (anon): ${anon.url()}`);
  const applyH1 = await anon.locator('h1, h2').first().textContent().catch(() => 'none');
  const applyForm = await anon.locator('form').count();
  console.log(`  H1: "${applyH1?.slice(0, 60)}", Form: ${applyForm > 0 ? 'YES' : 'NO'}`);
  
  await browser.close();
}

// Check admin state (founder login)
async function auditFounderFlow() {
  console.log('\n=== FOUNDER/ADMIN FLOW ===');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto(`${BASE}/founder-login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'info@tradesource.app').catch(() => {});
  await page.fill('input[type="password"]', 'Test1234').catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(3000);
  
  const adminUrl = page.url();
  console.log(`After founder login: ${adminUrl}`);
  
  if (adminUrl.includes('/admin')) {
    await page.waitForTimeout(2000);
    const h1 = await page.locator('h1').first().textContent().catch(() => 'none');
    const tabs = await page.locator('[role="tab"]').count();
    const rows = await page.locator('tbody tr').count();
    const approveBtns = await page.locator('button:has-text("Approve"), button:has-text("approve")').count();
    const rejectBtns = await page.locator('button:has-text("Reject"), button:has-text("reject")').count();
    const pendingTab = await page.locator('[role="tab"]:has-text("Pending")').count();
    
    console.log(`  H1: "${h1?.slice(0, 50)}"`);
    console.log(`  Tabs: ${tabs}, Pending tab: ${pendingTab > 0 ? 'YES' : 'NO'}`);
    console.log(`  Rows: ${rows}, Approve btns: ${approveBtns}, Reject btns: ${rejectBtns}`);
    
    // Check mobile admin
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const mobileH1 = await page.locator('h1').first().isVisible().catch(() => false);
    const mobileTabs = await page.locator('[role="tab"]').count();
    const tableScroll = await page.evaluate(() => {
      const t = document.querySelector('table');
      return t ? t.getBoundingClientRect().right > window.innerWidth : false;
    });
    console.log(`\n  Mobile Admin:`);
    console.log(`    H1 visible: ${mobileH1}, Tabs: ${mobileTabs}, Table overflow: ${tableScroll}`);
  }
  
  await browser.close();
}

// Check homepage quality
async function auditHomepageQuality() {
  console.log('\n=== HOMEPAGE QUALITY AUDIT ===');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Check for trust elements
  const hasPhase1 = await page.locator('text=/Phase 1/i').count();
  const hasCounties = await page.locator('text=/Montgomery|Bucks|Delaware|Philadelphia/i').count();
  const hasStats = await page.locator('text=/contractors|jobs|completed/i').count();
  const ctaCount = await page.locator('button').count();
  const navLinks = await page.locator('nav a').count();
  const footerLinks = await page.locator('footer a').count();
  const hasEarlyAccess = await page.locator('text=/early access/i').count();
  const hasProcess = await page.locator('text=/process|step|how/i').count();
  
  console.log(`  Phase 1 badge: ${hasPhase1 > 0 ? 'YES' : 'MISSING'}`);
  console.log(`  County coverage: ${hasCounties > 0 ? 'YES' : 'MISSING'} (${hasCounties} matches)`);
  console.log(`  Trust stats: ${hasStats > 0 ? 'YES' : 'MISSING'} (${hasStats} matches)`);
  console.log(`  CTAs: ${ctaCount}`);
  console.log(`  Nav links: ${navLinks}, Footer links: ${footerLinks}`);
  console.log(`  Early access CTA: ${hasEarlyAccess > 0 ? 'YES' : 'MISSING'}`);
  console.log(`  Process section: ${hasProcess > 0 ? 'YES' : 'MISSING'}`);
  
  // Check for broken/placeholder content
  const hasLorem = await page.locator('text=/lorem|placeholder|TODO|FIXME/i').count();
  const hasFakeNumbers = await page.locator('text=/1000|5000|10000|100000/i').count();
  console.log(`  Placeholder text (lorem/TODO): ${hasLorem > 0 ? 'FOUND - BAD' : 'NONE'}`);
  console.log(`  Suspicious fake numbers: ${hasFakeNumbers > 0 ? 'FOUND - BAD' : 'NONE'}`);
  
  // Check jobs browse empty state quality
  await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const emptyStateText = await page.locator('p, h2, h3').allTextContents().catch(() => []);
  console.log(`\n  Jobs browse empty state text: "${emptyStateText.slice(0, 3).join(' | ').slice(0, 100)}"`);
  
  await browser.close();
}

// Check footer and nav consistency across pages
async function auditConsistency() {
  console.log('\n=== CROSS-PAGE CONSISTENCY AUDIT ===');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  const pages_to_check = ['/', '/jobs', '/apply', '/login', '/terms', '/privacy-policy'];
  
  for (const path of pages_to_check) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    const footerCount = await page.locator('footer').count();
    const navVisible = await page.locator('header, nav').first().isVisible().catch(() => null);
    const logoText = await page.locator('text=TradeSource').count();
    
    console.log(`  ${path.padEnd(20)} footer:${footerCount} nav:${navVisible !== null ? (navVisible ? 'YES' : 'NO') : '?'} logo:${logoText > 0 ? 'YES' : 'NO'}`);
  }
  
  await browser.close();
}

await auditPublicGates();
await auditFounderFlow();
await auditHomepageQuality();
await auditConsistency();

console.log('\n=== AUDIT COMPLETE ===');

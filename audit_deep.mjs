import { chromium } from 'playwright';

const BASE = 'https://project-bdhbf.vercel.app';

async function auditAdminTabs() {
  console.log('\n=== ADMIN TABS + DATA AUDIT ===');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Founder login
  await page.goto(`${BASE}/founder-login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', 'info@tradesource.app');
  await page.fill('input[type="password"]', 'Test1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Count ALL interactive elements that look like tabs
  const allTabs = await page.locator('[role="tab"], .tab, button[class*="tab"], button[class*="status"]').count();
  const tabNames = await page.locator('[role="tab"], .tab, button[class*="tab"], button[class*="status"]').allTextContents().catch(() => []);
  
  // Check for data in each category
  const pendingCount = await page.locator('text=/pending|0 pending/i').count();
  const approvedCount = await page.locator('text=/approved|approved/i').count();
  const rejectedCount = await page.locator('text=/rejected|rejected/i').count();
  
  // Check the admin page HTML structure
  const mainContent = await page.locator('main, [class*="main"], [class*="content"]').count();
  const h1Text = await page.locator('h1').first().textContent().catch(() => 'none');
  
  // Check for tabs using button text patterns
  const buttons = await page.locator('button').allTextContents().catch(() => []);
  const tabButtons = buttons.filter(t => /\b(Pending|Approved|Rejected|Suspended|All|Applications?)\b/i.test(t));
  
  console.log(`  H1: "${h1Text}"`);
  console.log(`  Role=tab count: ${await page.locator('[role="tab"]').count()}`);
  console.log(`  Tab-like buttons: ${JSON.stringify(tabButtons.slice(0, 8))}`);
  console.log(`  All buttons: ${JSON.stringify(buttons.slice(0, 10))}`);
  console.log(`  Pending indicator: ${pendingCount}`);
  console.log(`  Approved indicator: ${approvedCount}`);
  console.log(`  Rejected indicator: ${rejectedCount}`);
  
  // Try clicking Pending tab if it exists
  const pendingTab = page.locator('[role="tab"]:has-text("Pending"), button:has-text("Pending")').first();
  const pendingTabCount = await pendingTab.count();
  if (pendingTabCount > 0) {
    await pendingTab.click();
    await page.waitForTimeout(1000);
    const rowsAfterClick = await page.locator('tbody tr').count();
    console.log(`  Rows after clicking Pending tab: ${rowsAfterClick}`);
  } else {
    console.log(`  No Pending tab found to click`);
  }
  
  // Try clicking Approved tab
  const approvedTab = page.locator('[role="tab"]:has-text("Approved"), button:has-text("Approved")').first();
  if (await approvedTab.count() > 0) {
    await approvedTab.click();
    await page.waitForTimeout(1000);
    const rows = await page.locator('tbody tr').count();
    console.log(`  Approved tab rows: ${rows}`);
  }
  
  await browser.close();
}

async function auditJobDetailPage() {
  console.log('\n=== JOB DETAIL + SCOPE FIELDS AUDIT ===');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Try to find any job ID in the DB
  await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Look for any clickable job cards
  const cardLinks = await page.locator('a[href*="/jobs/"]').count();
  console.log(`  Job card links: ${cardLinks}`);
  
  if (cardLinks > 0) {
    const firstLink = page.locator('a[href*="/jobs/"]').first();
    const href = await firstLink.getAttribute('href');
    console.log(`  First job link: ${href}`);
    
    await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const h1 = await page.locator('h1, h2').first().textContent().catch(() => 'none');
    const scopeFields = await page.locator('text=/included|sq ft|duration|finish|exclusion/i').count();
    const photos = await page.locator('img').count();
    const applyCta = await page.locator('button:has-text("Apply"), a:has-text("Apply")').count();
    const footer = await page.locator('footer').count();
    
    console.log(`  H1: "${h1?.slice(0, 60)}"`);
    console.log(`  Scope fields: ${scopeFields}, Photos: ${photos}, Apply CTA: ${applyCta}, Footer: ${footer}`);
  } else {
    // No jobs - check empty state quality
    const emptyH2 = await page.locator('h2, h3').first().textContent().catch(() => 'none');
    const emptyP = await page.locator('p').first().textContent().catch(() => 'none');
    console.log(`  No jobs - empty state: "${emptyH2?.slice(0, 60)}" | "${emptyP?.slice(0, 80)}"`);
  }
  
  await browser.close();
}

async function auditApplyFlowEndToEnd() {
  console.log('\n=== APPLY FLOW E2E AUDIT ===');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Submit a fresh application
  await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Fill form fields
  const inputs = await page.locator('input').all();
  const inputLabels = [];
  for (const inp of inputs.slice(0, 6)) {
    const label = await inp.getAttribute('placeholder') || await inp.getAttribute('name') || '';
    inputLabels.push(label);
  }
  console.log(`  Input placeholders: ${JSON.stringify(inputLabels)}`);
  
  // Fill with test data
  await page.fill('input[name="name"], input[placeholder*="name" i], input[placeholder*="business" i]', 'Test Contractor Audit').catch(() => {});
  await page.fill('input[placeholder*="email" i]', 'audit-test-' + Date.now() + '@test.com').catch(() => {});
  await page.fill('input[placeholder*="phone" i]', '2155551234').catch(() => {});
  await page.fill('input[placeholder*="business" i]', 'Audit Test Painting LLC').catch(() => {});
  
  // Check if trade type dropdown exists
  const selects = await page.locator('select').count();
  console.log(`  Select dropdowns: ${selects}`);
  
  if (selects > 0) {
    const options = await page.locator('select').first().locator('option').allTextContents();
    console.log(`  First select options: ${JSON.stringify(options.slice(0, 5))}`);
  }
  
  // Submit
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(3000);
  const afterUrl = page.url();
  const afterH1 = await page.locator('h1, h2').first().textContent().catch(() => 'none');
  console.log(`  After submit URL: ${afterUrl}`);
  console.log(`  After submit H1: "${afterH1?.slice(0, 60)}"`);
  
  await browser.close();
}

async function auditMobilePolish() {
  console.log('\n=== MOBILE POLISH SPOT CHECK ===');
  const browser = await chromium.launch();
  
  const widths = [320, 375, 390, 430];
  const pages_to_check = ['/', '/jobs', '/apply', '/terms'];
  
  for (const width of widths) {
    console.log(`\n  --- ${width}px ---`);
    const page = await browser.newPage();
    await page.setViewportSize({ width, height: 844 });
    
    for (const path of pages_to_check) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      
      const h1Visible = await page.locator('h1').first().isVisible().catch(() => false);
      const footerCount = await page.locator('footer').count();
      const horizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      const textReadable = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        if (!h1) return 'NO_H1';
        const w = h1.getBoundingClientRect().width;
        return w <= window.innerWidth ? 'OK' : 'OVERFLOW';
      });
      
      const footer = footerCount === 1 ? '✓' : '✗' + footerCount;
      const h1 = h1Visible ? '✓' : '✗';
      const scroll = horizontalScroll ? '✗scroll' : '✓';
      const text = textReadable === 'OK' ? '✓' : '✗' + textReadable;
      console.log(`    ${path.padEnd(8)} footer:${footer} h1:${h1} scroll:${scroll} text:${text}`);
    }
    
    await page.close();
  }
  
  await browser.close();
}

async function auditReviewAndMessaging() {
  console.log('\n=== REVIEWS + MESSAGING AUDIT ===');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Check if reviews section exists on contractor profiles
  await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  // Check if there are any contractor profile links
  const contractorLinks = await page.locator('a[href*="/contractors/"]').count();
  console.log(`  Contractor profile links on /jobs: ${contractorLinks}`);
  
  // Check the review surface on the public contractor page
  // (would need to find a real contractor ID)
  
  // Check messaging page accessibility
  await page.goto(`${BASE}/messages`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const msgUrl = page.url();
  const msgH1 = await page.locator('h1, h2').first().textContent().catch(() => 'none');
  console.log(`  Messages page (anon): ${msgUrl}`);
  console.log(`  H1: "${msgH1?.slice(0, 50)}"`);
  
  await browser.close();
}

await auditAdminTabs();
await auditJobDetailPage();
await auditApplyFlowEndToEnd();
await auditMobilePolish();
await auditReviewAndMessaging();
console.log('\n=== DEEP AUDIT COMPLETE ===');

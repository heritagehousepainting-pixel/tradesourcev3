import { chromium } from 'playwright';

const BASE = 'https://project-bdhbf.vercel.app';

async function testApplyWithAllFields() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Track console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Fill ALL fields including required ones
  await page.fill('#apply-full-name', 'Test Contractor ' + Date.now()).catch(() => {});
  await page.fill('#apply-email', 'test-complete-' + Date.now() + '@test.com').catch(() => {});
  await page.fill('#apply-phone', '2155551234').catch(() => {});
  await page.fill('#apply-business-name', 'Test Painting LLC').catch(() => {});
  await page.fill('#apply-license', 'PA123456').catch(() => {});
  await page.fill('#apply-external-link', 'https://www.google.com/maps/place/Test').catch(() => {});
  await page.fill('#apply-bio', 'Professional painter with 10 years experience').catch(() => {});
  await page.fill('#apply-password', 'TestPass123!').catch(() => {});
  
  // Verify all required fields are filled
  const requiredFilled = await page.evaluate(() => {
    const required = document.querySelectorAll('[required]');
    return Array.from(required).map(el => ({
      placeholder: el.placeholder,
      value: el.value,
      valid: el.checkValidity ? el.checkValidity() : (!!el.value)
    }));
  });
  console.log('Required fields check:');
  requiredFilled.forEach(f => console.log(`  ${f.placeholder?.slice(0,20)}: "${f.value?.slice(0,20)}" = ${f.valid ? 'VALID' : 'EMPTY/INVALID'}`));
  
  // Click submit
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(5000);
  
  const finalUrl = page.url();
  const finalH1 = await page.locator('h1, h2').first().textContent().catch(() => 'none');
  
  console.log(`\nAfter submit:`);
  console.log(`  URL: ${finalUrl}`);
  console.log(`  H1: "${finalH1?.slice(0, 60)}"`);
  console.log(`  Console errors: ${errors.length}`);
  errors.forEach(e => console.log(`    ${e}`));
  
  // Check for any error or success message
  const bodyText = await page.locator('body').textContent().catch(() => '');
  if (bodyText.includes('error') || bodyText.includes('Error')) {
    console.log(`  Page mentions "error": YES`);
  }
  if (finalUrl.includes('pending')) {
    console.log(`  ✓ REDIRECTED TO /pending`);
  } else if (finalUrl.includes('apply')) {
    console.log(`  ✗ STILL ON /apply - redirect failed`);
  }
  
  await browser.close();
}

async function checkPendingPage() {
  console.log('\n=== PENDING PAGE AUDIT ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto(`${BASE}/pending`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  const url = page.url();
  const h1 = await page.locator('h1').first().textContent().catch(() => 'none');
  const h2 = await page.locator('h2').first().textContent().catch(() => 'none');
  const paragraphs = await page.locator('p').allTextContents().catch(() => []);
  const buttons = await page.locator('button').allTextContents().catch(() => []);
  
  console.log(`  URL: ${url}`);
  console.log(`  H1: "${h1?.slice(0, 60)}"`);
  console.log(`  H2: "${h2?.slice(0, 60)}"`);
  console.log(`  Paragraphs: ${paragraphs.slice(0, 3).join(' | ')}`);
  console.log(`  Buttons: ${JSON.stringify(buttons.slice(0, 5))}`);
  
  // Check what it shows to a logged-in user
  // Login as founder first
  await page.goto(`${BASE}/founder-login`);
  await page.fill('input[type="email"]', 'info@tradesource.app');
  await page.fill('input[type="password"]', 'Test1234');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  
  await page.goto(`${BASE}/pending`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  const url2 = page.url();
  const h1_2 = await page.locator('h1').first().textContent().catch(() => 'none');
  console.log(`\n  Pending (logged in as founder):`);
  console.log(`  URL: ${url2}`);
  console.log(`  H1: "${h1_2?.slice(0, 60)}"`);
  
  await browser.close();
}

async function verifyFooterFix() {
  console.log('\n=== FOOTER FIX VERIFICATION ===');
  const browser = await chromium.launch({ headless: true });
  
  const widths = [320, 375, 390, 430, 1440];
  for (const w of widths) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: w, height: 844 });
    await page.goto(`https://project-bdhbf.vercel.app/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    const footerCount = await page.locator('footer').count();
    const bodyDirectChildren = await page.evaluate(() => {
      return Array.from(document.body.children).filter(c => c.tagName === 'FOOTER').length;
    });
    
    console.log(`  ${String(w).padStart(4)}px: footers=${footerCount}, body.footer=${bodyDirectChildren} ${footerCount === 1 ? '✓' : '✗'}`);
    await page.close();
  }
  await browser.close();
}

await testApplyWithAllFields();
await checkPendingPage();
await verifyFooterFix();

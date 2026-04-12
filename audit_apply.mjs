import { chromium } from 'playwright';

const BASE = 'https://project-bdhbf.vercel.app';

async function testApplyFlow() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Take a screenshot of the form
  await page.screenshot({ path: '/tmp/apply_form.png' });
  
  // List all form fields
  const formFields = await page.evaluate(() => {
    const fields = [];
    document.querySelectorAll('input, select, textarea').forEach(el => {
      fields.push({
        type: el.type || el.tagName,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        required: el.required,
        label: el.closest('label')?.textContent?.trim() || el.parentElement?.querySelector('label')?.textContent?.trim() || ''
      });
    });
    return fields;
  });
  console.log('Form fields:');
  formFields.forEach(f => console.log(`  ${JSON.stringify(f)}`));
  
  // Fill the form properly
  await page.fill('input[placeholder="John Smith"]', 'Test Contractor').catch(() => console.log('Name fill failed'));
  await page.fill('input[placeholder*="you@company.com"]', 'test-apply-' + Date.now() + '@test.com').catch(() => {});
  await page.fill('input[placeholder="(215) 555-0100"]', '2155551234').catch(() => {});
  await page.fill('input[placeholder="Smith Painting LLC"]', 'Test Painting LLC').catch(() => {});
  
  // Check for other required fields
  const requiredFields = formFields.filter(f => f.required);
  console.log(`\nRequired fields: ${requiredFields.length}`);
  
  // Click submit and capture network response
  page.on('response', async r => {
    if (r.url().includes('/api/')) {
      console.log(`  API: ${r.status()} ${r.url()}`);
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  CONSOLE ERROR: ${msg.text()}`);
  });
  
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForTimeout(4000);
  
  const finalUrl = page.url();
  const finalH1 = await page.locator('h1, h2').first().textContent().catch(() => 'none');
  const errorMsg = await page.locator('[class*="error"], [class*="Error"]').count();
  const successMsg = await page.locator('[class*="success"], [class*="Success"]').count();
  
  console.log(`\nAfter submit:`);
  console.log(`  URL: ${finalUrl}`);
  console.log(`  H1: "${finalH1?.slice(0, 60)}"`);
  console.log(`  Error elements: ${errorMsg}`);
  console.log(`  Success elements: ${successMsg}`);
  
  await browser.close();
}

async function checkApiEndpoint() {
  // Test the apply API endpoint directly
  const resp = await fetch('https://project-bdhbf.vercel.app/api/users/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Contractor',
      email: 'direct-api-test-' + Date.now() + '@test.com',
      phone: '2155551234',
      business_name: 'Test Painting LLC',
      trade_type: 'painting',
    })
  });
  console.log(`\nAPI /api/users/apply direct test: ${resp.status}`);
  const data = await resp.json().catch(() => ({}));
  console.log(`API response: ${JSON.stringify(data)}`);
}

await testApplyFlow();
await checkApiEndpoint();

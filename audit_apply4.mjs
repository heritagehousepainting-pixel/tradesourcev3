import { chromium } from 'playwright';

const BASE = 'https://project-bdhbf.vercel.app';

async function deepApplyAudit() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const responses = [];
  const consoleLogs = [];
  page.on('response', r => { if (r.url().includes('/api/')) responses.push({ url: r.url(), status: r.status() }); });
  page.on('console', msg => { consoleLogs.push({ type: msg.type(), text: msg.text() }); });
  
  await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Find service areas and trade types controls
  const controls = await page.evaluate(() => {
    const result = [];
    document.querySelectorAll('button, [role="button"], label').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.match(/\b(Painting|Drywall|Power|Interior|Exterior|Cabinet|Staining|Montgomery|Bucks|Delaware|Philadelphia/i)) {
        result.push({ tag: el.tagName, text: text.slice(0, 60), id: el.id });
      }
    });
    return result;
  });
  
  console.log('Service/trade controls found:');
  controls.slice(0, 15).forEach(c => console.log(`  ${c.tag}: "${c.text}" [${c.id}]`));
  
  // Try clicking service area options
  const serviceAreaButtons = await page.locator('button').filter({ hasText: /Montgomery|Philadelphia|Painting/i }).all();
  console.log(`\nService area/trade buttons: ${serviceAreaButtons.length}`);
  
  for (const btn of serviceAreaButtons.slice(0, 5)) {
    const text = await btn.textContent();
    const cls = await btn.getAttribute('class');
    const selected = await btn.getAttribute('aria-selected');
    console.log(`  "${text?.slice(0, 40)}" class="${cls?.slice(0, 50)}" aria-selected=${selected}`);
  }
  
  // Check if form has service_areas as checkboxes
  const checkboxes = await page.locator('input[type="checkbox"]').count();
  const radioButtons = await page.locator('input[type="radio"]').count();
  console.log(`\nCheckboxes: ${checkboxes}, Radio: ${radioButtons}`);
  
  // Check how service areas are stored in the form
  const hiddenInputs = await page.evaluate(() => {
    const result = [];
    document.querySelectorAll('input[type="hidden"], input[name]').forEach(el => {
      result.push({ name: el.name, type: el.type, value: el.value?.slice(0, 30) });
    });
    return result;
  });
  console.log('\nNamed inputs:');
  hiddenInputs.forEach(h => console.log(`  ${h.name}: "${h.value}"`));
  
  await browser.close();
}

async function checkServiceAreasInApply() {
  const fs = await import('fs');
  const src = fs.readFileSync('/Users/jack/pi-workspaces/tradesource-dev/app/apply/page.tsx', 'utf8');
  
  // Find service_areas
  const idx = src.indexOf('service_areas');
  let count = 0;
  while (idx >= 0 && count < 10) {
    const chunk = src.slice(Math.max(0, idx - 30), idx + 100);
    console.log(`service_areas at ${idx}: ${chunk}`);
    console.log();
    count++;
  }
}

async function verifyNoDoubleFooter() {
  console.log('\n=== FINAL FOOTER VERIFICATION ===');
  const browser = await chromium.launch({ headless: true });
  
  for (const w of [320, 375, 390, 430, 1440]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: w, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const footerCount = await page.locator('footer').count();
    const visibleFooters = await page.locator('footer:visible').count();
    
    // Check layout footer is hidden
    const layoutFooterHidden = await page.evaluate(() => {
      const footers = document.querySelectorAll('footer');
      if (footers.length === 0) return 'NO_FOOTERS';
      return Array.from(footers).map(f => getComputedStyle(f).display).join(',');
    });
    
    const status = visibleFooters === 1 && layoutFooterHidden !== 'none' ? '✓' : (visibleFooters > 1 ? '✗DUP' : '?');
    console.log(`  ${String(w).padStart(4)}px: total=${footerCount} visible=${visibleFooters} display=${layoutFooterHidden} ${status}`);
    await page.close();
  }
  await browser.close();
}

async function checkPostJobScopeBuilder() {
  console.log('\n=== POST-JOB SCOPE BUILDER AUDIT ===');
  const fs = await import('fs');
  const src = fs.readFileSync('/Users/jack/pi-workspaces/tradesource-dev/app/post-job/page.tsx', 'utf8');
  
  // Check for service type selection
  const hasServiceType = src.includes('TRADE_TYPES') || src.includes('serviceType') || src.includes('service_type');
  const hasScopeAssistant = src.includes('ScopeAssistant');
  const hasPhotoUploader = src.includes('PhotoUploader') || src.includes('job_photos');
  
  console.log(`  Service type selection: ${hasServiceType ? 'YES' : 'NO'}`);
  console.log(`  ScopeAssistant included: ${hasScopeAssistant ? 'YES' : 'NO'}`);
  console.log(`  Photo uploader: ${hasPhotoUploader ? 'YES' : 'NO'}`);
  
  // Check what happens after scope is generated
  const handleScopeIdx = src.indexOf('handleScopeGenerated');
  if (handleScopeIdx >= 0) {
    console.log('\nhandleScopeGenerated:');
    console.log(src.slice(handleScopeIdx, handleScopeIdx + 600));
  }
}

async function verifyConstellationOnPages() {
  console.log('\n=== CONSTELLATION HERO VERIFICATION ===');
  const browser = await chromium.launch({ headless: true });
  
  for (const [name, path] of [['/', '/'], ['/jobs', '/jobs'], ['/terms', '/terms'], ['/privacy', '/privacy-policy'], ['/contractors', '/contractors/none']]) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    const hasSvg = await page.locator('.hero-constellation').count();
    const hasDataHero = await page.evaluate(() => !!document.querySelector('[data-homepage-hero]'));
    const footerCount = await page.locator('footer').count();
    
    console.log(`  ${path.padEnd(16)} svg=${hasSvg} hero=${hasDataHero} footer=${footerCount} ${hasSvg > 0 && footerCount === 1 ? '✓' : '✗'}`);
    await page.close();
  }
  await browser.close();
}

await deepApplyAudit();
await checkServiceAreasInApply();
await verifyNoDoubleFooter();
await checkPostJobScopeBuilder();
await verifyConstellationOnPages();

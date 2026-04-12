import { chromium } from 'playwright';

const BASE = 'https://project-bdhbf.vercel.app';

async function checkApplyPageCode() {
  // Check the apply page handleSubmit function
  const fs = await import('fs');
  const src = fs.readFileSync('/Users/jack/pi-workspaces/tradesource-dev/app/apply/page.tsx', 'utf8');
  
  // Find handleSubmit
  const submitIdx = src.indexOf('handleSubmit');
  if (submitIdx < 0) { console.log('No handleSubmit found'); return; }
  
  const chunk = src.substring(submitIdx, submitIdx + 3000);
  console.log('handleSubmit snippet:');
  console.log(chunk.slice(0, 1500));
  
  // Find what happens after API response
  const afterFetch = src.indexOf('fetch(\'/api/users/apply\'');
  if (afterFetch < 0) { console.log('No fetch to apply API'); return; }
  const afterChunk = src.substring(afterFetch, afterFetch + 2000);
  console.log('\nAfter API fetch:');
  console.log(afterChunk.slice(0, 1500));
}

async function testApplyWithNetworkCapture() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const responses = [];
  page.on('response', async r => {
    if (r.url().includes('/api/')) {
      responses.push({ url: r.url(), status: r.status() });
    }
  });
  
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  await page.goto(`${BASE}/apply`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  await page.fill('#apply-full-name', 'Flow Test Contractor');
  await page.fill('#apply-email', 'flow-test-' + Date.now() + '@test.com');
  await page.fill('#apply-phone', '2155551234');
  await page.fill('#apply-license', 'PA999999');
  await page.fill('#apply-external-link', 'https://example.com/review');
  await page.fill('#apply-bio', 'Professional painter');
  
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  console.log('\nNetwork responses during submit:');
  responses.forEach(r => console.log(`  ${r.status} ${r.url()}`));
  
  console.log('\nConsole messages:');
  consoleMessages.forEach(m => {
    if (m.type === 'error' || m.type === 'warning') {
      console.log(`  [${m.type}] ${m.text.slice(0, 200)}`);
    }
  });
  
  console.log(`\nFinal URL: ${page.url()}`);
  
  await browser.close();
}

async function checkAuthFlow() {
  // Check the pending page and how auth + application flow works
  const fs = await import('fs');
  
  // Check pending page
  const pendingSrc = fs.readFileSync('/Users/jack/pi-workspaces/tradesource-dev/app/pending/page.tsx', 'utf8');
  console.log('\n=== PENDING PAGE KEY LOGIC ===');
  
  // Check what it shows to authenticated vs unauthenticated
  const authCheck = pendingSrc.includes('isAuthenticated');
  const signInSection = pendingSrc.includes('Sign in to');
  const applicationReview = pendingSrc.includes('Application Under Review');
  
  console.log(`Has isAuthenticated: ${authCheck}`);
  console.log(`Has "Sign in to": ${signInSection}`);
  console.log(`Has "Application Under Review": ${applicationReview}`);
  
  // Show key sections
  const signInIdx = pendingSrc.indexOf('Sign in to');
  if (signInIdx > 0) {
    console.log('\nSign in section:');
    console.log(pendingSrc.slice(signInIdx - 20, signInIdx + 200));
  }
}

async function checkApplySubmitLogic() {
  const fs = await import('fs');
  const applySrc = fs.readFileSync('/Users/jack/pi-workspaces/tradesource-dev/app/apply/page.tsx', 'utf8');
  
  // Find the submit handler
  const fetchIdx = applySrc.indexOf('fetch(\'/api/users/apply\'');
  if (fetchIdx < 0) {
    console.log('Searching for fetch...');
    const altFetch = applySrc.indexOf('api/users/apply');
    console.log(`Found at: ${altFetch}`);
    if (altFetch > 0) {
      console.log(applySrc.slice(altFetch - 50, altFetch + 1000));
    }
    return;
  }
  
  const afterFetch = applySrc.substring(fetchIdx, fetchIdx + 2000);
  
  // Check for redirect
  const hasRedirect = afterFetch.includes('/pending');
  const hasSetSubmitted = afterFetch.includes('setSubmitted');
  const hasError = afterFetch.includes('setError');
  
  console.log('\n=== APPLY SUBMIT LOGIC ===');
  console.log(`Has redirect to /pending: ${hasRedirect}`);
  console.log(`Has setSubmitted: ${hasSetSubmitted}`);
  console.log(`Has setError: ${hasError}`);
  
  // Show the response handling
  const resOkIdx = afterFetch.indexOf('res.ok');
  if (resOkIdx > 0) {
    console.log('\nResponse handling:');
    console.log(afterFetch.slice(resOkIdx - 20, resOkIdx + 500));
  }
}

await checkApplyPageCode();
await testApplyWithNetworkCapture();
await checkAuthFlow();
await checkApplySubmitLogic();

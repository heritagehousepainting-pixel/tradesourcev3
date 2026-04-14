const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage({ viewport: { width: 375, height: 812 } });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text().slice(0, 100));
  });

  // 1. Login as Victor (fresh timestamp credentials)
  await page.goto('https://project-bdhbf.vercel.app/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', 'victor.ren.e2e.1776189081125@gmail.com');
  await page.fill('input[type="password"]', 'TradeSourceTest2026!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('After login URL:', page.url());
  await page.screenshot({ path: 'e2e-after-login-375.png' });

  // 2. Check /my-jobs - bottom tab bar should be visible
  if (page.url().includes('/login')) {
    console.log('LOGIN FAILED - checking error');
    const errEl = await page.$('[class*="error"]');
    if (errEl) console.log('Error text:', await errEl.innerText());
  } else {
    await page.goto('https://project-bdhbf.vercel.app/my-jobs', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Check bottom tab bar
    const bodyPad = await page.evaluate(() => window.getComputedStyle(document.body).paddingBottom);
    console.log('Body padding-bottom on /my-jobs:', bodyPad);
    
    // Check for bottom tab bar elements
    const tabBarHTML = await page.evaluate(() => {
      const navs = document.querySelectorAll('nav, [class*="tab"], [class*="Tab"]');
      return Array.from(navs).map(n => ({ class: n.className.slice(0,50), tag: n.tagName })).filter(n => !n.class.includes('nav'));
    });
    console.log('Tab-like elements:', JSON.stringify(tabBarHTML));
    
    // Check the bottom-tab-bar element
    const bottomTab = await page.evaluate(() => {
      const el = document.querySelector('[class*="bottom"]');
      return el ? el.className + ' | ' + el.tagName + ' | visible:' + window.getComputedStyle(el).display : 'not found';
    });
    console.log('Bottom element:', bottomTab);
    
    await page.screenshot({ path: 'e2e-my-jobs-375.png' });

    // 3. Check /post-job AI scope builder
    await page.goto('https://project-bdhbf.vercel.app/post-job', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-post-job-375-a.png' });
    
    // Scroll down to find scope builder
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e-post-job-375-b.png' });
    
    // Check for service type selector
    const selects = await page.evaluate(() => {
      const sels = document.querySelectorAll('select');
      return Array.from(sels).map(s => ({ id: s.id, name: s.name, placeholder: s.placeholder }));
    });
    console.log('Selects on /post-job:', JSON.stringify(selects));

    // 4. Check /messages stacked layout
    await page.goto('https://project-bdhbf.vercel.app/messages', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'e2e-messages-375.png' });
    
    // Check thread list and message panel layout
    const layoutCheck = await page.evaluate(() => {
      const panels = document.querySelectorAll('[class*="thread"], [class*="message"], [class*="panel"]');
      return Array.from(panels).map(p => ({
        class: p.className.slice(0, 60),
        rect: p.getBoundingClientRect()
      }));
    });
    console.log('Layout elements:', JSON.stringify(layoutCheck.slice(0, 5)));
  }

  await browser.close();
  console.log('\ndone');
})().catch(console.error);
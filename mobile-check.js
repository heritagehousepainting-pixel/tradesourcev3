const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  await page.goto('https://project-bdhbf.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Test 1: Does the inline style have 'backdrop-filter' or 'backdropFilter'?
  const attrCheck = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('[style]')).filter(el => {
      const s = el.getAttribute('style') || '';
      return s.includes('rgba') && (s.includes('backdrop-filter') || s.includes('backdropFilter'));
    });
    if (panels.length === 0) return 'no blur panels found';
    const p = panels[0];
    return {
      style: p.getAttribute('style'),
      attrHasCamel: (p.getAttribute('style') || '').includes('backdropFilter'),
      attrHasKebab: (p.getAttribute('style') || '').includes('backdrop-filter'),
    };
  });
  console.log('Attr check:', JSON.stringify(attrCheck));
  
  // Test 2: Does our CSS selector match?
  await page.addStyleTag({ content: `[style*="backdrop-filter: blur(12px)"]{background: red !important;}` });
  await page.waitForTimeout(500);
  const hasRed = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('[style]')).filter(el => {
      const s = el.getAttribute('style') || '';
      return s.includes('rgba') && (s.includes('backdrop-filter') || s.includes('backdropFilter'));
    });
    if (panels.length === 0) return 'no panels';
    return window.getComputedStyle(panels[0]).backgroundColor;
  });
  console.log('After injected CSS (kebab):', hasRed);
  
  // Test 3: Try with no space
  await page.addStyleTag({ content: `[style*="backdrop-filter:blur(12px)"]{background: blue !important;}` });
  await page.waitForTimeout(500);
  const hasBlue = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('[style]')).filter(el => {
      const s = el.getAttribute('style') || '';
      return s.includes('rgba') && (s.includes('backdrop-filter') || s.includes('backdropFilter'));
    });
    if (panels.length === 0) return 'no panels';
    return window.getComputedStyle(panels[0]).backgroundColor;
  });
  console.log('After injected CSS (no space):', hasBlue);
  
  // Test 4: Check element's style attribute directly
  const exactCheck = await page.evaluate(() => {
    const panels = Array.from(document.querySelectorAll('[style]')).filter(el => {
      const s = el.getAttribute('style') || '';
      return s.includes('rgba') && (s.includes('backdrop-filter') || s.includes('backdropFilter'));
    });
    if (panels.length === 0) return 'no panels';
    const p = panels[0];
    const style = p.getAttribute('style') || '';
    // Check exact substring
    return {
      fullStyle: style,
      hasBackdropFilter: style.includes('backdropFilter:'),
      hasBackdropFilterWithColon: style.includes('backdropFilter: '),
      backdropFilterIdx: style.indexOf('backdropFilter'),
    };
  });
  console.log('Exact check:', JSON.stringify(exactCheck));
  
  await browser.close();
})();
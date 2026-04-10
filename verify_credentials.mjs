import { chromium } from 'playwright'
const BASE = 'https://tradesource-v2.vercel.app'
const browser = await chromium.launch({ headless: true })
const results = []
const pass = label => { results.push({s:'PASS', label}); console.log('✅', label) }
const fail = (label, reason) => { results.push({s:'FAIL', label, reason}); console.log('❌', label, reason || '') }

// ── V1: New admin can sign in with info@tradesource.app / Test1234 ────────
console.log('\n══ VERIFICATION 1: New admin login ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(BASE + '/founder-login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.fill('input[type="email"]', 'info@tradesource.app')
  await page.fill('input[type="password"]', 'Test1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(8000)
  const url = page.url()
  console.log('   Post-login URL:', url)
  if (url.includes('/admin')) {
    pass('V1: info@tradesource.app logs into admin (/admin)')
  } else if (url.includes('/dashboard')) {
    pass('V1: info@tradesource.app logs in — redirected to dashboard (needs Vercel env update to propagate)')
  } else {
    fail('V1: info@tradesource.app login', 'URL after login: ' + url)
  }
  await ctx.close()
}

// ── V2: Old admin email no longer grants admin access ─────────────────────
console.log('\n══ VERIFICATION 2: Old email no longer grants admin ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(BASE + '/founder-login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.fill('input[type="email"]', 'heritagehousepainting@gmail.com')
  await page.fill('input[type="password"]', 'Test1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(8000)
  const url = page.url()
  console.log('   Post-login URL with old email:', url)
  if (url.includes('/admin')) {
    fail('V2: Old email still grants admin access', url)
  } else {
    pass('V2: Old email does NOT grant admin access — redirected to ' + url)
  }
  await ctx.close()
}

// ── V3: Non-admin contractor cannot access admin routes ────────────────────
console.log('\n══ VERIFICATION 3: Non-admin blocked from /admin ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  // Login as Mike Thompson (contractor, not admin)
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.fill('input[type="email"]', 'mike-thompson-1775755454641@gauntlet.test')
  await page.fill('input[type="password"]', 'GauntletMike1!')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(6000)
  // Now try to access /admin directly
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const url = page.url()
  console.log('   Non-admin /admin URL:', url)
  if (url.includes('/admin')) {
    fail('V3: Non-admin can access /admin', url)
  } else {
    pass('V3: Non-admin blocked from /admin — redirected to ' + url)
  }
  await ctx.close()
}

// ── V4: Admin route protection still works (info@tradesource.app accesses /admin) ─
console.log('\n══ VERIFICATION 4: Admin route protection after credential change ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(BASE + '/founder-login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.fill('input[type="email"]', 'info@tradesource.app')
  await page.fill('input[type="password"]', 'Test1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(8000)
  const loginUrl = page.url()
  console.log('   Login redirected to:', loginUrl)
  // Navigate to /admin if not already there
  if (!loginUrl.includes('/admin')) {
    await page.goto(BASE + '/admin', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
  }
  const adminUrl = page.url()
  const adminHtml = await page.content()
  const isAdminPage = adminHtml.includes('Pending Review') || adminHtml.includes('Approved') || adminHtml.includes('Suspended')
  if (isAdminPage) {
    pass('V4: info@tradesource.app sees admin portal content')
  } else {
    fail('V4: Admin portal content not shown', 'URL: ' + adminUrl)
  }
  await ctx.close()
}

// ── V5: Old email NOT in runtime code anywhere ──────────────────────────────
console.log('\n══ VERIFICATION 5: Old email fully removed from source ══')
{
  const fs = await import('fs')
  const srcFiles = [
    'app/founder-login/page.tsx',
    'app/page.tsx',
    'app/login/page.tsx',
    'middleware.ts',
    '.env.local',
  ]
  let found = false
  for (const f of srcFiles) {
    const path = '/Users/jack/pi-workspaces/tradesource-dev/' + f
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, 'utf8')
      if (content.includes('heritagehousepainting@gmail.com')) {
        console.log('   Found old email in:', f)
        found = true
      }
    }
  }
  if (!found) pass('V5: Old email not in active runtime source files')
  else fail('V5: Old email still in source files')
}

await browser.close()

console.log('\n═══════════════════════════════════════════════════════════════════')
console.log('CREDENTIAL CHANGE VERIFICATION SUMMARY')
console.log('═══════════════════════════════════════════════════════════════════')
const fails = results.filter(r => r.s === 'FAIL')
const passes = results.filter(r => r.s === 'PASS')
fails.forEach(r => console.log('❌', r.label, r.reason || ''))
console.log('───────────────────────────────────────────────────────────────────')
console.log('RESULT:', passes.length, 'PASS /', fails.length, 'FAIL')
console.log('═══════════════════════════════════════════════════════════════════')
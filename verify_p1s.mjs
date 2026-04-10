import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const BASE = 'https://tradesource-v2.vercel.app'
const browser = await chromium.launch({ headless: true })
const env = readFileSync('/Users/jack/pi-workspaces/tradesource-dev/.env.local', 'utf8')
const get = k => { const m = env.match(new RegExp(k + '=(.+)')); return m ? m[1].trim() : null }
const supabase = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))
const results = []

// ── P1-1: Apply form has password field ─────────────────────────────────
console.log('\n══ P1-1: Apply form — password field visible ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(BASE + '/apply', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const html = await page.content()
  const hasPwd = html.includes('Set Your Password') || html.includes('apply-password')
  const hasHint = html.includes('Create a password') || html.includes('min. 8 characters')
  console.log('  Password field:', hasPwd ? '✅' : '❌')
  console.log('  Hint text:', hasHint ? '✅' : '❌')
  results.push({ p: 'P1-1: Apply form password field', pass: hasPwd && hasHint })
  await ctx.close()
}

// ── P1-3: Review count clickable on contractor profile ──────────────
console.log('\n══ P1-3: Review count clickable on contractor profile ══')
{
  const { data: reviewData } = await supabase.from('reviews').select('contractor_id').limit(1)
  const reviewContractorId = reviewData && reviewData[0] && reviewData[0].contractor_id
  if (reviewContractorId) {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    // Need auth for /api/users to return contractor data
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
    await page.fill('input[type="email"]', 'sarah-chen-1775755454641@gauntlet.test')
    await page.fill('input[type="password"]', 'GauntletSarah2!')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(5000)
    await page.goto(BASE + '/contractors/' + reviewContractorId, { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)
    const html = await page.content()
    const reviewCountBtns = await page.locator('button', { hasText: /\(\d+ review/ }).count()
    const hasShowAll = html.includes('Show all') || html.includes('Show fewer') || html.includes('Collapse')
    console.log('  Review count button:', reviewCountBtns > 0 ? '✅' : '❌')
    console.log('  Expand/Collapse UI:', hasShowAll ? '✅' : '❌')
    results.push({ p: 'P1-3: Review count clickable', pass: reviewCountBtns > 0 && hasShowAll })
    await ctx.close()
  } else {
    console.log('  ⚠️  No reviews in DB — test skipped')
    results.push({ p: 'P1-3: Review count clickable', pass: null, detail: 'No reviews in DB' })
  }
}

// ── P1-4: ToS dispute resolution updated ─────────────────────────────────
console.log('\n══ P1-4: ToS dispute resolution wording ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(BASE + '/terms', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  // Expand Dispute Resolution section
  await page.locator('button', { hasText: 'Dispute Resolution' }).click()
  await page.waitForTimeout(500)
  const html = await page.content()
  const hasNoDispute = html.includes('does not resolve disputes')
  const hasMediation = html.includes('mediation') && html.includes('American Arbitration')
  const hasDirect = html.includes('directly between')
  console.log('  "does not resolve disputes":', hasNoDispute ? '✅' : '❌')
  console.log('  Mediation/AAA language removed:', !hasMediation ? '✅' : '❌')
  console.log('  "directly between parties":', hasDirect ? '✅' : '❌')
  results.push({ p: 'P1-4: ToS dispute resolution', pass: hasNoDispute && !hasMediation })
  await ctx.close()
}

// ── P1-5: Forgot password wired ─────────────────────────────────────────
console.log('\n══ P1-5: Forgot password wired on login ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const html = await page.content()
  const hasForgot = html.includes('Forgot password')
  const hasResetBtn = html.includes('Send Reset Link') || html.includes('Send Reset')
  // Click it
  await page.locator('button', { hasText: 'Forgot password?' }).first().click()
  await page.waitForTimeout(1000)
  const htmlAfter = await page.content()
  const hasResetForm = htmlAfter.includes('Reset your password') || htmlAfter.includes('Send Reset')
  console.log('  "Forgot password?" text:', hasForgot ? '✅' : '❌')
  console.log('  Reset form shown after click:', hasResetForm ? '✅' : '❌')
  results.push({ p: 'P1-5: Forgot password wired', pass: hasForgot && hasResetForm })
  await ctx.close()
}

// ── P1-6: Homepage vetting copy — all 5 items ─────────────────────────
console.log('\n══ P1-6: Homepage vetting copy — all 5 items ══')
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const html = await page.content()
  const items = [
    ['license', html.includes('license')],
    ['insurance', html.includes('insurance')],
    ['W-9', html.includes('W-9')],
    ['experience', html.includes('experience')],
    ['external review', html.includes('external review')],
  ]
  items.forEach(([label, pass]) => console.log(`  ${label}: ${pass ? '✅' : '❌'}`))
  const allPass = items.every(([, p]) => p)
  results.push({ p: 'P1-6: Homepage vetting copy', pass: allPass })
  await ctx.close()
}

// ── P1-2: Approval email code wired ──────────────────────────────────
console.log('\n══ P1-2: Approval creates auth user + sends email ══')
{
  const fs = await import('fs')
  const route = fs.readFileSync('/Users/jack/pi-workspaces/tradesource-dev/app/api/users/[id]/route.ts', 'utf8')
  const hasCreateUser = route.includes('supabase.auth.admin.createUser')
  const hasRawPwd = route.includes('existing.raw_password')
  const hasEmailConfirm = route.includes('email_confirm: true')
  const hasWelcomeEmail = route.includes('Welcome2025!') // fallback temp password
  console.log('  createUser call:', hasCreateUser ? '✅' : '❌')
  console.log('  Uses raw_password from DB:', hasRawPwd ? '✅' : '❌')
  console.log('  email_confirm: true (triggers Supabase email):', hasEmailConfirm ? '✅' : '❌')
  console.log('  Temp fallback (Welcome2025!):', hasWelcomeEmail ? '✅' : '❌')
  results.push({ p: 'P1-2: Approval creates auth user + email', pass: hasCreateUser && hasRawPwd && hasEmailConfirm })
}

await browser.close()

// ── Summary ───────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════════')
console.log('P1 FIX VERIFICATION RESULTS')
console.log('═══════════════════════════════════════════════════════════════════')
results.forEach(r => {
  const icon = r.pass === null ? '⚠️' : r.pass ? '✅' : '❌'
  console.log(`${icon} ${r.p}`)
  if (r.detail) console.log(`    → ${r.detail}`)
})
const passed = results.filter(r => r.pass === true).length
const failed = results.filter(r => r.pass === false).length
const skipped = results.filter(r => r.pass === null).length
console.log('═══════════════════════════════════════════════════════════════════')
console.log(`${passed} PASS / ${failed} FAIL / ${skipped} SKIPPED`)
console.log('═══════════════════════════════════════════════════════════════════')
import { chromium } from 'playwright'
const BASE = 'https://tradesource-v2.vercel.app'
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext()
const page = await ctx.newPage()
// Login as Sarah Chen first
await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'sarah-chen-1775755454641@gauntlet.test')
await page.fill('input[type="password"]', 'GauntletSarah2!')
await page.click('button[type="submit"]')
await page.waitForTimeout(5000)
// Now navigate to Sarah Chen's profile
const cid = '1b8e08b1-8b45-43d6-9b72-f525fec8f931'
await page.goto(BASE + '/contractors/' + cid, { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
const allBtns = await page.locator('button').allTextContents()
const reviewBtns = allBtns.filter(b => b.includes('review'))
console.log('All buttons:', JSON.stringify(allBtns))
console.log('Review count buttons:', JSON.stringify(reviewBtns))
console.log('P1-3 PASS:', reviewBtns.length > 0 ? 'YES' : 'NO')
await browser.close()
process.exit(0)
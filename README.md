# TradeSource

A premium contractor-to-contractor network platform.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** — cookie-based auth via `@supabase/ssr`
- **Tailwind CSS**

## Auth & Access Model
- Auth truth: Supabase session (cookie-based, server + browser)
- Access truth: canonical `UserAccess` object resolved via `resolveUserAccess()`
- Founder/admin: `NEXT_PUBLIC_FOUNDER_EMAILS` env var + Supabase session
- No `localStorage` used for auth or permission checks

## Protected Pages
| Route | Access |
|-------|--------|
| `/dashboard` | Any authenticated user |
| `/profile` | Any authenticated user |
| `/my-jobs` | Any authenticated user |
| `/post-job` | Authenticated + approved contractor or founder |
| `/admin` | Founder/admin only (middleware-enforced) |

## Development
```bash
npm install
npm run dev
```

## Environment Variables
See `.env.local.example` (do not commit secrets).

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_FOUNDER_EMAILS`
- `ASSISTANT_ENABLED` (if using the assistant)
- `MINIMAX_API_KEY` (if using the assistant)

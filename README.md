# TradeSource MVP v2

A premium contractor network platform.

## Tech Stack
- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase (API-only, no localStorage)

## Pages
- `/` - Homepage
- `/apply` - Contractor signup
- `/login` - Login
- `/dashboard` - Contractor dashboard
- `/jobs` - Available jobs
- `/post-job` - Post a job
- `/my-jobs` - My jobs
- `/pending` - Pending approval
- `/admin` - Admin dashboard

## API Routes
- `/api/stats` - Platform stats
- `/api/users` - User management
- `/api/users/[id]` - User by ID
- `/api/jobs` - Job management

## Development
```bash
npm run dev   # Start dev server
npm run build # Production build
```

## v1 Learnings Applied
1. No localStorage seeding in layout
2. API-only data fetching (no localStorage fallbacks)
3. Admin uses API not localStorage
4. Premium UI with visible stats

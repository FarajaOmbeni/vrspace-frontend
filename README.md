# VR Space

Website and staff app for **VR Space**, a VR gaming venue at The Waterfront Karen, Nairobi ([vrspace.co.ke](https://vrspace.co.ke)).

- **Public site** (`/`, `/experiences`, `/about`, `/contact`, `/marketplace`): what we offer, how to find us, Meta Quest sales.
- **Staff app** (`/admin`): clock in/out, logging VR sessions, daily sales and partner reconciliation (50/50 revenue split), finance, payroll, reports. Built phone-first: staff use it on their phones at the venue.

## Stack

Vue 3 + Vite + Tailwind CSS, hosted on Netlify. Backend is Supabase (Postgres, Auth, Storage, one Edge Function). Contact form and Marketplace orders are sent with EmailJS.

## Setup

```sh
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

`.env`:

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` | EmailJS dashboard |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build into `dist/` (not committed) |
| `npm test` | Unit tests (money, hours, dates, CSV, pagination) |
| `npm run lint` | ESLint (fixes what it can) |

## Database (Supabase)

Migrations are in `supabase/migrations/` and are **run by hand in the Supabase SQL editor, in number order**. They are not applied automatically on push, and `supabase db push` would try to re-run old ones, so use the SQL editor.

The Edge Function that creates staff accounts is deployed separately:

```sh
supabase functions deploy create-employee
```

Supabase → Authentication → Sign In / Providers → **"Allow new users to sign up" must stay off**. Staff accounts are created by admins in the app.

## Deploying

Netlify builds from this repo: build command `npm run build`, publish directory `dist`. `public/_redirects` makes page refreshes work for app routes.

## Things to know

- **Time zone:** everything is East Africa Time (Africa/Nairobi), in both the app (`src/utils/date.js`) and the database (`eat_today()`), whatever time zone a phone is set to.
- **Contact details** (phone numbers, WhatsApp, address, hours, socials) live in `src/config/business.js`. They're repeated for Google in `index.html` (JSON-LD): change both.
- **Money rules** (which revenue figure counts, profit/loss, write-offs) are in `src/utils/finance.js`; pay and overtime in `src/utils/payroll.js`. Screens should use these rather than doing their own maths.
- **Reports** fetch all rows with `src/lib/fetchAll.js`, since Supabase returns at most 1,000 rows per request.
- **Session logging works offline:** sessions are saved on the phone and sent when the connection returns (`src/services/sessionQueue.js`).
- **Activity log:** edits and deletions of money and attendance data are recorded by database triggers (Admin → Activity Log).

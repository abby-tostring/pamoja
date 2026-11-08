# Pamoja — Split the cost, keep the friendship

A full-stack group-expense tracking web app built with Next.js 15, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage, Recharts, and React PDF. Designed for Kenyan and international groups.

## Setup

1. Install Node.js 20+.
2. Run `npm install`.
3. Create a free Supabase project at https://supabase.com.
4. Open the Supabase SQL Editor, paste and execute `supabase/schema.sql` **once on a fresh project**. This creates tables, RLS policies, triggers, functions, and the private `receipts` storage bucket.
5. Copy `.env.example` to `.env.local`. Replace placeholders with **Project URL** and **anon/publishable key** from Supabase project settings. **Never use a service-role/secret key in NEXT_PUBLIC variables.**
6. In Supabase > Authentication > URL Configuration, set your Site URL to `http://localhost:3000` for local development. Add `http://localhost:3000/**` and your deployed domain to allowed redirect URLs.
7. Enable Email authentication. For Google sign-in, enable Google provider in Supabase and configure OAuth client credentials and the callback URL shown by Supabase. Email confirmation is optional for development; if enabled, configure SMTP and templates appropriately for production.
8. Run `npm run dev` and visit http://localhost:3000. Register a user. Create a group. Invite another registered user using an invitation link.
9. For deployment, import the repository into Vercel, set both environment variables in Vercel project settings, add your Vercel domain to Supabase redirect URLs, then deploy.

## Features

- Marketing landing page, responsive authenticated dashboard, light/dark mode
- Email/password registration and login, Google OAuth when configured, profiles
- Private groups with membership-based access controls
- Invite links (14-day expiry), optional email restriction, mailto handoff
- Group expenses with category, date, payer, notes, optional private receipt upload
- Equal, percentage, and custom splits, validated atomically by database RPC
- Cent-accurate splitting, group net balances and simplified debt suggestions
- Manual settlement records and M-Pesa instructions (no live transfers)
- Group activity, category breakdowns, monthly spending charts, PDF reports
- Per-group currency (KES, USD, EUR, GBP, UGX, TZS, ZAR, INR, CAD, AUD)

## Important product boundaries

- Pamoja **does not process payments**, check M-Pesa transactions, or send automatic email invitations. The invite action creates a link and offers a prefilled email via your email application.
- Each group has one currency. There is **no exchange-rate conversion**. Never sum balances from groups with different currencies.
- A settlement is a manual record, not a payment confirmation from M-Pesa.
- There is no sample-data auto-seeding because this would add fake financial transactions to real user accounts. The landing page uses clearly illustrative Diani data.
- Supabase project configuration and Google OAuth credentials are required for live multi-user functionality; these are deliberately excluded from the ZIP.
- Production-hardening items: add rate limits and anti-abuse controls, email delivery service, invitation revocation UI, stronger file upload malware scanning, audit logs, accessibility testing, browser E2E tests, and observability. Treat this as a portfolio-ready foundation rather than a security-audited banking product.

## Data model

`profiles` ← `groups` ← `group_members` · `expenses` ← `expense_splits` · `settlements` · `invitations`. Private receipts are in Supabase Storage, with group-membership-based read policies.

## Checks

`npm run typecheck`, `npm run build`, `npm run lint`.

## Suggested manual QA

1. Register Alice and Bob; verify login and sign out.
2. Alice creates a KES group, shares invite; Bob accepts and sees it.
3. Alice adds KES 100 split equally: Alice +50, Bob −50.
4. Bob pays Alice KES 50 outside the app, records settlement: both balances zero.
5. Add a KES 101 expense split three ways; verify rounded amounts total exactly 101.
6. Try invalid percentages (90%), invalid custom sum, non-member access, expired invite, oversized receipt.
7. Test PDF export, group chart, dark mode, keyboard focus, narrow mobile viewport.

## License

MIT (see LICENSE).

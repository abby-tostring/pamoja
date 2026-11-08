# Pamoja 2.0 — final full-stack integration

This is the **Next.js/Supabase application**, restyled with the emerald Gen Z design from the vanilla demo. The vanilla `index.html` is not deployed: Next.js routes are the source of truth.

## Run locally (PowerShell)
1. Open THIS directory in VS Code (the directory containing `package.json`).
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`: `Copy-Item .env.example .env.local`.
4. Enter your Supabase project URL and **publishable/anon** key. Never use a service-role key in the browser.
5. In Supabase SQL Editor, run `supabase/schema.sql` on a **new database only**. For an existing Pamoja database, do not rerun the schema. Run `supabase/reactions-migration.sql` once to enable reactions.
6. Configure Supabase Authentication > URL Configuration with localhost and deployed Vercel URL. Enable email/password and configure Google OAuth separately if desired.
7. Run `npm run dev`, open http://localhost:3000. Test with two distinct accounts.
8. Run `npm run typecheck`, `npm run lint`, `npm run build` before deploying.

## GitHub
From this folder, commit on a new branch to preserve the original: `git checkout -b feat/pamoja-v2`, `git add .`, `git commit -m "Redesign Pamoja and connect expense reactions"`, `git push -u origin feat/pamoja-v2`. Open a pull request. If your Git repository is one directory above, copy these files into its `pamoja/` directory instead, and run Git commands from the repository root.

## Vercel
Import the GitHub repo. If the repo contains the original outer `index.html` and a nested `pamoja/` Next.js project, set **Root Directory** to `pamoja`. Use Next.js preset and add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Vercel environment variables. Deploy; add your Vercel URL to Supabase auth allowed URLs.

## What is live vs local
**Supabase-backed:** users, groups, invitations, expenses, split modes, receipt storage, settlement records, PDF export, expense reactions. **Browser-only:** personal budget amount and savings check-in streak. The budget widget intentionally labels KES-only, recent expenses and is NOT an account balance. M-Pesa is instructions and manual settlement records, not a payment gateway. Group balances remain currency-specific.

## Quality and security
The database uses RLS and an atomic expense creation RPC. The new reaction table has member-scoped read policies and owner-scoped writes. No credentials are included. Always validate permissions and test on a staging Supabase project before real use.

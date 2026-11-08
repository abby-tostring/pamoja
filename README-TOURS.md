# Pamoja 2.1 — Landing page + guided tours

This update is based on the Pamoja 2.0 Next.js full-stack project. It **does not** replace Supabase configuration or change the database schema.

## Updated files
- `app/page.tsx`: redesigned public landing page (why, who, what, features, how, FAQs, product preview)
- `app/globals.css`: landing and tour design system
- `components/shell.tsx`: in-app tour trigger and tour targets
- `components/guided-tour.tsx`: accessible client-side guided tour with progress, next/back, skip, Escape key, focus return and completion tracking
- `components/tour-steps.ts`: landing and app tour copy

## Install into your existing repo
1. Back up or commit your existing changes first.
2. Copy **only the five files above** into `pamoja/` in your local repo, keeping the relative paths. Do not overwrite `.env.local`.
3. Run `npm install`, `npm run typecheck`, `npm run build`, then `npm run dev` inside `pamoja/`.
4. Visit `/` for the new public landing page and click **Tour**. Sign in, visit `/dashboard`, and use the **Tour** button in the top bar. The in-app tour automatically opens once per browser unless already completed.
5. Test at desktop and mobile widths, then commit and push.

Tours store only their completed/not-completed status in browser `localStorage` (`pamoja-tour-completed-landing` and `pamoja-tour-completed-dashboard`). Clear those keys to see first-run behavior again. The landing preview is explicitly labeled as illustrative, not real account data.

### Deployment
Vercel: Framework Next.js, Root Directory `pamoja`, environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured in Vercel settings. Add your production URL to Supabase Auth URL configuration. Never commit `.env.local`.

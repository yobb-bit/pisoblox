# RobloxPH Market — Project Context

## About the Developer
- Name: John Kent Blancaflor
- 2nd year BSIT student, still learning
- Not yet familiar with Next.js, TypeScript, Tailwind, React, or Supabase
- Learning by building real projects that solve real-world problems
- Goal: build real, working products — not just practice exercises

## What This Project Is
A **Filipino Roblox marketplace** where buyers and sellers can find each other safely.
- Targeted at the Philippine Roblox trading community
- Solves the scam problem in PH Roblox trading
- All UI text is in **Filipino (Tagalog)**
- Payment context is Philippine e-wallets (GCash, PayMaya)

## Tech Stack
| Tool | Purpose |
|---|---|
| Next.js 16 (App Router) | Full-stack framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| React | UI components |
| Supabase | Auth + PostgreSQL database + file storage |
| Vercel | Hosting/deployment |

## How to Run
```bash
npm run dev
# visits localhost:3000
```

## Environment Variables
File: `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://zooggrjlrdkiaszszaig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Project Structure
```
src/
  app/
    page.tsx                  # Home/landing page
    layout.tsx                # Root layout with Navbar + ThemeProvider
    auth/
      login/page.tsx          # Login page
      register/page.tsx       # Register page
    listings/
      page.tsx                # Browse listings page
      create/page.tsx         # Create listing form
      [id]/page.tsx           # Listing detail + Contact Seller popup
    profile/
      page.tsx                # Logged-in user's own profile
  components/
    Navbar.tsx                # Top navigation bar
    ThemeToggle.tsx           # Dark/light mode toggle button
    ThemeProvider.tsx         # next-themes wrapper
    ListingCard.tsx           # Reusable listing card for browse grid
    ContactSellerModal.tsx    # Warning popup before going to Facebook
  lib/
    supabase/
      client.ts               # Browser Supabase client
      server.ts               # Server Supabase client
  middleware.ts               # Protects /listings/create and /profile routes
  types/index.ts              # TypeScript types (Listing, Category)
supabase-schema.sql           # Run this in Supabase SQL Editor to set up DB
```

## Database (Supabase)
Two tables: `listings` and `profiles`

`listings`: `id`, `created_at`, `user_id`, `title`, `description`, `price`, `category`, `image_url`, `facebook_link`, `seller_username`, `is_sold`

`profiles`: `id`, `username`, `listing_limit` (default 10), `is_admin` (default false), `created_at`
- Auto-created via trigger on auth.users insert
- To make someone admin: `update public.profiles set is_admin = true where username = 'xxx';`

RLS: public read, authenticated insert/update/delete (owner only), admins can update any profile

## Key Features
**Contact Seller Warning Popup** — modal with Filipino safety tips, middleman reminder, checkbox confirm, opens Facebook link

**Listing Limit System** — free = 10 listings, upgrade = ₱49/month per +5 slots, admin grants slots manually via dashboard

**Admin Dashboard** — `/admin` (admin only), shows all sellers, listing counts, +/- limit buttons

## Coding Rules for This Project
- All user-facing text must be in **Filipino (Tagalog)**
- Explain code changes simply — developer is still learning
- When explaining concepts, use simple analogies, not jargon
- Keep components clean and readable — this is a learning project
- Dark/light theme must always work on all new pages/components

## Roadmap (What's Next)
### Short Term
- [x] Public seller profile page `/profile/[id]`
- [x] Listing limit system (free = 10, paid = +5 per ₱49)
- [x] Admin dashboard
- [ ] Review/rating system — buyers/sellers can rate each other after a trade
- [ ] Report a scammer — form to report with evidence upload

### Medium Term
- [ ] Deploy to Vercel — make the site live
- [ ] Listing bump/featured listings — sellers pay to appear on top

### Long Term
- [ ] Mobile app (React Native)

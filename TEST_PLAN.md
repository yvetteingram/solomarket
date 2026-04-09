# SoloMarket Pre-Launch Test Plan

## 1. Authentication & Authorization

### 1.1 Sign Up
- [ ] New user can sign up with email/password
- [ ] Validation: empty fields show errors, invalid email format rejected
- [ ] After signup, user is redirected to onboarding (`/welcome`)
- [ ] `ensure-profile` API is called on first sign-in (creates `profiles` row)
- [ ] Duplicate email shows appropriate error

### 1.2 Login
- [ ] Existing user can log in with email/password
- [ ] Wrong password shows error (not a crash)
- [ ] Successful login redirects to `/` (Dashboard) for returning users
- [ ] Successful login redirects to `/welcome` for brand-new users with no data
- [ ] Google OAuth button loads and redirects correctly
- [ ] After Google OAuth, user lands in app (not a blank screen)

### 1.3 Session Persistence
- [ ] Refreshing the page keeps the user logged in
- [ ] Session survives closing and reopening the tab
- [ ] Plan/tier is correctly loaded after session restore (calls `/api/profile`)
- [ ] Sidebar shows correct plan label (Free Plan, Starter Plan, Growth Plan, etc.)

### 1.4 Logout
- [ ] Clicking Logout signs the user out
- [ ] After logout, navigating to any protected route redirects to Landing Page
- [ ] Sidebar and user info are cleared

### 1.5 Route Protection
- [ ] Unauthenticated users visiting `/`, `/settings`, `/plans`, etc. see Landing Page (not a crash)
- [ ] `/login`, `/signup`, `/quick-start`, `/demo` are accessible without auth
- [ ] After login, navigating to `/login` or `/signup` doesn't loop

---

## 2. Onboarding

- [ ] Brand-new user with no products/plans/posts is redirected to `/welcome`
- [ ] Onboarding steps load correctly (product setup, plan generation, content creation)
- [ ] Completing any step marks `onboarding_done_{userId}` in localStorage
- [ ] Returning user with existing data is NOT redirected to `/welcome`
- [ ] Onboarding can be manually reached from Quick Start (`/quick-start`)
- [ ] Quick Start screen loads and displays correctly without auth

---

## 3. Navigation

### 3.1 Sidebar (Desktop)
- [ ] All 12 nav items render: Dashboard, Plans, Systems, Content Lab, Calendar, Leads, Analytics, AI Assistant, Marketplace, Agency, Settings, Quick Start
- [ ] Active item is highlighted correctly on each page
- [ ] Sidebar collapse/expand works (chevron button)
- [ ] Collapsed state shows only icons (no labels)
- [ ] Collapsed state: logo hidden, toggle still visible
- [ ] User email + plan badge shown at bottom (expanded state)
- [ ] Send Feedback button opens modal

### 3.2 Mobile Navigation
- [ ] Hamburger menu button visible on mobile (< md breakpoint)
- [ ] Tapping hamburger opens sidebar overlay
- [ ] Tapping a nav item closes the mobile sidebar
- [ ] Tapping the backdrop overlay closes the sidebar
- [ ] Mobile header shows SoloMarket logo + hamburger

### 3.3 Feedback Modal
- [ ] Opens on "Send Feedback" click
- [ ] Textarea accepts input
- [ ] Send button disabled when textarea is empty
- [ ] Clicking Send opens `mailto:` link with prefilled subject/body
- [ ] Success state shows "Thanks!" message and auto-closes
- [ ] Cancel button closes modal

---

## 4. Landing Page & Public Pages

- [ ] Landing page loads for unauthenticated users at all routes
- [ ] CTAs ("Get Started", "Watch Demo") work correctly
- [ ] "Watch Demo" opens the Demo page / video player
- [ ] Demo page (`/demo`) loads without auth, video player renders
- [ ] SEO metadata: `<title>`, meta description, og:tags present in page source
- [ ] `robots.txt` accessible at `/robots.txt`
- [ ] `sitemap.xml` accessible at `/sitemap.xml`

---

## 5. Dashboard

- [ ] Dashboard loads with summary metrics
- [ ] If no data yet, empty states / prompts to create content show
- [ ] Metrics load from API without crashing
- [ ] Navigation from dashboard cards routes to correct screens

---

## 6. Plans Screen

- [ ] Plans screen loads at `/plans`
- [ ] User can input business/product info to generate a marketing plan
- [ ] AI generation calls the backend (not direct LLM from client)
- [ ] Generated plan displays correctly
- [ ] Free tier limit is enforced (1 plan generation for free users)
- [ ] Upgrade prompt shown when free limit hit
- [ ] Paid users can generate unlimited plans

---

## 7. Content Lab

- [ ] Content Lab loads at `/content`
- [ ] User can generate content drafts (social posts, email, etc.)
- [ ] Free tier: limited generations; paid: unlimited
- [ ] Draft output displays with copy/export options
- [ ] Platform-specific content (Instagram, LinkedIn, etc.) renders correctly

---

## 8. Systems (Campaigns)

- [ ] Systems screen loads at `/campaigns`
- [ ] Available campaign systems list renders
- [ ] Installing a system works (campaignInstaller)
- [ ] Installed systems appear in user's workspace
- [ ] Plan-gated systems show lock/upgrade prompt for free users

---

## 9. Calendar

- [ ] Calendar loads at `/calendar`
- [ ] Scheduled posts/content items appear on correct dates
- [ ] User can create/schedule a new post
- [ ] Navigating months works
- [ ] Empty state shows on months with no scheduled content

---

## 10. Leads

- [ ] Leads screen loads at `/leads`
- [ ] Lead list renders (or empty state if none)
- [ ] User can add a lead manually
- [ ] Lead details display correctly

---

## 11. Analytics

- [ ] Analytics loads at `/analytics`
- [ ] Metrics display (or graceful empty state)
- [ ] Charts render without JS errors

---

## 12. AI Assistant

- [ ] AI Assistant loads at `/ai-assistant`
- [ ] Chat input accepts messages
- [ ] Responses stream back from backend
- [ ] Conversation history persists within session

---

## 13. Marketplace

- [ ] Marketplace loads at `/marketplace`
- [ ] Available add-ons / premium systems listed with descriptions
- [ ] Gumroad buy links work and open correctly
- [ ] Add-on access flags checked from `profiles` table
- [ ] Purchased add-ons show as "Unlocked" (not "Buy")

---

## 14. Agency

- [ ] Agency screen loads at `/agency`
- [ ] Agency creation form works (name, workspace, etc.)
- [ ] Error shown when agency creation fails
- [ ] Agency dashboard shows correct workspace info after creation
- [ ] Agency features gated to Agency plan users

---

## 15. Settings

### 15.1 Profile
- [ ] Settings loads at `/settings`
- [ ] Name, bio, and other profile fields populate from API
- [ ] Editing and saving fields updates `profiles` in Supabase
- [ ] Success toast/confirmation shown on save

### 15.2 Avatar Upload
- [ ] Avatar upload button visible
- [ ] Clicking opens file picker (image files only)
- [ ] After selecting image: file is base64-encoded and POSTed to `/api/upload-avatar`
- [ ] Server uploads to `avatars` Supabase Storage bucket using service role key
- [ ] Avatar URL saved to profile and displayed
- [ ] Error message shown if upload fails (clear, not "bucket not found")
- [ ] Large file or wrong type shows appropriate error

### 15.3 Subscription & Billing
- [ ] 4-plan comparison grid renders (Free, Starter, Growth, Agency)
- [ ] Current plan shows "Your Plan" badge on correct tier
- [ ] Plan feature lists render for each tier
- [ ] "Get [Plan]" buttons link to correct Gumroad URLs for non-current plans
- [ ] Plan correctly resolves: `pro` → Growth, `founder` → Agency
- [ ] Sidebar plan label matches Settings plan label

### 15.4 Developer Tools (Owner Only)
- [ ] Panel visible when logged in as `ketorah.digital@gmail.com`
- [ ] Panel visible when `localStorage.getItem('devmode') === '1'`
- [ ] Plan switcher dropdown shows all 6 options: free, starter, growth, agency, pro, founder
- [ ] Clicking "Switch Plan" calls `PATCH /api/profile` and reloads page
- [ ] Non-owner users cannot see or access the panel (UI hidden + API returns 403)

---

## 16. Plan Gating & Access Control

- [ ] Free users: see upgrade prompts on gated features (not crashes)
- [ ] Starter plan: correct features unlocked
- [ ] Growth plan: correct features unlocked (includes premium systems)
- [ ] Agency plan: all features + agency workspace
- [ ] Add-on access columns (`solomarket_youtube_access`, etc.) gate Marketplace features
- [ ] Plan enforcement happens server-side, not only client-side

---

## 17. API Endpoints (Netlify Functions)

- [ ] `GET /api/profile` — returns plan + addon access flags
- [ ] `POST /api/ensure-profile` — creates profile row on first login
- [ ] `PATCH /api/profile` — owner-only plan switch (403 for non-owners)
- [ ] `POST /api/upload-avatar` — accepts base64, uploads, returns public URL
- [ ] `GET /api/products` — returns user's products
- [ ] `GET /api/plans` — returns user's marketing plans
- [ ] `GET /api/posts` — returns user's posts
- [ ] All endpoints return 401 for missing/invalid auth token
- [ ] All endpoints return structured JSON errors (not raw stack traces)

---

## 18. Purchasing Flow (Gumroad)

- [ ] Gumroad buy links open in new tab
- [ ] After purchase, Gumroad sends ping to central webhook
- [ ] Webhook updates `profiles.plan` and `subscription_status` in Supabase
- [ ] User logs out and back in → new plan reflected in sidebar + Settings
- [ ] If user bought before registering, `pending_subscriptions` catches it and applies on signup
- [ ] Cancellation webhook sets `subscription_status = 'inactive'`, plan reverts to free behavior

---

## 19. Mobile Responsiveness

- [ ] Landing page readable and functional on 375px (iPhone SE)
- [ ] Auth forms usable on mobile
- [ ] Onboarding usable on mobile
- [ ] Sidebar overlay works on mobile (no layout shift)
- [ ] Dashboard, Plans, Settings usable at 375px
- [ ] Plan comparison grid scrolls or stacks on small screens
- [ ] Calendar navigable on mobile

---

## 20. Error States & Edge Cases

- [ ] Network offline: API calls show error messages, not blank screens
- [ ] Supabase env vars missing: Config error screen shown (not a crash)
- [ ] Invalid routes: `*` redirects to Dashboard
- [ ] Session expired mid-use: user redirected to login
- [ ] AI generation API failure: clear error shown to user
- [ ] Avatar bucket missing or misconfigured: error message shown (not silent failure)

---

## Pre-Launch Checklist

- [ ] All Netlify env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`
- [ ] Supabase `avatars` bucket exists and is public
- [ ] Supabase `profiles` table has all 8 `solomarket_*_access` columns
- [ ] Gumroad products added to `PRODUCT_MAP` in central webhook
- [ ] Gumroad product ping endpoints set to central webhook URL
- [ ] Gumroad product fulfillment notes direct buyers to sign into SoloMarket
- [ ] `robots.txt` and `sitemap.xml` deployed and accessible
- [ ] Demo video at `public/demo/solomarket-demo.mp4` (or stream URL set)
- [ ] Google OAuth redirect URI configured in Supabase + Google Cloud Console
- [ ] All plan Gumroad URLs in Settings are live and correct

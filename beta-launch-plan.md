# SoloMarket Beta Launch Plan

## Beta Round 1 — March 2026

---

## Tester Feedback Summary

**Source:** Power user from LinkedIn / Skool community (March 30, 2026)

### Raw Feedback

> "The Marketing Plan results are quiet generic that one could get with using ChatGPT or Gemini. What might improve the results is to be more specific. For example, one point in the plan was 'Partner with 5 writing communities to offer exclusive discounts'. If the AI result could show which community to reach out and how much discount to offer, that would be great."

> "It'd also be great to connect the steps in the plans with other features of the app. For example, the plan states, 'Launch twitter and LinkedIn campaign'. We can have this plan connect with the campaign feature. Another example, 'Send personalized emails to inactive users to re-engage them'. You could have a feature to show in your dashboard the 'inactive' lead and have a button to send an AI generated-personalized email to the inactive lead. These actions will bring everything together and position this app as a one-stop for everything related to marketing."

> "By far, my favorite section is the Content Lab. Very nice output from the AI and the re-purposing feature is great. If you can integrate picture and video generation for the social media posts, this will become a true Content Lab. You can look into nano banana models for image generation."

> "Overall, I believe the true potential will be unlocked if you can bring the Plan, Campaigns, and Content Lab together instead of them being separate from each other."

---

## Fixes Shipped (March 30, 2026)

### 1. More Specific Marketing Plan Output
**File:** `src/services/geminiService.ts` — `generateMarketingPlan()`

- Rewrote the prompt with explicit **CRITICAL RULES FOR SPECIFICITY**
- Model must now name real platforms/communities (e.g. "r/Entrepreneur", "Indie Hackers", "Skool AI Automation Hub")
- Must include exact numbers (e.g. "offer a 20% launch discount", "DM 10 micro-influencers")
- Must give concrete next steps (e.g. "DM the community admin first")
- Added a BAD vs GOOD example directly in the prompt
- Strengthened system role: "hyper-specific, actionable advice. Never use vague language."
- Lowered temperature from `0.7` → `0.5` for more focused output

---

### 2. Cross-Linking Plan Steps to Features
**File:** `src/screens/Plans.tsx`

- Each **action item** now has a hover `Megaphone` icon button → navigates to `/campaigns` with the action text as the campaign name (campaign type auto-detected from keywords: email, launch, lead, authority)
- Each **content prompt** now has a hover `FileText` icon button → navigates to `/content` with the prompt pre-filled as the topic

**File:** `src/screens/ContentLab.tsx`

- Reads `location.state.topic` on mount and pre-fills the topic textarea
- Textarea is highlighted in brand color and auto-scrolled into view when arriving from Plans
- Added `useLocation` import from react-router-dom

**File:** `src/screens/Campaigns.tsx`

- Reads `location.state.name` and `location.state.type` on mount
- Auto-creates a named campaign immediately after data loads (opens detail drawer)
- `createCampaign()` updated to accept an optional `name` parameter

---

### 3. Inactive Lead Detection + AI Re-engagement Email
**Files:** `src/screens/Leads.tsx`, `src/services/geminiService.ts`

**Detection logic:**
- A lead is "inactive" if `last_contacted` is null/empty OR more than 14 days ago
- Threshold constant `INACTIVE_DAYS = 14` at the top of Leads.tsx for easy adjustment

**Banner:**
- Amber alert bar at the top of the Leads page: "{N} leads haven't been contacted in 14+ days"
- "View all" link activates the Inactive filter instantly

**Table:**
- Inactive leads show a small amber dot on their avatar

**Filter:**
- Added "Inactive (14+ days)" option to the stage filter dropdown

**Drawer (inactive leads only):**
- "Inactive Lead" label + **AI Re-engage** button (amber, Sparkles icon)
- Calls `generateReengagementEmail()` via Groq (llama-3.3-70b-versatile)
- Generates a ≤120-word personalized email using lead's email, source, stage, last contact date, and notes
- Displays subject + body in an amber card
- **Copy** button (copies "Subject: ...\n\n{body}" to clipboard)
- **Send Now** mailto link pre-filled with subject and body

**New function in geminiService.ts:** `generateReengagementEmail(lead)`

---

### 4. Image Generation in Content Lab
**Files:** `src/screens/ContentLab.tsx`, `src/services/geminiService.ts`

**How it works:**
1. User clicks **Generate Image** in the content editor
2. Groq generates a tailored visual prompt (≤30 words, photorealistic, no faces/text/logos) via `generateImagePrompt()`
3. Image is fetched from **Pollinations.ai** (free, no API key, FLUX model)
4. Displayed below the textarea with hover controls

**Platform-aware dimensions:**
- Instagram / TikTok / Threads → 1080×1080 (square)
- Pinterest → 1000×1500 (portrait)
- LinkedIn / Twitter / Facebook / YouTube → 1200×675 (landscape)

**Controls on hover:**
- **Download** — opens image in new tab for saving
- **Regenerate** — generates a new variation with a new seed

**UX details:**
- Switching drafts clears the generated image automatically
- Animated pulse skeleton shown while generating
- Image errors silently clear the display (no broken image shown)

**New function in geminiService.ts:** `generateImagePrompt({ contentType, topic, goal })`

---

## Remaining Tester Requests (Future Rounds)

| Request | Priority | Notes |
|---|---|---|
| Video creation workflow | Shipped | Copy Script + free links to CapCut and Canva Video — all paid AI video APIs have costs; creator-recorded video performs better on TikTok/Reels anyway |
| Tighter Plan → Campaign workflow (full pre-population) | Medium | Currently name/type passes through; could pre-fill posts |
| Nano Banana model evaluation | Low | Pollinations.ai (FLUX) ships now; revisit if quality feedback received |

---

## Early Beta Reception (March 14–15, 2026)

- **106 LinkedIn impressions** in first 16 hours
- Positive signals from Skool's AI Automation Agency Hub
- Core validated pain point: "too many tools, nothing stays consistent"
- Standout feature cited: AI content drafting + Content Lab repurposing

---

## Notes for Next Beta Round

- Ask testers specifically about plan specificity improvement (did the AI name real communities?)
- Track whether cross-linking (plan → campaign / content) gets used organically
- Monitor Pollinations.ai image quality feedback — upgrade path is Replicate/fal.ai if needed
- Consider adding video generation as a beta milestone feature for Round 2

---

## Round 2 Recommendations (May 2026)

### Shipped Since Round 1
- **Video creation workflow** added to Content Lab for video platforms (TikTok, Instagram Reel, YouTube, YouTube Short): Copy Script button + one-click links to CapCut and Canva Video (both free). AI-generated video APIs all have costs; creator-recorded video performs better on these platforms anyway.
- **Quick Start fixed**: Step 2 no longer references the removed "Systems" screen — now describes the Campaigns AI builder accurately. AI Assistant added as Step 6.
- **Sidebar routing fixed**: `/quick-start` now highlights correctly in the sidebar.

### Priority Improvements for Round 2 Testing

| Area | Recommendation | Why |
|------|---------------|-----|
| **Onboarding** | Redirect new users to `/quick-start` instead of the Onboarding checklist widget | Testers said "I don't know how to use this" — Quick Start is more useful than the widget for first-timers |
| **Content Lab** | Add a "Cover image for video" toggle — generate a static thumbnail alongside the video | TikTok/Reels need a thumbnail for scheduling tools |
| **Plans → Content** | Pre-fill content type (not just topic) when navigating from a plan content prompt | Cross-link is there but doesn't pick the platform automatically |
| **Campaigns** | Add a "Run this post in Content Lab" button on each campaign asset | Closes the loop from campaign creation to content editing |
| **Leads** | Lower inactive threshold from 14 → 7 days for the beta audience (power users move fast) | Beta testers are active; 14 days may be too long to catch drift |
| **AI Assistant** | Add suggested starter prompts on the empty state | No one knows what to ask first; prompts like "What should I post this week?" lower the barrier |
| **Video workflow** | Ask testers if CapCut/Canva links are useful, or if they want a different free tool linked | All AI video generation APIs cost money — the script + free editor workflow is the right zero-cost approach |

### Questions for Round 2 Testers

1. Did the Marketing Plan name real communities you recognized? Which ones?
2. Did you use the Plan → Content Lab or Plan → Campaign links? Did they save you time?
3. Did the AI-generated image match what you expected for your post?
4. Did you try video generation (TikTok/Reels/YouTube)? Was the quality usable?
5. What's the one thing you wish the app did that it doesn't do yet?

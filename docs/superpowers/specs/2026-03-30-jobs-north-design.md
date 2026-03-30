# JOBS_NORTH — v1 Design Spec
_Date: 2026-03-30_

## Overview

A pure-frontend, multi-page job board for Canadian part-time work. Three separate HTML files sharing a common vanilla JS module. No build tools, no npm installs — all dependencies via CDN. Real job data via the Adzuna Canada API.

---

## Pages

### `index.html` — Listings
- Fetches jobs from Adzuna Canada API on load
- Live search: debounced 300ms, re-fetches with `what=<query>` param
- Filter buttons: In Person / Hybrid / Remote → mapped to Adzuna contract type params, combinable with search
- Skeleton loading state (3 animated pulse cards) while fetching
- Error state: editorial toast banner "SIGNAL LOST — CHECK CONNECTION"
- Empty state: "NO LISTINGS FOUND_" in hero type style
- "Load more" button uses Adzuna pagination (`page=N`)
- Each card links to `detail.html?id=<job_id>`, passes job data via `sessionStorage` to avoid a second fetch

### `detail.html` — Job Detail
- Reads `?id=` from URL query param
- Loads job data from `sessionStorage` if available, else fetches from Adzuna by ID
- Layout: two-column on desktop (description left, sticky sidebar right), single-column on mobile
- Sidebar: salary, job type, company, Apply Now button (opens Adzuna redirect URL in new tab), Save Job button
- Save Job: writes job object `{id, title, company, location, salary, url, savedAt}` to `localStorage` key `jobs_north_saved`
- Description HTML from Adzuna: sanitized — strip scripts, allow only `p`, `ul`, `li`, `strong`, `br`
- Back button → `index.html`

### `saved.html` — Bookmarks
- Reads `jobs_north_saved` array from `localStorage`
- Renders compact cards (`text-2xl` title vs `text-5xl` on index)
- Each card shows: title, company, location, salary, "SAVED X DAYS AGO" timestamp, Remove button
- Remove: splices item from array, updates `localStorage`, re-renders
- Empty state: large editorial hero text "NOTHING SAVED_YET"
- Nav badge on all pages: reads localStorage count, shows `bg-secondary` dot on Saved nav icon when count > 0

---

## Data Layer

### Adzuna API
- Base: `https://api.adzuna.com/v1/api/jobs/ca/search/{page}`
- Required params: `app_id`, `app_key`
- Job params: `part_time=1`, `results_per_page=10`, `what=<search>`, `where=<location>`
- Filter mapping:
  - In Person → `where=` (no remote flag)
  - Remote → `full_time=0` (Adzuna has no explicit remote filter; label data used client-side)
  - Hybrid → same as Remote filter, label shown differently
- CORS: Adzuna supports browser-direct requests
- Keys: `YOUR_APP_ID` / `YOUR_APP_KEY` placeholders — user registers free at developer.adzuna.com

### `jobs-data.js` — Shared Module
- Loaded via `<script type="module">` in all three pages
- Exports: `fetchJobs(query, filter, page)`, `fetchJobById(id)`, `renderCard(job)`, `getSaved()`, `saveJob(job)`, `removeSaved(id)`
- PT_ID display: `job.id.slice(-5).toUpperCase() + '-' + extractProvince(job.location)`

---

## Visual & UX Details

### Navigation
- Top bar: active page link has `border-b-2 border-[#E1E3E5]`, others dimmed
- Bottom bar (mobile): active item has `bg-[#A5C9FF]/20 text-[#A5C9FF]`
- Active state determined by `window.location.pathname` check on each page

### Animations
- Page load: CSS `@keyframes fadeIn` on `<body>` (opacity 0→1, 200ms)
- Skeleton cards: `animate-pulse` via Tailwind on placeholder blocks
- Card hover: `border-l-2 border-secondary` accent + `text-secondary` title transition

### Saved Badge
- Reads localStorage on every page load
- Renders as a 6px `bg-secondary rounded-full` dot absolutely positioned above bookmark icon
- Hidden when count is 0

---

## File Structure

```
index.html
detail.html
saved.html
jobs-data.js
```

No build step. Open `index.html` in a browser or deploy as static files to any host (Vercel, Netlify, GitHub Pages).

---

## Out of Scope (v1)
- User authentication
- Server-side rendering
- Job posting / employer side
- Push notifications
- Province/city filter UI (location param exists in API but no UI filter in v1)

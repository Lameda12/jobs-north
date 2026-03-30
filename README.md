# JOBS_NORTH

Curated part-time jobs across Canada. Editorial-first design. No framework, no build step, no API keys.

30 realistic Canadian listings. Instant search, filter, and bookmarks. Works offline.

---

## Stack

- Vanilla JS (ES modules)
- Tailwind CSS via CDN
- Local `jobs.json` data (30 Canadian part-time listings)
- `localStorage` for bookmarks — persists across sessions

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Live search + filter job listings |
| `detail.html` | Full job view with apply + save |
| `saved.html` | Bookmarked jobs, persisted locally |

## Setup

No installation required. Open `index.html` in a browser.

```bash
open index.html
```

Or serve locally:

```bash
npx serve .
```

## Structure

```
index.html          listings page — search, filters, pagination
detail.html         job detail view — description, apply, save
saved.html          saved jobs — timestamps, remove, empty state
jobs-data.js        shared module — data loading, rendering, localStorage
jobs.json           30 Canadian part-time job listings
```

## Features

- **Live search** — debounced 300ms, matches title, company, location, category
- **Filters** — All / In Person / Hybrid / Remote
- **Pagination** — 10 per page, load more
- **Bookmarks** — save/unsave from detail view, persists in localStorage
- **Skeleton loading** — animated placeholders while data loads
- **Page transitions** — CSS fade-in on every page

---

Built for the Canadian part-time workforce.

# JOBS_NORTH

Curated part-time jobs across Canada. Editorial-first design. No framework, no build step.

Live data from [Adzuna Canada](https://developer.adzuna.com). Three pages. One JS module.

---

## Stack

- Vanilla JS (ES modules)
- Tailwind CSS via CDN
- Adzuna Canada REST API
- localStorage for bookmarks

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Live search + filter job listings |
| `detail.html` | Full job view with apply + save |
| `saved.html` | Bookmarked jobs, persisted locally |

## Setup

1. Get a free API key at [developer.adzuna.com](https://developer.adzuna.com)
2. Open `jobs-data.js` and replace `YOUR_APP_ID` and `YOUR_APP_KEY`
3. Open `index.html` in a browser — no server required

## Structure

```
index.html          listings page
detail.html         job detail view
saved.html          saved jobs
jobs-data.js        shared API + rendering + localStorage module
tailwind-config.js  shared design tokens
```

---

Built for the Canadian part-time workforce.

# JOBS_NORTH v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the JOBS_NORTH HTML prototype into a 3-page production-ready job board using the Adzuna Canada API, with live search, filters, job detail view, and localStorage bookmarks.

**Architecture:** Pure HTML/CSS/JS — no build tools, no npm. Tailwind via CDN. A single ES module (`jobs-data.js`) is imported by all three pages to share API logic, rendering, and localStorage helpers. Pages communicate via `sessionStorage` (index → detail) and `localStorage` (bookmarks).

**Tech Stack:** Vanilla JS (ES modules), Tailwind CSS CDN, Google Fonts CDN, Material Symbols CDN, Adzuna Canada REST API.

---

## File Map

| File | Responsibility |
|------|---------------|
| `jobs-data.js` | All shared logic: API fetch, card/skeleton rendering, HTML sanitization, localStorage helpers, utilities |
| `index.html` | Listings page: search, filters, paginated job cards, nav badge |
| `detail.html` | Single job view: description, salary, apply + save buttons |
| `saved.html` | Bookmarks page: render from localStorage, remove, timestamps, empty state |

---

## Task 1: Create `jobs-data.js` — API config, fetch, and utilities

**Files:**
- Create: `jobs-data.js`

- [ ] **Step 1: Create `jobs-data.js` with config, province map, and utility functions**

```js
// jobs-data.js

export const CONFIG = {
  APP_ID: 'YOUR_APP_ID',
  APP_KEY: 'YOUR_APP_KEY',
  BASE_URL: 'https://api.adzuna.com/v1/api/jobs/ca/search',
  RESULTS_PER_PAGE: 10,
};

const PROVINCE_MAP = {
  'Ontario': 'ON', 'British Columbia': 'BC', 'Quebec': 'QC',
  'Alberta': 'AB', 'Nova Scotia': 'NS', 'Manitoba': 'MB',
  'Saskatchewan': 'SK', 'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL', 'Prince Edward Island': 'PE',
  'Northwest Territories': 'NT', 'Yukon': 'YT', 'Nunavut': 'NU',
};

export function extractProvince(area = []) {
  for (const a of area) {
    if (PROVINCE_MAP[a]) return PROVINCE_MAP[a];
  }
  return 'CA';
}

export function generatePTID(job) {
  const province = extractProvince(job.location?.area);
  const id = String(job.id).replace(/\D/g, '').slice(-5).padStart(5, '0').toUpperCase();
  return `PT_ID: ${id}-${province}`;
}

export function formatSalary(job) {
  const min = job.salary_min;
  const max = job.salary_max;
  if (min && max) return `$${Math.round(min).toLocaleString()} – $${Math.round(max).toLocaleString()} / YR`;
  if (min) return `From $${Math.round(min).toLocaleString()} / YR`;
  if (max) return `Up to $${Math.round(max).toLocaleString()} / YR`;
  return 'SALARY N/A';
}

export function formatBadge(job, filter) {
  const time = job.contract_time === 'part_time' ? 'Part-Time' : 'Casual';
  const mode = filter === 'remote' ? 'Remote' : filter === 'hybrid' ? 'Hybrid' : 'In-Person';
  return `${time} / ${mode}`;
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function fetchJobs({ query = '', filter = 'all', page = 1 } = {}) {
  const params = new URLSearchParams({
    app_id: CONFIG.APP_ID,
    app_key: CONFIG.APP_KEY,
    results_per_page: CONFIG.RESULTS_PER_PAGE,
    part_time: 1,
  });
  if (query) params.set('what', query);
  if (filter === 'remote') params.set('what_and', 'remote');
  if (filter === 'hybrid') params.set('what_and', 'hybrid');

  const res = await fetch(`${CONFIG.BASE_URL}/${page}?${params}`);
  if (!res.ok) throw new Error(`Adzuna API error: ${res.status}`);
  const data = await res.json();
  return { jobs: data.results ?? [], total: data.count ?? 0 };
}
```

- [ ] **Step 2: Verify fetch utility in browser console**

Open `index.html` temporarily with this at the bottom (remove after):
```html
<script type="module">
  import { fetchJobs } from './jobs-data.js';
  fetchJobs().then(d => console.log('jobs:', d.jobs.length, 'total:', d.total));
</script>
```
Expected in console: `jobs: 10 total: <some number>`

Note: Replace `YOUR_APP_ID` and `YOUR_APP_KEY` with real values from https://developer.adzuna.com before testing. Remove the test script after.

- [ ] **Step 3: Commit**

```bash
git add jobs-data.js
git commit -m "feat: add jobs-data.js with Adzuna fetch and utilities"
```

---

## Task 2: Add rendering helpers to `jobs-data.js`

**Files:**
- Modify: `jobs-data.js`

- [ ] **Step 1: Add `renderCard`, `renderSkeleton`, `sanitizeHtml`, and `formatTimeAgo` to `jobs-data.js`**

Append to `jobs-data.js`:

```js
export function renderCard(job, filter = 'all') {
  const ptid = generatePTID(job);
  const salary = formatSalary(job);
  const badge = formatBadge(job, filter);
  const category = escapeHtml(job.category?.label ?? 'General');

  return `
    <div class="group relative flex flex-col md:flex-row md:items-end justify-between transition-all cursor-pointer job-card" data-id="${escapeHtml(job.id)}">
      <div class="absolute -top-6 right-0 font-label text-[10px] text-outline-variant uppercase tracking-widest">${ptid}</div>
      <div class="max-w-xl">
        <p class="font-label text-secondary text-xs uppercase tracking-[0.2em] mb-2">${category}</p>
        <h3 class="text-3xl md:text-5xl font-headline font-bold text-primary group-hover:text-secondary group-hover:pl-3 group-hover:border-l-2 group-hover:border-secondary transition-all leading-tight mb-2">
          ${escapeHtml(job.title)}
        </h3>
        <div class="flex items-center gap-4 text-outline font-label text-sm uppercase tracking-widest">
          <span>${escapeHtml(job.company?.display_name ?? 'N/A')}</span>
          <span class="w-1 h-1 bg-outline-variant rounded-full"></span>
          <span>${escapeHtml(job.location?.display_name ?? 'Canada')}</span>
        </div>
      </div>
      <div class="mt-6 md:mt-0 flex flex-col items-start md:items-end gap-3">
        <span class="font-label text-lg font-bold text-primary">${salary}</span>
        <span class="border border-outline-variant/50 px-3 py-1 font-label text-[10px] uppercase tracking-widest text-outline">${badge}</span>
      </div>
      <div class="absolute -bottom-6 left-0 w-full h-px bg-outline-variant/10"></div>
    </div>
  `;
}

export function renderSkeleton(count = 3) {
  return Array.from({ length: count }, () => `
    <div class="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="max-w-xl w-full flex flex-col gap-3">
        <div class="h-2.5 bg-surface-container rounded-sm animate-pulse w-20"></div>
        <div class="h-10 bg-surface-container rounded-sm animate-pulse w-3/4"></div>
        <div class="h-2.5 bg-surface-container rounded-sm animate-pulse w-1/2"></div>
      </div>
      <div class="flex flex-col items-start md:items-end gap-3">
        <div class="h-5 bg-surface-container rounded-sm animate-pulse w-36"></div>
        <div class="h-7 bg-surface-container rounded-sm animate-pulse w-28"></div>
      </div>
      <div class="absolute -bottom-6 left-0 w-full h-px bg-outline-variant/10"></div>
    </div>
  `).join('');
}

export function sanitizeHtml(dirty) {
  const allowed = ['p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'br', 'span'];
  const tmp = document.createElement('div');
  tmp.innerHTML = dirty;
  tmp.querySelectorAll('*').forEach(el => {
    if (!allowed.includes(el.tagName.toLowerCase())) {
      el.replaceWith(...el.childNodes);
    } else {
      [...el.attributes].forEach(attr => el.removeAttribute(attr.name));
    }
  });
  return tmp.innerHTML;
}

export function formatTimeAgo(timestamp) {
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days === 0) return 'TODAY';
  if (days === 1) return '1 DAY AGO';
  return `${days} DAYS AGO`;
}
```

- [ ] **Step 2: Verify rendering in browser console**

Add temporarily to index.html (remove after):
```html
<script type="module">
  import { fetchJobs, renderCard, renderSkeleton } from './jobs-data.js';
  document.getElementById('jobs-container').innerHTML = renderSkeleton(3);
  const { jobs } = await fetchJobs();
  console.log('rendered card:', renderCard(jobs[0]).includes('job-card'));
</script>
```
Expected: skeleton shows in UI, console logs `true`.

- [ ] **Step 3: Commit**

```bash
git add jobs-data.js
git commit -m "feat: add renderCard, renderSkeleton, sanitizeHtml, formatTimeAgo"
```

---

## Task 3: Add localStorage helpers to `jobs-data.js`

**Files:**
- Modify: `jobs-data.js`

- [ ] **Step 1: Append localStorage helpers to `jobs-data.js`**

```js
const STORAGE_KEY = 'jobs_north_saved';

export function getSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function saveJob(job) {
  const saved = getSaved();
  if (!saved.find(j => j.id === job.id)) {
    saved.push({ ...job, savedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
}

export function removeSaved(id) {
  const saved = getSaved().filter(j => j.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function isSaved(id) {
  return getSaved().some(j => j.id === id);
}

export function getSavedCount() {
  return getSaved().length;
}
```

- [ ] **Step 2: Verify localStorage helpers in browser console**

Open any page with this script (remove after):
```html
<script type="module">
  import { saveJob, getSaved, isSaved, removeSaved, getSavedCount } from './jobs-data.js';
  const mockJob = { id: 'test123', title: 'Test Job', company: { display_name: 'ACME' }, location: { display_name: 'Toronto, ON' }, savedAt: null };
  saveJob(mockJob);
  console.assert(isSaved('test123'), 'isSaved should be true');
  console.assert(getSavedCount() >= 1, 'count should be >= 1');
  removeSaved('test123');
  console.assert(!isSaved('test123'), 'isSaved should be false after remove');
  console.log('localStorage helpers: all assertions passed');
</script>
```
Expected console: `localStorage helpers: all assertions passed`

- [ ] **Step 3: Commit**

```bash
git add jobs-data.js
git commit -m "feat: add localStorage helpers (saveJob, removeSaved, isSaved, getSavedCount)"
```

---

## Task 4: Build `index.html`

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html` — full layout with wired search, filters, pagination, nav badge, and module script**

```html
<!DOCTYPE html>
<html class="dark" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>JOBS_NORTH | Canadian Part-Time Editorial</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "outline": "#8d919a","on-tertiary-container": "#465468","on-tertiary": "#233144",
            "primary-fixed": "#e0e3e5","surface-container-highest": "#353534",
            "on-background": "#e5e2e1","tertiary-fixed": "#d5e3fd","secondary-container": "#234a79",
            "on-error": "#690005","error": "#ffb4ab","surface-bright": "#393939",
            "inverse-on-surface": "#313030","surface-dim": "#131313","inverse-primary": "#5c5f61",
            "on-error-container": "#ffdad6","surface-container-low": "#1c1b1b",
            "outline-variant": "#43474f","on-primary": "#2d3133","on-surface": "#e5e2e1",
            "surface": "#131313","secondary": "#a5c9fe","surface-tint": "#c4c7c9",
            "secondary-fixed": "#d4e3ff","error-container": "#93000a","secondary-fixed-dim": "#a5c9fe",
            "primary-fixed-dim": "#c4c7c9","on-tertiary-fixed-variant": "#3a485c",
            "surface-container-lowest": "#0e0e0e","on-secondary-container": "#96baf0",
            "on-secondary": "#00315d","on-secondary-fixed": "#001c39","primary": "#e1e3e5",
            "tertiary": "#d5e4fd","surface-variant": "#353534","inverse-surface": "#e5e2e1",
            "background": "#131313","on-primary-container": "#505355","surface-container-high": "#2a2a2a",
            "tertiary-container": "#b9c8e1","on-primary-fixed-variant": "#444749",
            "surface-container": "#201f1f","on-primary-fixed": "#191c1e",
            "on-secondary-fixed-variant": "#204876","primary-container": "#c5c7c9",
            "on-surface-variant": "#c3c6d0","on-tertiary-fixed": "#0d1c2f","tertiary-fixed-dim": "#b9c7e0"
          },
          fontFamily: { "headline": ["Manrope"], "body": ["Inter"], "label": ["Space Grotesk"] },
          borderRadius: { "DEFAULT": "0.125rem","lg": "0.25rem","xl": "0.5rem","full": "0.75rem" },
        },
      },
    }
  </script>
  <style>
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    body { background-color: #131313; color: #e5e2e1; min-height: max(884px, 100dvh); animation: fadeIn 200ms ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #131313; }
    ::-webkit-scrollbar-thumb { background: #353534; }
  </style>
</head>
<body class="font-body selection:bg-secondary/30">

<!-- Top App Bar -->
<header class="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl flex justify-between items-center px-6 py-4">
  <div class="flex items-center gap-4">
    <button class="text-[#E1E3E5] hover:bg-[#C5C7C9]/10 transition-colors p-1">
      <span class="material-symbols-outlined">menu</span>
    </button>
    <h1 class="text-2xl font-black tracking-tighter text-[#E1E3E5] font-headline uppercase">JOBS_NORTH</h1>
  </div>
  <nav class="hidden md:flex items-center gap-8">
    <a class="text-[#E1E3E5] border-b-2 border-[#E1E3E5] font-headline tracking-tighter font-bold uppercase py-1" data-nav="index.html" href="index.html">Home</a>
    <a class="text-[#C5C7C9] hover:bg-[#C5C7C9]/10 transition-colors font-headline tracking-tighter font-bold uppercase py-1" data-nav="saved.html" href="saved.html">Saved
      <span id="saved-badge-desktop" class="hidden ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-secondary text-on-secondary rounded-full"></span>
    </a>
  </nav>
  <div class="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden">
    <div class="w-full h-full bg-surface-container flex items-center justify-center">
      <span class="material-symbols-outlined text-outline text-sm">person</span>
    </div>
  </div>
</header>

<!-- Error Banner -->
<div id="error-banner" class="hidden fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-error-container text-on-error-container font-label text-xs uppercase tracking-widest px-6 py-3 rounded-sm border border-error/20">
  SIGNAL LOST — CHECK CONNECTION
</div>

<main class="pt-24 pb-32 max-w-4xl mx-auto px-6">
  <!-- Hero -->
  <section class="mb-16">
    <h2 class="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter leading-none mb-4">
      THE NORTH <br/><span class="text-secondary opacity-80 italic">IS HIRING.</span>
    </h2>
    <p class="font-label text-outline uppercase tracking-widest text-sm max-w-md">
      Curated part-time opportunities across the Canadian landscape. High-precision matching for the modern workforce.
    </p>
  </section>

  <!-- Sticky Search & Filters -->
  <div class="sticky top-[72px] z-40 mb-12 py-4 bg-surface/90 backdrop-blur-md">
    <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div class="relative w-full md:w-auto flex-grow max-w-lg">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
        <input id="search-input" class="w-full bg-surface-container-lowest border-0 border-b border-outline-variant py-4 pl-12 pr-4 font-label text-sm uppercase tracking-widest focus:ring-0 focus:border-secondary transition-colors placeholder:text-outline-variant/50" placeholder="SEARCH POSITIONS..." type="text"/>
      </div>
      <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
        <button data-filter="all" class="filter-btn whitespace-nowrap font-label text-[11px] uppercase tracking-widest px-4 py-2 bg-secondary-container text-on-secondary-container rounded-sm border border-secondary/20 transition-all">All</button>
        <button data-filter="in-person" class="filter-btn whitespace-nowrap font-label text-[11px] uppercase tracking-widest px-4 py-2 bg-surface-container-low text-outline border border-outline-variant/30 rounded-sm hover:border-secondary/50 transition-all">In Person</button>
        <button data-filter="hybrid" class="filter-btn whitespace-nowrap font-label text-[11px] uppercase tracking-widest px-4 py-2 bg-surface-container-low text-outline border border-outline-variant/30 rounded-sm hover:border-secondary/50 transition-all">Hybrid</button>
        <button data-filter="remote" class="filter-btn whitespace-nowrap font-label text-[11px] uppercase tracking-widest px-4 py-2 bg-surface-container-low text-outline border border-outline-variant/30 rounded-sm hover:border-secondary/50 transition-all">Remote</button>
      </div>
    </div>
  </div>

  <!-- Job Cards -->
  <div id="jobs-container" class="flex flex-col gap-12"></div>

  <!-- Load More -->
  <div class="mt-20 text-center">
    <button id="load-more-btn" class="hidden font-label text-xs uppercase tracking-[0.4em] text-outline-variant hover:text-secondary transition-colors border-b border-transparent hover:border-secondary pb-1">
      ACCESS_ADDITIONAL_LISTINGS
    </button>
  </div>
</main>

<!-- Bottom Nav -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-2xl border-t border-[#E1E3E5]/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 rounded-t-sm md:hidden">
  <a class="flex flex-col items-center justify-center text-[#C5C7C9] px-4 py-2 transition-opacity scale-95 active:scale-90 duration-300 bottom-nav-item" data-nav="index.html" href="index.html">
    <span class="material-symbols-outlined mb-1">home_work</span>
    <span class="font-label text-[10px] uppercase tracking-widest">Home</span>
  </a>
  <a class="flex flex-col items-center justify-center text-[#C5C7C9] px-4 py-2 transition-opacity scale-95 active:scale-90 duration-300 relative bottom-nav-item" data-nav="saved.html" href="saved.html">
    <span class="material-symbols-outlined mb-1">bookmark_manager</span>
    <span class="font-label text-[10px] uppercase tracking-widest">Saved</span>
    <span id="saved-badge-mobile" class="hidden absolute top-1 right-3 w-1.5 h-1.5 bg-secondary rounded-full"></span>
  </a>
</nav>

<script type="module">
  import { fetchJobs, renderCard, renderSkeleton, getSavedCount } from './jobs-data.js';

  const container = document.getElementById('jobs-container');
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const errorBanner = document.getElementById('error-banner');

  let currentPage = 1;
  let currentQuery = '';
  let currentFilter = 'all';
  let totalJobs = 0;
  let shownJobs = 0;

  function updateSavedBadge() {
    const count = getSavedCount();
    const desktop = document.getElementById('saved-badge-desktop');
    const mobile = document.getElementById('saved-badge-mobile');
    if (desktop) { desktop.textContent = count; desktop.classList.toggle('hidden', count === 0); }
    if (mobile) { mobile.classList.toggle('hidden', count === 0); }
  }

  async function loadJobs(reset = true) {
    if (reset) {
      currentPage = 1;
      shownJobs = 0;
      container.innerHTML = renderSkeleton(3);
      loadMoreBtn.classList.add('hidden');
    }
    errorBanner.classList.add('hidden');

    try {
      const { jobs, total } = await fetchJobs({ query: currentQuery, filter: currentFilter, page: currentPage });
      totalJobs = total;

      if (reset) container.innerHTML = '';

      if (jobs.length === 0 && reset) {
        container.innerHTML = `<div class="py-20"><p class="font-headline text-4xl font-bold text-outline-variant">NO LISTINGS FOUND_</p></div>`;
        return;
      }

      jobs.forEach(job => {
        const wrap = document.createElement('div');
        wrap.innerHTML = renderCard(job, currentFilter);
        const card = wrap.firstElementChild;
        card.addEventListener('click', () => {
          sessionStorage.setItem('jobs_north_current', JSON.stringify(job));
          window.location.href = `detail.html?id=${encodeURIComponent(job.id)}`;
        });
        container.appendChild(card);
      });

      shownJobs += jobs.length;
      loadMoreBtn.classList.toggle('hidden', shownJobs >= totalJobs);
    } catch {
      errorBanner.classList.remove('hidden');
      setTimeout(() => errorBanner.classList.add('hidden'), 4000);
      if (reset) container.innerHTML = '';
    }
  }

  // Search debounce
  let searchTimer;
  searchInput.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentQuery = e.target.value.trim();
      loadJobs(true);
    }, 300);
  });

  // Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'border-secondary/20');
        b.classList.add('bg-surface-container-low', 'text-outline', 'border-outline-variant/30');
      });
      btn.classList.remove('bg-surface-container-low', 'text-outline', 'border-outline-variant/30');
      btn.classList.add('bg-secondary-container', 'text-on-secondary-container', 'border-secondary/20');
      currentFilter = btn.dataset.filter;
      loadJobs(true);
    });
  });

  // Load more
  loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    loadJobs(false);
  });

  updateSavedBadge();
  loadJobs(true);
</script>
</body>
</html>
```

- [ ] **Step 2: Open `index.html` in browser and verify**

- Skeleton cards appear briefly while fetching
- 10 job cards render with real Canadian data
- Search input triggers new fetch after 300ms pause
- Filter buttons toggle active state and refetch
- "ACCESS_ADDITIONAL_LISTINGS" appears when more jobs exist
- Console has no errors

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: build index.html with live Adzuna search and filters"
```

---

## Task 5: Build `detail.html`

**Files:**
- Create: `detail.html`

- [ ] **Step 1: Create `detail.html`**

```html
<!DOCTYPE html>
<html class="dark" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>JOBS_NORTH | Job Detail</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "outline": "#8d919a","on-tertiary-container": "#465468","on-tertiary": "#233144",
            "primary-fixed": "#e0e3e5","surface-container-highest": "#353534","on-background": "#e5e2e1",
            "tertiary-fixed": "#d5e3fd","secondary-container": "#234a79","on-error": "#690005",
            "error": "#ffb4ab","surface-bright": "#393939","inverse-on-surface": "#313030",
            "surface-dim": "#131313","inverse-primary": "#5c5f61","on-error-container": "#ffdad6",
            "surface-container-low": "#1c1b1b","outline-variant": "#43474f","on-primary": "#2d3133",
            "on-surface": "#e5e2e1","surface": "#131313","secondary": "#a5c9fe","surface-tint": "#c4c7c9",
            "secondary-fixed": "#d4e3ff","error-container": "#93000a","secondary-fixed-dim": "#a5c9fe",
            "primary-fixed-dim": "#c4c7c9","on-tertiary-fixed-variant": "#3a485c",
            "surface-container-lowest": "#0e0e0e","on-secondary-container": "#96baf0",
            "on-secondary": "#00315d","on-secondary-fixed": "#001c39","primary": "#e1e3e5",
            "tertiary": "#d5e4fd","surface-variant": "#353534","inverse-surface": "#e5e2e1",
            "background": "#131313","on-primary-container": "#505355","surface-container-high": "#2a2a2a",
            "tertiary-container": "#b9c8e1","on-primary-fixed-variant": "#444749",
            "surface-container": "#201f1f","on-primary-fixed": "#191c1e",
            "on-secondary-fixed-variant": "#204876","primary-container": "#c5c7c9",
            "on-surface-variant": "#c3c6d0","on-tertiary-fixed": "#0d1c2f","tertiary-fixed-dim": "#b9c7e0"
          },
          fontFamily: { "headline": ["Manrope"], "body": ["Inter"], "label": ["Space Grotesk"] },
          borderRadius: { "DEFAULT": "0.125rem","lg": "0.25rem","xl": "0.5rem","full": "0.75rem" },
        },
      },
    }
  </script>
  <style>
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    body { background-color: #131313; color: #e5e2e1; min-height: max(884px, 100dvh); animation: fadeIn 200ms ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #131313; }
    ::-webkit-scrollbar-thumb { background: #353534; }
    .prose p, .prose li { color: #c3c6d0; font-family: 'Inter', sans-serif; line-height: 1.7; margin-bottom: 0.75rem; }
    .prose ul { list-style: disc; padding-left: 1.25rem; }
    .prose strong { color: #e5e2e1; }
  </style>
</head>
<body class="font-body selection:bg-secondary/30">

<!-- Top App Bar -->
<header class="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl flex justify-between items-center px-6 py-4">
  <div class="flex items-center gap-4">
    <a href="index.html" class="text-[#E1E3E5] hover:bg-[#C5C7C9]/10 transition-colors p-1 flex items-center gap-2">
      <span class="material-symbols-outlined">arrow_back</span>
    </a>
    <h1 class="text-2xl font-black tracking-tighter text-[#E1E3E5] font-headline uppercase">JOBS_NORTH</h1>
  </div>
  <nav class="hidden md:flex items-center gap-8">
    <a class="text-[#C5C7C9] hover:bg-[#C5C7C9]/10 transition-colors font-headline tracking-tighter font-bold uppercase py-1" href="index.html">Home</a>
    <a class="text-[#C5C7C9] hover:bg-[#C5C7C9]/10 transition-colors font-headline tracking-tighter font-bold uppercase py-1" href="saved.html">Saved
      <span id="saved-badge-desktop" class="hidden ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold bg-secondary text-on-secondary rounded-full"></span>
    </a>
  </nav>
  <div class="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden">
    <div class="w-full h-full bg-surface-container flex items-center justify-center">
      <span class="material-symbols-outlined text-outline text-sm">person</span>
    </div>
  </div>
</header>

<main class="pt-24 pb-32 max-w-4xl mx-auto px-6">
  <div id="detail-content" class="flex flex-col md:flex-row gap-12">
    <!-- Skeleton -->
    <div class="flex-1 flex flex-col gap-4">
      <div class="h-3 bg-surface-container rounded-sm animate-pulse w-32"></div>
      <div class="h-14 bg-surface-container rounded-sm animate-pulse w-3/4"></div>
      <div class="h-3 bg-surface-container rounded-sm animate-pulse w-1/2"></div>
      <div class="mt-8 space-y-3">
        <div class="h-3 bg-surface-container rounded-sm animate-pulse w-full"></div>
        <div class="h-3 bg-surface-container rounded-sm animate-pulse w-5/6"></div>
        <div class="h-3 bg-surface-container rounded-sm animate-pulse w-4/6"></div>
      </div>
    </div>
    <div class="md:w-64 flex flex-col gap-3">
      <div class="h-8 bg-surface-container rounded-sm animate-pulse"></div>
      <div class="h-10 bg-surface-container rounded-sm animate-pulse"></div>
      <div class="h-10 bg-surface-container rounded-sm animate-pulse"></div>
    </div>
  </div>
</main>

<!-- Bottom Nav -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-2xl border-t border-[#E1E3E5]/10 z-50 rounded-t-sm md:hidden">
  <a class="flex flex-col items-center text-[#C5C7C9] px-4 py-2 scale-95 active:scale-90 duration-300" href="index.html">
    <span class="material-symbols-outlined mb-1">home_work</span>
    <span class="font-label text-[10px] uppercase tracking-widest">Home</span>
  </a>
  <a class="flex flex-col items-center text-[#C5C7C9] px-4 py-2 scale-95 active:scale-90 duration-300 relative" href="saved.html">
    <span class="material-symbols-outlined mb-1">bookmark_manager</span>
    <span class="font-label text-[10px] uppercase tracking-widest">Saved</span>
    <span id="saved-badge-mobile" class="hidden absolute top-1 right-3 w-1.5 h-1.5 bg-secondary rounded-full"></span>
  </a>
</nav>

<script type="module">
  import { sanitizeHtml, formatSalary, formatBadge, generatePTID, escapeHtml, saveJob, removeSaved, isSaved, getSavedCount } from './jobs-data.js';

  function updateSavedBadge() {
    const count = getSavedCount();
    const desktop = document.getElementById('saved-badge-desktop');
    const mobile = document.getElementById('saved-badge-mobile');
    if (desktop) { desktop.textContent = count; desktop.classList.toggle('hidden', count === 0); }
    if (mobile) { mobile.classList.toggle('hidden', count === 0); }
  }

  function renderDetail(job) {
    const salary = formatSalary(job);
    const badge = formatBadge(job, 'all');
    const ptid = generatePTID(job);
    const description = sanitizeHtml(job.description ?? '<p>No description available.</p>');
    const saved = isSaved(job.id);

    return `
      <div class="flex-1">
        <p class="font-label text-[10px] text-outline-variant uppercase tracking-widest mb-6">${ptid}</p>
        <p class="font-label text-secondary text-xs uppercase tracking-[0.2em] mb-3">${escapeHtml(job.category?.label ?? 'General')}</p>
        <h2 class="text-4xl md:text-6xl font-headline font-extrabold tracking-tighter leading-tight text-primary mb-4">
          ${escapeHtml(job.title)}
        </h2>
        <div class="flex items-center gap-4 text-outline font-label text-sm uppercase tracking-widest mb-10">
          <span>${escapeHtml(job.company?.display_name ?? 'N/A')}</span>
          <span class="w-1 h-1 bg-outline-variant rounded-full"></span>
          <span>${escapeHtml(job.location?.display_name ?? 'Canada')}</span>
        </div>
        <div class="prose max-w-none">${description}</div>
      </div>
      <div class="md:w-64 md:sticky md:top-24 h-fit flex flex-col gap-4">
        <div class="bg-surface-container p-6 flex flex-col gap-4 border border-outline-variant/10">
          <div>
            <p class="font-label text-[10px] text-outline-variant uppercase tracking-widest mb-1">Salary</p>
            <p class="font-label text-lg font-bold text-primary">${salary}</p>
          </div>
          <div>
            <p class="font-label text-[10px] text-outline-variant uppercase tracking-widest mb-1">Type</p>
            <p class="font-label text-sm text-on-surface-variant uppercase">${badge}</p>
          </div>
          <div>
            <p class="font-label text-[10px] text-outline-variant uppercase tracking-widest mb-1">Company</p>
            <p class="font-label text-sm text-on-surface-variant">${escapeHtml(job.company?.display_name ?? 'N/A')}</p>
          </div>
          <a href="${escapeHtml(job.redirect_url ?? '#')}" target="_blank" rel="noopener noreferrer"
            class="w-full text-center font-label text-xs uppercase tracking-widest py-3 bg-secondary text-on-secondary hover:bg-secondary/80 transition-colors">
            APPLY NOW
          </a>
          <button id="save-btn"
            class="w-full font-label text-xs uppercase tracking-widest py-3 border transition-colors ${saved
              ? 'border-secondary text-secondary hover:bg-secondary/10'
              : 'border-outline-variant text-outline hover:border-secondary hover:text-secondary'}">
            ${saved ? 'SAVED_' : 'SAVE JOB'}
          </button>
        </div>
      </div>
    `;
  }

  // Load job from sessionStorage
  const raw = sessionStorage.getItem('jobs_north_current');
  if (!raw) {
    window.location.href = 'index.html';
  } else {
    const job = JSON.parse(raw);
    document.title = `JOBS_NORTH | ${job.title}`;
    document.getElementById('detail-content').innerHTML = renderDetail(job);

    document.getElementById('save-btn').addEventListener('click', function() {
      if (isSaved(job.id)) {
        removeSaved(job.id);
        this.textContent = 'SAVE JOB';
        this.classList.remove('border-secondary', 'text-secondary');
        this.classList.add('border-outline-variant', 'text-outline');
      } else {
        saveJob(job);
        this.textContent = 'SAVED_';
        this.classList.remove('border-outline-variant', 'text-outline');
        this.classList.add('border-secondary', 'text-secondary');
      }
      updateSavedBadge();
    });

    updateSavedBadge();
  }
</script>
</body>
</html>
```

- [ ] **Step 2: Verify detail page**

- Click any card on `index.html` → `detail.html` loads with real job data
- Job title, company, location render correctly
- "SAVE JOB" button saves to localStorage and shows "SAVED_" state
- "APPLY NOW" opens Adzuna redirect in new tab
- Back arrow returns to `index.html`
- Direct navigation to `detail.html` (no sessionStorage) redirects to `index.html`

- [ ] **Step 3: Commit**

```bash
git add detail.html
git commit -m "feat: build detail.html with job data, save button, and apply link"
```

---

## Task 6: Build `saved.html`

**Files:**
- Create: `saved.html`

- [ ] **Step 1: Create `saved.html`**

```html
<!DOCTYPE html>
<html class="dark" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>JOBS_NORTH | Saved</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "outline": "#8d919a","on-tertiary-container": "#465468","on-tertiary": "#233144",
            "primary-fixed": "#e0e3e5","surface-container-highest": "#353534","on-background": "#e5e2e1",
            "tertiary-fixed": "#d5e3fd","secondary-container": "#234a79","on-error": "#690005",
            "error": "#ffb4ab","surface-bright": "#393939","inverse-on-surface": "#313030",
            "surface-dim": "#131313","inverse-primary": "#5c5f61","on-error-container": "#ffdad6",
            "surface-container-low": "#1c1b1b","outline-variant": "#43474f","on-primary": "#2d3133",
            "on-surface": "#e5e2e1","surface": "#131313","secondary": "#a5c9fe","surface-tint": "#c4c7c9",
            "secondary-fixed": "#d4e3ff","error-container": "#93000a","secondary-fixed-dim": "#a5c9fe",
            "primary-fixed-dim": "#c4c7c9","on-tertiary-fixed-variant": "#3a485c",
            "surface-container-lowest": "#0e0e0e","on-secondary-container": "#96baf0",
            "on-secondary": "#00315d","on-secondary-fixed": "#001c39","primary": "#e1e3e5",
            "tertiary": "#d5e4fd","surface-variant": "#353534","inverse-surface": "#e5e2e1",
            "background": "#131313","on-primary-container": "#505355","surface-container-high": "#2a2a2a",
            "tertiary-container": "#b9c8e1","on-primary-fixed-variant": "#444749",
            "surface-container": "#201f1f","on-primary-fixed": "#191c1e",
            "on-secondary-fixed-variant": "#204876","primary-container": "#c5c7c9",
            "on-surface-variant": "#c3c6d0","on-tertiary-fixed": "#0d1c2f","tertiary-fixed-dim": "#b9c7e0"
          },
          fontFamily: { "headline": ["Manrope"], "body": ["Inter"], "label": ["Space Grotesk"] },
          borderRadius: { "DEFAULT": "0.125rem","lg": "0.25rem","xl": "0.5rem","full": "0.75rem" },
        },
      },
    }
  </script>
  <style>
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    body { background-color: #131313; color: #e5e2e1; min-height: max(884px, 100dvh); animation: fadeIn 200ms ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #131313; }
    ::-webkit-scrollbar-thumb { background: #353534; }
  </style>
</head>
<body class="font-body selection:bg-secondary/30">

<!-- Top App Bar -->
<header class="fixed top-0 w-full z-50 bg-[#131313]/70 backdrop-blur-xl flex justify-between items-center px-6 py-4">
  <div class="flex items-center gap-4">
    <button class="text-[#E1E3E5] hover:bg-[#C5C7C9]/10 transition-colors p-1">
      <span class="material-symbols-outlined">menu</span>
    </button>
    <h1 class="text-2xl font-black tracking-tighter text-[#E1E3E5] font-headline uppercase">JOBS_NORTH</h1>
  </div>
  <nav class="hidden md:flex items-center gap-8">
    <a class="text-[#C5C7C9] hover:bg-[#C5C7C9]/10 transition-colors font-headline tracking-tighter font-bold uppercase py-1" href="index.html">Home</a>
    <a class="text-[#E1E3E5] border-b-2 border-[#E1E3E5] font-headline tracking-tighter font-bold uppercase py-1" href="saved.html">Saved</a>
  </nav>
  <div class="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/20 overflow-hidden">
    <div class="w-full h-full bg-surface-container flex items-center justify-center">
      <span class="material-symbols-outlined text-outline text-sm">person</span>
    </div>
  </div>
</header>

<main class="pt-24 pb-32 max-w-4xl mx-auto px-6">
  <!-- Hero -->
  <section class="mb-16">
    <h2 class="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter leading-none mb-4">
      SAVED <br/><span class="text-secondary opacity-80 italic">LISTINGS_</span>
    </h2>
    <p class="font-label text-outline uppercase tracking-widest text-sm">
      Your shortlist. Persisted across sessions.
    </p>
  </section>

  <!-- Saved Cards -->
  <div id="saved-container" class="flex flex-col gap-12"></div>
</main>

<!-- Bottom Nav -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-[#131313]/80 backdrop-blur-2xl border-t border-[#E1E3E5]/10 z-50 rounded-t-sm md:hidden">
  <a class="flex flex-col items-center text-[#C5C7C9] px-4 py-2 scale-95 active:scale-90 duration-300" href="index.html">
    <span class="material-symbols-outlined mb-1">home_work</span>
    <span class="font-label text-[10px] uppercase tracking-widest">Home</span>
  </a>
  <a class="flex flex-col items-center bg-[#A5C9FF]/20 text-[#A5C9FF] px-4 py-2 scale-95 active:scale-90 duration-300 rounded-sm" href="saved.html">
    <span class="material-symbols-outlined mb-1">bookmark_manager</span>
    <span class="font-label text-[10px] uppercase tracking-widest">Saved</span>
  </a>
</nav>

<script type="module">
  import { getSaved, removeSaved, formatSalary, formatBadge, generatePTID, escapeHtml, formatTimeAgo } from './jobs-data.js';

  function renderSavedCard(job) {
    const ptid = generatePTID(job);
    const salary = formatSalary(job);
    const badge = formatBadge(job, 'all');
    const timeAgo = formatTimeAgo(job.savedAt);

    return `
      <div class="group relative flex flex-col md:flex-row md:items-end justify-between transition-all saved-card" data-id="${escapeHtml(job.id)}">
        <div class="absolute -top-6 right-0 font-label text-[10px] text-outline-variant uppercase tracking-widest">${ptid}</div>
        <div class="max-w-xl cursor-pointer job-link">
          <p class="font-label text-secondary text-xs uppercase tracking-[0.2em] mb-2">${escapeHtml(job.category?.label ?? 'General')}</p>
          <h3 class="text-2xl md:text-3xl font-headline font-bold text-primary group-hover:text-secondary transition-colors leading-tight mb-2">
            ${escapeHtml(job.title)}
          </h3>
          <div class="flex flex-wrap items-center gap-3 text-outline font-label text-sm uppercase tracking-widest">
            <span>${escapeHtml(job.company?.display_name ?? 'N/A')}</span>
            <span class="w-1 h-1 bg-outline-variant rounded-full"></span>
            <span>${escapeHtml(job.location?.display_name ?? 'Canada')}</span>
            <span class="w-1 h-1 bg-outline-variant rounded-full"></span>
            <span class="text-outline-variant text-[10px]">SAVED ${timeAgo}</span>
          </div>
        </div>
        <div class="mt-6 md:mt-0 flex flex-col items-start md:items-end gap-3">
          <span class="font-label text-base font-bold text-primary">${salary}</span>
          <span class="border border-outline-variant/50 px-3 py-1 font-label text-[10px] uppercase tracking-widest text-outline">${badge}</span>
          <button class="remove-btn font-label text-[10px] uppercase tracking-widest text-outline-variant hover:text-error transition-colors border-b border-transparent hover:border-error pb-0.5">
            REMOVE_
          </button>
        </div>
        <div class="absolute -bottom-6 left-0 w-full h-px bg-outline-variant/10"></div>
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="py-20">
        <p class="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-outline-variant/30 leading-none">
          NOTHING<br/>SAVED_YET
        </p>
        <a href="index.html" class="inline-block mt-8 font-label text-xs uppercase tracking-[0.4em] text-secondary border-b border-secondary pb-1 hover:opacity-70 transition-opacity">
          BROWSE LISTINGS →
        </a>
      </div>
    `;
  }

  function renderAll() {
    const saved = getSaved();
    const container = document.getElementById('saved-container');
    if (saved.length === 0) { container.innerHTML = renderEmpty(); return; }

    container.innerHTML = saved.map(renderSavedCard).join('');

    container.querySelectorAll('.job-link').forEach((el, i) => {
      el.addEventListener('click', () => {
        sessionStorage.setItem('jobs_north_current', JSON.stringify(saved[i]));
        window.location.href = `detail.html?id=${encodeURIComponent(saved[i].id)}`;
      });
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('.saved-card');
        const id = card.dataset.id;
        removeSaved(id);
        renderAll();
      });
    });
  }

  renderAll();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify saved page**

- Navigate to `saved.html` with no bookmarks → "NOTHING SAVED_YET" hero + "BROWSE LISTINGS →" link
- Save a job on `detail.html`, return to `saved.html` → card appears with "SAVED TODAY"
- "REMOVE_" button removes the card and re-renders (empty state if last card removed)
- Clicking a saved card title navigates to `detail.html` with the job pre-loaded

- [ ] **Step 3: Commit**

```bash
git add saved.html
git commit -m "feat: build saved.html with localStorage render, timestamps, and remove"
```

---

## Task 7: Final polish — Tailwind config dedup and Adzuna key reminder

**Files:**
- Modify: `index.html`, `detail.html`, `saved.html`
- Create: `tailwind-config.js`

- [ ] **Step 1: Extract shared Tailwind config to `tailwind-config.js`**

Create `tailwind-config.js`:

```js
// tailwind-config.js
// Loaded via <script src="tailwind-config.js"></script> before Tailwind CDN
window.__TAILWIND_THEME__ = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline": "#8d919a","on-tertiary-container": "#465468","on-tertiary": "#233144",
        "primary-fixed": "#e0e3e5","surface-container-highest": "#353534","on-background": "#e5e2e1",
        "tertiary-fixed": "#d5e3fd","secondary-container": "#234a79","on-error": "#690005",
        "error": "#ffb4ab","surface-bright": "#393939","inverse-on-surface": "#313030",
        "surface-dim": "#131313","inverse-primary": "#5c5f61","on-error-container": "#ffdad6",
        "surface-container-low": "#1c1b1b","outline-variant": "#43474f","on-primary": "#2d3133",
        "on-surface": "#e5e2e1","surface": "#131313","secondary": "#a5c9fe","surface-tint": "#c4c7c9",
        "secondary-fixed": "#d4e3ff","error-container": "#93000a","secondary-fixed-dim": "#a5c9fe",
        "primary-fixed-dim": "#c4c7c9","on-tertiary-fixed-variant": "#3a485c",
        "surface-container-lowest": "#0e0e0e","on-secondary-container": "#96baf0",
        "on-secondary": "#00315d","on-secondary-fixed": "#001c39","primary": "#e1e3e5",
        "tertiary": "#d5e4fd","surface-variant": "#353534","inverse-surface": "#e5e2e1",
        "background": "#131313","on-primary-container": "#505355","surface-container-high": "#2a2a2a",
        "tertiary-container": "#b9c8e1","on-primary-fixed-variant": "#444749",
        "surface-container": "#201f1f","on-primary-fixed": "#191c1e",
        "on-secondary-fixed-variant": "#204876","primary-container": "#c5c7c9",
        "on-surface-variant": "#c3c6d0","on-tertiary-fixed": "#0d1c2f","tertiary-fixed-dim": "#b9c7e0"
      },
      fontFamily: { "headline": ["Manrope"], "body": ["Inter"], "label": ["Space Grotesk"] },
      borderRadius: { "DEFAULT": "0.125rem","lg": "0.25rem","xl": "0.5rem","full": "0.75rem" },
    },
  },
};
tailwind.config = window.__TAILWIND_THEME__;
```

In all three HTML files, replace the inline `<script id="tailwind-config">` block with:

```html
<script src="tailwind-config.js"></script>
```

Place this script tag after the Tailwind CDN `<script>` line.

- [ ] **Step 2: Verify all three pages still render correctly**

Open each page in browser. Confirm colours, fonts, and layout are identical to before. No console errors.

- [ ] **Step 3: Add API key setup comment to `jobs-data.js`**

Replace the CONFIG block in `jobs-data.js`:

```js
// ─────────────────────────────────────────────
// SETUP: Get your free Adzuna API credentials at
// https://developer.adzuna.com
// Replace the placeholders below with your values.
// ─────────────────────────────────────────────
export const CONFIG = {
  APP_ID: 'YOUR_APP_ID',   // ← replace
  APP_KEY: 'YOUR_APP_KEY', // ← replace
  BASE_URL: 'https://api.adzuna.com/v1/api/jobs/ca/search',
  RESULTS_PER_PAGE: 10,
};
```

- [ ] **Step 4: Commit**

```bash
git add tailwind-config.js index.html detail.html saved.html jobs-data.js
git commit -m "refactor: extract shared Tailwind config, add Adzuna key setup comment"
```

---

## Self-Review

**Spec coverage:**
- ✅ `index.html` — live search (debounced 300ms), filter buttons, skeleton, error banner, pagination, nav badge
- ✅ `detail.html` — sessionStorage load, sanitized description, salary sidebar, apply + save buttons, redirect guard
- ✅ `saved.html` — localStorage render, compact cards, timestamps, remove, empty state, "BROWSE LISTINGS" CTA
- ✅ `jobs-data.js` — fetchJobs, renderCard, renderSkeleton, sanitizeHtml, formatTimeAgo, all localStorage helpers
- ✅ Page fade-in (`@keyframes fadeIn` in every page's `<style>`)
- ✅ Card hover: `group-hover:border-l-2 group-hover:border-secondary group-hover:pl-3`
- ✅ PT_ID: generated from job.id + province map
- ✅ Nav active states: hardcoded per page (index highlights Home, saved highlights Saved, detail shows both unselected)
- ✅ Tailwind config: extracted to `tailwind-config.js` in Task 7

**No placeholders found.**

**Type consistency:**
- `fetchJobs` returns `{ jobs, total }` — used correctly in index.html
- `renderCard(job, filter)` signature consistent across all usages
- `saveJob(job)` stores full job object — `detail.html` passes full `job` from sessionStorage ✅
- `formatTimeAgo(job.savedAt)` — `savedAt` set as `Date.now()` in `saveJob` ✅
- `removeSaved(id)` takes string ID — `saved-card` `data-id` attribute provides it ✅

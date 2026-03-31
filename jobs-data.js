// ─────────────────────────────────────────────
// JOBS_NORTH — API Client Module
// All AI inference is now server-side. This module is a thin HTTP client.
// ─────────────────────────────────────────────

const API_BASE = 'http://localhost:3001/api';

// ─── AGENT FUNCTIONS (now backed by the NestJS API) ──────────────────────────

/**
 * "Initializes" the agent — now just checks API health.
 * Instant. No 60-second model load.
 */
export async function initializeAgent(progressCallback) {
  progressCallback('Connecting to agent...');
  const res = await fetch(`${API_BASE}/jobs?limit=1`);
  if (!res.ok) throw new Error('API unreachable');
  progressCallback('Agent connected.');
}

/**
 * Semantic search via the backend.
 * @param {string} query - Natural language query.
 * @param {number} topK - Number of results.
 * @returns {Promise<object[]>} Matched jobs.
 */
export async function findSimilarJobs(query, topK = 5) {
  const res = await fetch(`${API_BASE}/jobs/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Search failed: ${res.status}`);
  }
  const jobs = await res.json();
  // Normalise shape to match the original jobs.json schema expected by renderCard()
  return jobs.map(normaliseJob);
}

/**
 * Fetch a single job by its original_id — fixes the deep-link / sessionStorage bug.
 */
export async function fetchJobById(id) {
  const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Job ${id} not found`);
  const job = await res.json();
  return normaliseJob(job);
}

/**
 * Paginated job listing with optional filters.
 */
export async function fetchJobs({ query = '', filter = 'all', page = 1, limit = 10, province } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (filter && filter !== 'all') params.set('workType', filter);
  if (query) params.set('q', query);
  if (province) params.set('province', province);

  const res = await fetch(`${API_BASE}/jobs?${params}`);
  if (!res.ok) throw new Error('Failed to load jobs');
  const data = await res.json();
  return {
    jobs: data.jobs.map(normaliseJob),
    total: data.total,
  };
}

// ─── Normalise DB row → jobs.json shape ──────────────────────────────────────

function normaliseJob(job) {
  return {
    id: job.original_id ?? String(job.id),
    title: job.title,
    company: job.company ?? { display_name: 'N/A' },
    location: job.location ?? { display_name: 'Canada', area: [] },
    description: job.description ?? '',
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    contract_time: job.contract_time ?? 'part_time',
    work_type: job.work_type ?? 'in-person',
    category: job.category ?? { label: 'General' },
    redirect_url: job.redirect_url ?? '#',
  };
}

// ─── UTILITY & FORMATTING (unchanged) ────────────────────────────────────────

export function generatePTID(job) {
  const PROVINCE_MAP = {
    'Ontario': 'ON', 'British Columbia': 'BC', 'Quebec': 'QC',
    'Alberta': 'AB', 'Nova Scotia': 'NS', 'Manitoba': 'MB',
    'Saskatchewan': 'SK', 'New Brunswick': 'NB',
    'Newfoundland and Labrador': 'NL', 'Prince Edward Island': 'PE',
    'Northwest Territories': 'NT', 'Yukon': 'YT', 'Nunavut': 'NU',
  };
  const area = job.location?.area ?? [];
  for (const a of area) {
    if (PROVINCE_MAP[a]) return `PT_ID: ${String(job.id).slice(-5)}-${PROVINCE_MAP[a]}`;
  }
  return `PT_ID: ${String(job.id).slice(-5)}-CA`;
}

export function formatSalary(job) {
  const min = job.salary_min;
  const max = job.salary_max;
  if (min && max) return `$${Math.round(min).toLocaleString()} – $${Math.round(max).toLocaleString()} / YR`;
  if (min) return `From $${Math.round(min).toLocaleString()} / YR`;
  if (max) return `Up to $${Math.round(max).toLocaleString()} / YR`;
  return 'SALARY N/A';
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

export function formatBadge(job) {
  const time = job.contract_time === 'part_time' ? 'Part-Time' : 'Casual';
  const workType = job.work_type ?? 'in-person';
  const mode = workType === 'remote' ? 'Remote' : workType === 'hybrid' ? 'Hybrid' : 'In-Person';
  return `${time} / ${mode}`;
}

export function renderCard(job) {
  if (!job) return '';
  const ptid = generatePTID(job);
  const salary = formatSalary(job);
  const badge = formatBadge(job);
  const category = escapeHtml(job.category?.label ?? 'General');

  return `
    <div class="group relative flex flex-col md:flex-row md:items-end justify-between transition-all cursor-pointer job-card" data-id="${escapeHtml(job.id)}">
      <div class="absolute -top-6 right-0 font-label text-[10px] text-outline-variant uppercase tracking-widest">${escapeHtml(ptid)}</div>
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
        <span class="font-label text-lg font-bold text-primary">${escapeHtml(salary)}</span>
        <span class="border border-outline-variant/50 px-3 py-1 font-label text-[10px] uppercase tracking-widest text-outline">${escapeHtml(badge)}</span>
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

// ─── LOCAL STORAGE HELPERS (unchanged) ───────────────────────────────────────

const STORAGE_KEY_SAVED = 'jobs_north_saved';
const STORAGE_KEY_HISTORY = 'jobs_north_history';

export function getHistory() {
  try { return JSON.parse(localStorage?.getItem(STORAGE_KEY_HISTORY) ?? '[]'); }
  catch { return []; }
}

export function addToHistory(job) {
  if (!job?.id) return;
  let history = getHistory();
  history = history.filter(j => j.id !== job.id);
  history.unshift(job);
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
}

export function getSaved() {
  try { return JSON.parse(localStorage?.getItem(STORAGE_KEY_SAVED) ?? '[]'); }
  catch { return []; }
}

export function saveJob(job) {
  const saved = getSaved();
  if (!saved.find(j => j.id === job.id)) {
    saved.push({ ...job, savedAt: Date.now(), note: '' });
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(saved));
  }
}

export function updateNote(jobId, note) {
  const saved = getSaved();
  const job = saved.find(j => j.id === jobId);
  if (job) {
    job.note = note;
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(saved));
  }
}

export function removeSaved(id) {
  const saved = getSaved().filter(j => j.id !== id);
  localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(saved));
}

export function isSaved(id) {
  return getSaved().some(j => j.id === id);
}

export function getSavedCount() {
  return getSaved().length;
}
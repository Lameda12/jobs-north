// ─────────────────────────────────────────────
// JOBS_NORTH — Local data module
// Job data lives in jobs.json. No API key needed.
// ─────────────────────────────────────────────

export const CONFIG = {
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
  const id = String(job.id).replace(/\D/g, '').slice(-5).padStart(5, '0');
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
  const workType = job.work_type ?? 'in-person';
  const mode = workType === 'remote' ? 'Remote' : workType === 'hybrid' ? 'Hybrid' : 'In-Person';
  return `${time} / ${mode}`;
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Cache loaded jobs in memory
let _cache = null;

export async function loadAll() {
  if (_cache) return _cache;
  const res = await fetch('./jobs.json');
  if (!res.ok) throw new Error('Failed to load jobs.json');
  _cache = await res.json();
  return _cache;
}

export async function fetchJobById(id) {
  const all = await loadAll();
  return all.find(j => j.id === id);
}

export async function getProvinces() {
  const all = await loadAll();
  const provinces = new Set(all.map(j => extractProvince(j.location?.area)));
  return Array.from(provinces).sort();
}

export async function fetchJobs({ query = '', filter = 'all', province = 'all', page = 1 } = {}) {
  const all = await loadAll();

  let filtered = all;

  // Filter by work type
  if (filter !== 'all') {
    filtered = filtered.filter(j => (j.work_type ?? 'in-person') === filter);
  }

  // Filter by province
  if (province !== 'all') {
    filtered = filtered.filter(j => extractProvince(j.location?.area) === province);
  }

  // Filter by search query (title, company, location, category)
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      j.company?.display_name?.toLowerCase().includes(q) ||
      j.location?.display_name?.toLowerCase().includes(q) ||
      j.category?.label?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * CONFIG.RESULTS_PER_PAGE;
  const jobs = filtered.slice(start, start + CONFIG.RESULTS_PER_PAGE);

  return { jobs, total };
}

export function renderCard(job, filter = 'all') {
  if (!job) return '';
  const ptid = generatePTID(job);
  const salary = formatSalary(job);
  const badge = formatBadge(job, filter);
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

const STORAGE_KEY = 'jobs_north_saved';

export function getSaved() {
  try { return JSON.parse(localStorage?.getItem(STORAGE_KEY) ?? '[]'); }
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

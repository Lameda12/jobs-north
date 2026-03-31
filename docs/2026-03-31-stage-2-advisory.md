# JOBS_NORTH — Stage 2 Advisory Brief
**Classification:** CONFIDENTIAL FOUNDING DOCUMENT  
**Date:** March 31, 2026  
**From:** Full Leadership Council + Advisory Board  
**Re:** Project Polaris — Go/No-Go Decision & Stage 2 Blueprint

---

## PART I: WHAT WE HAVE (Objective Assessment)

Before any opinion, here are the cold facts:

| Dimension | Current State | Rating |
|---|---|---|
| **Concept** | AI career agent for Canadian part-time workers | ⭐⭐⭐⭐⭐ |
| **Frontend** | 3-page vanilla HTML/JS app — editorial dark UI, semantic search via `@xenova/transformers` in-browser | ⭐⭐⭐⭐ |
| **Backend** | NestJS scaffold started in `/platform` — TypeORM + pgvector, NOT yet running | ⭐⭐ (skeleton only) |
| **Data** | 30 hard-coded Canadian part-time jobs in `jobs.json` — no live feed | ⭐⭐ |
| **AI** | Client-side cosine similarity via `all-MiniLM-L6-v2` loaded in the browser — innovative but slow and not scalable | ⭐⭐⭐ |
| **Users** | Zero paying users. Zero. The product is not live beyond a local file | ⭐ |
| **Revenue** | $0 | ⭐ |
| **GitHub** | Exists. Clean commit history. | ⭐⭐⭐⭐ |
| **Differentiation** | Natural language job search + autonomous agent framing = legitimately rare | ⭐⭐⭐⭐⭐ |

**Pre-advisor verdict:** Strong concept, beautiful prototype, zero traction. Classic pre-seed state.

---

## PART II: THE ADVISORY BOARD SPEAKS

### Elon Musk — First Principles and Speed

"Stop perfecting the prototype. The browser-side AI model loading is a cute hack, but wrong. You are shipping the compute cost to the user's machine. That is thinking small. Move the inference to the server, cut 90% of the load time. First principles: what is the actual job of this product? It is to get someone employed faster than any other tool. Everything else is noise. Kill features. Ship the server. Get 1,000 real Canadians using it in 30 days. That is the only metric that matters right now."

**Verdict: BUILD. Ship the backend NOW. Stop designing, start deploying.**

---

### Paul Graham (YC) — User Obsession and Distribution

"The biggest risk is not technical — it is that you are building for a market you have not talked to. Have you sat with 10 Canadian part-time workers for 30 minutes each? The insight that makes this company is hiding in those conversations. The autonomous career agent frame is a great story, but does the 22-year-old in Toronto trying to pay rent think of themselves as needing an autonomous agent? Or do they just need jobs found fast, in a way that does not feel like a robot?

On distribution: you do not have a product yet — you have a demo. The moment you have a live URL that actually finds real jobs in real time, post it on Reddit: r/PersonalFinanceCanada, r/TorontoJobs, r/Halifax. That is your first 1,000 users. Free. Organic. If people share it without being asked, you have something.

On YC: They will want to see three things — a live product with real users, week-over-week growth, and a founding team that knows the problem from the inside. Fix those three things first."

**Verdict: BUILD, but talk to users FIRST. Get a live URL before applying to anything.**

---

### Naval Ravikant — Specific Knowledge and Moat

"The moat here is not the technology — every job board can copy semantic search in a weekend. The moat is the data and the brand. You need to control proprietary data that no one else has. What does that look like? User behavioral data: which jobs do people actually apply to? Which listings do they save vs. skip? That signal, accumulated over time, is what trains your matching model into something nobody can replicate.

On monetization: do not complicate it. The user who gets a job through your platform is delighted. That is the moment they will pay. Think about a success fee model alongside subscriptions — charge nothing until they get hired, then collect. That aligns incentives perfectly and makes your marketing story trivial: 'We only make money when you get hired.'

On the agent framing: this is exactly right. The best businesses are ones where the software does the work while you sleep. An agent that monitors for new jobs, auto-applies based on your preferences, and sends you a text when it finds a match — that is the product. Build toward that. Everything else is scaffolding."

**Verdict: BUILD. Your moat is behavioral data. Start collecting it from day one.**

---

### Rick Rubin — Essence and Experience

"I do not look at the code. I look at the feeling. When someone opens this app for the first time — what do they feel? Right now, there is something there. The dark aesthetic, the editorial typography, the 'Task your agent' headline — it has an attitude. That is rare. Do not lose that soul when you scale.

The greatest products — the ones people love — have one thing: they feel like they were made for you specifically. A person opening JOBS_NORTH in Hamilton, Ontario should feel like this platform sees them. Not a category. Not a demographic. Them.

The moment you get a job match, the copy that delivers it matters as much as the algorithm that found it. 'I found 3 roles that fit what you described' hits differently than 'Results: 3.' Words carry energy. Do not hand that off to an engineer — that is a creative decision."

**Verdict: BUILD. But protect the soul of the product through the build. Do not let engineering kill the feeling.**

---

## PART III: THE LEADERSHIP TEAM RESPONDS

### CEO — The Strategic Decision

The advisory board consensus is unanimous: **PROCEED TO STAGE 2.**

Three conditions to unlock Stage 2 fully:
1. The concept is differentiated and fundable — confirmed
2. We need a live product with a real URL before any accelerator application
3. We need behavioral data from real users — even 500 users changes the investor story completely

**Decision: Begin Stage 2 immediately. Target CDL or Antler Canada for Q3 2026. YC as stretch goal (requires Delaware C-Corp flip).**

---

### CTO — The Technical Judgment

The current stack has three critical weaknesses that Stage 2 must resolve:

1. **Client-side AI is wrong.** Loading a 25MB ML model in every user's browser is a UX anti-pattern. Initialization takes 30–60 seconds on first load. This will kill conversion.
2. **Static data is a liability.** 30 hard-coded jobs means the product feels dead. No one will return.
3. **No user identity.** Without accounts, we cannot collect behavioral data, send notifications, or build a Pro subscription.

Stage 2 is not optional. The current architecture cannot scale to the vision.

---

### COO — The Operations Plan

Two workstreams run in parallel in Stage 2:

- **Workstream A (Backend):** Activate the NestJS platform. Deploy Postgres + pgvector. Move all AI inference server-side.
- **Workstream B (Data):** Build a live scraping pipeline. Crawlee + Playwright targeting Indeed Canada, LinkedIn Canada, and Job Bank.

These two workstreams are non-negotiable before any marketing or accelerator push.

---

### CFO — The Financial Model

| Path | Upfront Cost | Risk |
|---|---|---|
| Bootstrap to 1,000 users, apply to CDL (zero equity) | ~$0 | Low |
| Antler Canada — co-founder + capital ($125K CAD) | ~5% equity | Medium |
| Y Combinator (Delaware flip required) | ~7% equity | High admin, high reward |

**Short-term monetization target:** Launch JOBS_NORTH Pro at **$9.99 CAD/month** at 5,000 users. Conversion target of 3% = **$1,500 MRR on Day 1**. That is enough to prove willingness-to-pay to investors before any raise.

---

### CMO — The Go-to-Market

**Three launch channels, zero paid ads:**

1. **Reddit:** r/PersonalFinanceCanada, r/TorontoJobs, r/learnprogramming — post a genuine story: "I built this because job boards are broken"
2. **Product Hunt:** Time for a Tuesday. Need 10 friends upvoting at 12:01 AM. "AI job agent for Canada" is a fresh hook.
3. **University partnerships:** 3 Canadian career centers. Free 1-semester partnership. Students are the target user and they share virally.

**Brand mantra:** *"Your job, found. Not searched."*

---

### PM — The Product Priority Stack

| Priority | Feature | Why It Matters |
|---|---|---|
| P0 | Live job feed (real scraping) | Dead data = dead product |
| P0 | Server-side vector search | 60s cold start → 200ms = 10x better UX |
| P1 | User accounts (email auth) | Required for Pro tier and data collection |
| P1 | Email job alerts ("we found a new match") | The killer retention feature — brings users back |
| P2 | Application tracker (kanban) | Full pipeline management in one place |
| P2 | Resume parser + ATS score | The Pro differentiator — justifies $9.99/month |
| P3 | B2B recruiter access | The $100M MRR endgame |

---

## PART IV: STAGE 2 — FULL TECHNICAL BLUEPRINT

### Architecture Overview

```
Frontend (Next.js / Vercel)
        |
        v
NestJS API Platform
  /jobs/search (semantic)
  /jobs/:id
  /auth/register + /auth/login
  /alerts (cron-driven)
        |
        v
PostgreSQL + pgvector
  jobs (id, title, embedding VECTOR(384), ...)
  users (id, email, preferences, ...)
  saved_jobs, applications, alerts
        |
   _____|_____
  |           |
  v           v
Embedding    Data Pipeline
Service      Crawlee + Playwright
(server-     (daily cron scrape)
 side)
Bull/Redis queue for async embeddings
```

---

### Tool Stack: Vetted and Ranked

#### AI and Embeddings

| Tool | Purpose | GitHub | Decision |
|---|---|---|---|
| `@xenova/transformers` | Embedding model — keep, move server-side | [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | KEEP — move to server |
| `nomic-embed-text-v1.5` | Stronger embedding model (768 dims) | [nomic-ai on HuggingFace](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5) | UPGRADE in Stage 2b |
| `Ollama` | Run embeddings locally in dev — zero API cost | [ollama/ollama](https://github.com/ollama/ollama) | Use in development |
| `LangChain.js` | Agentic orchestration for multi-step reasoning | [langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) | Stage 3 feature |

#### Database and Search

| Tool | Purpose | Decision |
|---|---|---|
| `pgvector` 0.8+ | Vector similarity search in Postgres (already in stack) | KEEP |
| `HNSW index` | Production-grade ANN — replace default index | ADD: `CREATE INDEX USING hnsw` |
| `ParadeDB` | Hybrid BM25 + vector search in Postgres | Evaluate for Stage 3 — [paradedb/paradedb](https://github.com/paradedb/paradedb) |
| `PgBouncer` | Connection pooling for production | Add in prod Docker config |

> **CTO NOTE:** Strongly recommend evaluating **Supabase** as the backend platform. Managed Postgres + pgvector + Auth + Row Level Security out of the box. Compresses backend buildout from 4 weeks to 1 week. Evaluate this before committing to full DIY NestJS deployment.

#### Live Data Pipeline

| Tool | Purpose | GitHub | Decision |
|---|---|---|---|
| `Crawlee` | Crawling framework — battle-tested, anti-bot resilient | [apify/crawlee](https://github.com/apify/crawlee) | PRIMARY scraper tool |
| `Playwright` | Browser automation for JS-rendered job boards | [microsoft/playwright](https://github.com/microsoft/playwright) | Use with Crawlee |
| `Bull` + `Redis` | Async queue for embedding new jobs | [OptimalBits/bull](https://github.com/OptimalBits/bull) | Required |
| `node-cron` | Schedule daily scrapes in NestJS | Built-in NestJS support | Add to platform |

**Scrape target priority:**
1. `jobs.gc.ca` — Job Bank Canada (government source, legal, 500K+ listings)
2. `ca.indeed.com` — largest job volume in Canada
3. `linkedin.com/jobs` — quality signal + apply tracking
4. `workopolis.com` — Canadian-specific
5. `glassdoor.ca` — salary enrichment

#### Auth and Infrastructure

| Tool | Decision |
|---|---|
| `@nestjs/passport` + JWT | Standard NestJS auth — already scaffolded |
| `bcrypt` | Password hashing — required |
| `Resend` | Transactional email for job alerts — developer-friendly |
| `Railway` or `Render` | Free-tier deployment — get live URL in 2 days |
| Docker Compose | Already in `/platform` — keep as-is |

#### Frontend Upgrade

| Tool | Decision |
|---|---|
| `Next.js 15` App Router | Replace vanilla HTML — required for auth + SSR |
| `Tailwind CSS v4` | Keep the existing design system |
| `Framer Motion` | Micro-animations — card entrance, agent "thinking" state |
| `SWR` | Data fetching + cache for Next.js |

---

### Fine-Tuning Strategy: Open-Source LLM for JOBS_NORTH

#### Stage 2 (Now): RAG, Not Fine-Tuning

The right approach is Retrieval-Augmented Generation with a hosted API:

```
User query
  → embed server-side (transformers.js / nomic-embed)
  → pgvector HNSW search → top 10 candidate jobs
  → LLM re-ranks and explains in plain language
  → 5 results returned to user
```

- **Model:** Claude Haiku (cheapest, fastest) or GPT-4o-mini
- **Cost:** ~$0.002 per search — 10,000 queries/day = $20/day. Manageable.
- **Latency:** Under 500ms total

#### Stage 3 (6+ months post-launch): Custom Fine-Tuning

Once you have 10,000+ proprietary query-result pairs from real user behavior:

- **Base model:** Llama 3.3 8B (Meta, Apache 2.0 license — commercial use OK)
- **Framework:** Unsloth (2–5x faster training, fits on a single A100 GPU)
- **Technique:** QLoRA (4-bit quantization = fits in 24GB VRAM)
- **Dataset Phase 1:** Synthetic — use GPT-4o to generate "query → ideal job match + plain-English explanation" pairs
- **Dataset Phase 2:** Real JOBS_NORTH behavioral data — user queries, saved jobs, applications, skips
- **GPU rental:** RunPod ($0.79/hr for A100) or Lambda Labs
- **Serving:** Hugging Face Endpoints or Baseten

**GitHub repositories to study now:**
- [unslothai/unsloth](https://github.com/unslothai/unsloth) — fine-tuning framework
- [haruiz/job-matching-app](https://github.com/haruiz/job-matching-app) — multi-agent job matching reference
- [touhi99/genai-job-agents](https://github.com/touhi99/genai-job-agents) — LangChain career agent reference
- [langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) — agentic orchestration
- [Jenqyang/Awesome-AI-Agents](https://github.com/Jenqyang/Awesome-AI-Agents) — curated agent pattern library
- [paradedb/paradedb](https://github.com/paradedb/paradedb) — hybrid lexical + vector search

---

## PART V: THE ACCELERATOR DECISION

### Honest Answer: Build First. Apply in 90 Days.

You cannot walk into CDL or Antler with a local HTML file. The minimum bar for a credible application:

- Live URL with real jobs (not localhost)
- Server-side AI with sub-500ms search
- 100+ real users with engagement data
- Week-over-week user retention signal

### Accelerator Targets (Ranked by Fit)

| Accelerator | Equity Ask | When to Apply | Why |
|---|---|---|---|
| **CDL (Creative Destruction Lab)** | 0% | Q3 2026 | Best AI network in Canada, zero equity, most prestigious |
| **NextAI (NEXT Canada)** | 0–3% | Rolling applications | Specifically for AI-enabled startups, Toronto + Montreal |
| **DMZ (Toronto Metropolitan Univ.)** | 0% | Q2 2026 | Zero equity, strong services, large network |
| **Antler Canada** | ~5% + $125K CAD | Now or Q3 2026 | Helps find co-founders, good early capital |
| **Y Combinator** | 7% + $500K USD | Q4 2026 or later | Requires Delaware C-Corp flip. Max upside and signal. |

**CFO recommendation:** Apply to CDL + DMZ (zero equity) first. Use acceptance as negotiating leverage for better Antler or YC terms.

---

## PART VI: MONETIZATION — THE FLAWLESS PAYMENT EXPERIENCE

**Guiding principle (per Naval + PG):** Users should feel the value, not the payment.

### Pricing Architecture

```
FREE TIER — Always Free, No Credit Card Required
  10 agent searches per month
  Save up to 5 jobs
  Basic work-type and location filters

PRO TIER — $9.99 CAD/month or $79.99/year
  Unlimited agent searches
  Real-time job alerts (email + push notification)
  Intelligent Dossier: ATS keyword score, skill gap analysis
  Application Tracker (kanban board)
  Resume builder and optimizer
  Priority listings (freshest jobs surfaced first)

RECRUITER TIER — $249 CAD/month per seat (Stage 3, B2B)
  Search active user base by skills and intent signals
  Anonymous candidate profiles
  Direct invite-to-apply outreach
  ATS integrations (Greenhouse, Lever)
```

### Flawless UX Doctrine (Non-Negotiable)

1. **Fast** — Search responds in under 500ms (server-side vector search, no client-side model download)
2. **Smart** — Results feel personally curated, not keyword-matched
3. **Human** — Copy reads like a thoughtful friend: "I found 3 roles that fit what you described"
4. **Trustworthy** — No dark patterns, no surprise charges, no spam, no noise

Specific mandates:
- ELIMINATE the 60-second "Loading AI model..." cold start (solved by moving to server)
- Skeleton cards appear in 100ms before real data arrives
- Mobile-first layout (80% of Canadian part-time job seekers use phones)
- Upgrade prompt feels like unlocking value, not hitting a wall
- Error states are editorial: "CONNECTION LOST — retrying in 5s"

---

## PART VII: 8-WEEK EXECUTION CHECKLIST

### Sprint 1 — Weeks 1 and 2: Live Platform
- [ ] End-to-end test of `platform/` NestJS app with Docker Compose
- [ ] Add HNSW index to pgvector schema
- [ ] Move embedding generation server-side with Bull/Redis queue
- [ ] `/jobs/search` semantic search endpoint operational
- [ ] Frontend fetches from backend API (remove all client-side AI code)
- [ ] Deploy to Railway or Render (free tier)
- [ ] Acquire domain: jobsnorth.ca

### Sprint 2 — Weeks 3 and 4: Live Data
- [ ] Build Crawlee + Playwright scraper for Job Bank Canada (jobs.gc.ca)
- [ ] Seed 500+ real Canadian part-time jobs into database
- [ ] Daily cron scrape scheduled
- [ ] Auto-embedding pipeline for new jobs

### Sprint 3 — Weeks 5 and 6: User Identity and Retention
- [ ] Email auth with NestJS Passport + JWT
- [ ] Sync saved jobs to backend (not just localStorage)
- [ ] Email job alert system (new match triggers Resend email)
- [ ] Basic user dashboard (search history, saved jobs, alerts)

### Sprint 4 — Weeks 7 and 8: Polish, Launch, and Applications
- [ ] Frontend migrated to Next.js or vanilla HTML connected cleanly to API
- [ ] Framer Motion micro-animations added
- [ ] Product Hunt launch prep: screenshots, description, friend activation list
- [ ] Reddit soft launch: genuine founder story post
- [ ] CDL and DMZ application research and draft submitted

---

## PART VIII: LEADERSHIP TEAM FINAL VERDICT

| Role | Verdict | Primary Condition |
|---|---|---|
| **CEO** | GO | Live URL in 2 weeks |
| **President** | GO | Data pipeline is P0 |
| **CTO** | GO | Evaluate Supabase vs. DIY NestJS to compress timeline |
| **COO** | GO | Two parallel workstreams, weekly stand-ups |
| **CFO** | GO | Bootstrap to CDL, protect equity |
| **CMO** | GO | No ads — Reddit launch at 500 real jobs milestone |
| **PM** | GO | P0 features only in Stage 2, no scope creep |
| **Elon Musk** | SHIP IT | "Stop iterating on the prototype. Get to 1,000 users." |
| **Paul Graham** | GO | "Talk to 10 real users this week before writing a single line." |
| **Naval Ravikant** | GO | "Behavioral data is your moat. Log everything from Day 1." |
| **Rick Rubin** | GO | "Protect the voice of the product. Do not let engineering kill the soul." |

---

## CLOSING NOTE FROM THE CHAIRMAN

The prototype proved one thing: **the idea has a soul.**

The next 8 weeks will prove whether the team can execute.

Stage 2 is not about perfection. It is about getting a real product in front of real Canadians who need work.

**The single metric that drives everything in Stage 2:**  
How many users return after their first search?

> If that number is above 30%, we have product-market fit.  
> If it is below 10%, we iterate until it is.

The leadership council and advisory board are unanimous.

We proceed. The build starts now.

---

*Document version 1.0*  
*Next review: April 30, 2026*  
*Repo: `docs/2026-03-31-stage-2-advisory.md`*

# Project Polaris: The Architecture of a $100M MRR Business

**MEMORANDUM**

**TO:** The Chairman
**FROM:** The Founding Team (CEO, President, VP, CTO, COO, CFO, CMO)
**SUBJECT:** **Project Polaris: The Architecture of a $100M MRR Business**

---

### 1. The Vision (The CEO's Pitch)

Our vision is not to build a better job board. It is to make the entire concept of a "job board" obsolete. We will build the world's first **autonomous career agent**. An AI that doesn't just find a user's next job, but manages their entire career lifecycle.

LinkedIn is a digital rolodex. We will be an AI-powered Chief of Staff. This is our unfair advantage, and it is how we will capture the market.

---

### 2. The Product & Technical Roadmap (The CTO/COO Plan)

To apply to any serious accelerator and build a scalable business, our current client-side architecture must be completely rebuilt. This is the single most critical step.

#### **Phase 1: The Platform (The Next 3-6 Months)**
This phase is about transforming our prototype into a robust, scalable, "distribution-ready" product.

*   **Backend:** We will build a new backend service using **Node.js with the NestJS framework** for its structure and scalability. The database will be **PostgreSQL with the `pgvector` extension**, the industry standard for high-speed vector search. All AI processing will be moved to the server.
    *   **Subagent Task 1 (Backend):** "Scaffold a new backend service using Node.js/NestJS. Set up a PostgreSQL database with Docker and the `pgvector` extension. Create the initial API endpoints for serving jobs and performing semantic search."

*   **Data Ingestion:** The static `jobs.json` file is our biggest liability. We will build an automated data pipeline.
    *   **Subagent Task 2 (Data):** "Build a data ingestion service using **Playwright**. This service will scrape the top 5 Canadian job boards daily and populate our PostgreSQL database, ensuring our data is always live."

*   **Frontend:** The existing UI will be refactored to communicate with our new backend API.
    *   **Subagent Task 3 (Frontend):** "Refactor the `jobs-data.js` module to remove all client-side processing. All data calls will now be made to the new NestJS backend API."

---

### 3. The Go-to-Market & Monetization (The CMO/CFO Plan)

This is our path to $100M MRR.

*   **Years 1-2: Achieve Product-Market Fit (The Free Tier)**
    *   **Goal:** Acquire our first 100,000+ active users.
    *   **Strategy:** We will launch on Product Hunt, Hacker News, and other tech communities. The narrative—"We built an AI that finds you a job for free"—is highly viral. At this stage, user growth is the only metric. Monetization is zero.

*   **Years 2-4: Introduce the Pro Tier (Path to Profitability)**
    *   **Goal:** Convert our most engaged users to a subscription.
    *   **Strategy:** Launch **JOBS_NORTH Pro** at **$10/month**.
    *   **Pro Features:** The full "Intelligent Dossier" (ATS keywords, skill analysis), proactive 24/7 agent monitoring with email/push notifications, and career path modeling.
    *   **Financial Milestone:** Converting just 84,000 users (a fraction of our projected user base) gets us to **$10M ARR / ~$840k MRR**.

*   **Years 4-5+: The B2B Platform (Path to $100M MRR)**
    *   **Goal:** Sell into the enterprise.
    *   **Strategy:** Launch **JOBS_NORTH for Recruiters** at **$500/month/seat**.
    *   **The Product:** Recruiters don't search a database of stale resumes. They describe their ideal candidate's skills and intent, and our AI delivers a ranked, anonymized list of our active users who are a perfect match. This is a 100x improvement over LinkedIn Recruiter.
    *   **Financial Milestone:** To exceed **$100M MRR**, we need to capture ~17,000 recruiter seats globally. In a multi-trillion dollar industry, this is the prize.

---

### Immediate Next Steps

Project Polaris is the blueprint. The work is substantial, but the path is clear. The first, non-negotiable step is to build the backend platform.

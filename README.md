# ResearchLink

ResearchLink is a student-friendly university research discovery platform. It enables administrators to submit public research links, automatically processes those URLs using an extraction engine (powered by metadata heuristics and fallback LLM parsing), ranks the resulting profiles dynamically in a recent-first feed, and helps undergraduate students draft highly tailored academic outreach emails.

---

## Technical Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Database:** PostgreSQL (with Prisma ORM)
- **Styling:** Tailwind CSS (premium themes & glassmorphic accents)
- **Testing:** Vitest
- **Extraction Tools:** Cheerio (for HTML parsing) & Google Gemini SDK (optional)

---

## Features

1. **AI & Heuristic Extraction:** Crawls submitted academic pages, extracts key entities (Researcher names, title, department, email, source types), estimates publication dates, flags missing parameters, and assigns extraction confidence scores.
2. **Dynamic Queue Worker:** A database-backed job queue records enqueued links, processes them asynchronously, and retains multi-step action logs.
3. **Recent-First Ranking:** Organizes papers based on a five-tier hierarchy:
   1. Publication date (most recent first)
   2. Verification status (verified profiles first)
   3. Document source quality (publication > grant > lab page > university news > professor page)
   4. Email visibility (profiles with contact info first)
   5. Search keyword relevance
4. **Outreach Composer Widget:** Takes student information, major, skills, and coursework to generate custom, respectful email drafts referencing specific findings from selected papers. Can be copied or launched instantly in native mail apps.
5. **Admin Console:** Dashboard to submit URLs, monitor extraction logs, manually override/edit fields, toggle verified badges, and trigger manual queue reprocessing.

---

## Installation & Setup

### 1. Configure the Environment
Ensure your PostgreSQL database is running, then create a `.env` file in the root directory:
```bash
DATABASE_URL="postgresql://<username>@localhost:5432/researchlink"
JWT_SECRET="your-jwt-secure-signing-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# GEMINI_API_KEY="" # Optional key for real Gemini LLM structured parsing
```

### 2. Setup the Database Schema
Install node packages, run migrations to generate the tables, and seed the database with baseline university profiles:
```bash
# Install packages
npm install

# Run Prisma schema migrations
npx prisma migrate dev --name init

# Seed database (creates admin@researchlink.edu / student@researchlink.edu accounts)
npx prisma db seed
```

### 3. Run the Development Environment
Launch the Next.js frontend, backend API server, and background worker queue polling:
```bash
# Term 1: Run Web Server
npm run dev

# Term 2: Run Background Queue Worker
npm run worker
```

---

## Running Automated Tests
Run the Vitest test suite to verify extraction heuristics, database query filters, multi-tier ranking, and outreach draft placeholders:
```bash
npm run test
```

---

## User Accounts (Seed Defaults)
You can log in and test page functionalities using these preconfigured accounts:
- **Admin Account:** `admin@researchlink.edu` / Password: `admin123`
- **Student Account:** `student@researchlink.edu` / Password: `student123`

<!-- Deployment update -->

<!-- Deployment update -->
# ResearchLink - Active Research Opportunities Index
An intelligent index platform designed to help undergraduate students discover active research labs and professors.
## Production Server Setup
Running on https://detectresearch.com
## Database Scaling Strategy

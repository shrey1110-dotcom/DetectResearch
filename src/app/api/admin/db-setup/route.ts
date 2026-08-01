import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// This route auto-creates all tables and seeds data using the Prisma Client
// (no CLI/engines needed). Safe to call multiple times — it skips if tables exist.
export async function GET(req: Request) {
  const results: string[] = [];

  try {
    const { searchParams } = new URL(req.url);
    const forceReset = searchParams.get('reset') === 'true';

    // Ensure active research columns exist in Postgres (Safe migration for existing DB)
    const researchItemTableExists = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'research_items')`
    );
    if (researchItemTableExists[0]?.exists) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "research_items" ADD COLUMN IF NOT EXISTS "activity_status" TEXT NOT NULL DEFAULT 'ACTIVE'`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "research_items" ADD COLUMN IF NOT EXISTS "activity_evidence" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "research_items" ADD COLUMN IF NOT EXISTS "last_verified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);

      // Update any legacy mock URLs in production Postgres to real live accessible portals
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.utexas.edu' WHERE "source_url" LIKE '%utaustin%' OR "source_url" LIKE '%utexas%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.csulb.edu/college-of-engineering/computer-engineering-computer-science' WHERE "source_url" LIKE '%5g-wireless%' OR "university_id" IN (SELECT "id" FROM "universities" WHERE "domain" = 'csulb.edu')`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.pacific.edu/engineering-and-computer-science' WHERE "source_url" LIKE '%agricultural-iot%' OR "university_id" IN (SELECT "id" FROM "universities" WHERE "domain" = 'pacific.edu')`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://news.mit.edu' WHERE "source_url" LIKE '%mit-quantum%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://engineering.stanford.edu' WHERE "source_url" LIKE '%bao-group%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://chemistry.harvard.edu' WHERE "source_url" LIKE '%nature.com%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://eecs.berkeley.edu' WHERE "source_url" LIKE '%climate-resilient%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.ufl.edu' WHERE "source_url" LIKE '%universityofflorida%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.dartmouth.edu' WHERE "source_url" LIKE '%dartmouthcollege%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://engineering.jhu.edu' WHERE "source_url" LIKE '%johnshopkins%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.bu.edu' WHERE "source_url" LIKE '%bostonuniversity%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.upenn.edu' WHERE "source_url" LIKE '%universityofpennsylvania%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.umd.edu' WHERE "source_url" LIKE '%universityofmaryland%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.osu.edu' WHERE "source_url" LIKE '%ohiostateuniversity%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.washington.edu' WHERE "source_url" LIKE '%universityofwashington%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://pme.uchicago.edu' WHERE "source_url" LIKE '%universityofchicago%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.vanderbilt.edu' WHERE "source_url" LIKE '%vanderbiltuniversity%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.brown.edu' WHERE "source_url" LIKE '%brownuniversity%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.duke.edu' WHERE "source_url" LIKE '%dukeuniversity%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://engineering.purdue.edu' WHERE "source_url" LIKE '%purdueuniversity%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.samueli.ucla.edu' WHERE "source_url" LIKE '%ucla%'`);
      await prisma.$executeRawUnsafe(`UPDATE "research_items" SET "source_url" = 'https://www.eas.caltech.edu' WHERE "source_url" LIKE '%caltech%'`);
    }

    // Step 1: Check if tables already exist
    const tableCheck = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'universities')`
    );
    
    if (tableCheck[0]?.exists && !forceReset) {
      // Tables exist — check if we have seed data
      const count = await prisma.university.count();
      if (count > 0) {
        return NextResponse.json({ 
          success: true, 
          message: 'Database updated and active.',
          universityCount: count 
        });
      }
      results.push('Tables exist but no seed data — seeding now.');
    } else {
      // Step 2: Create enums
      results.push('Creating schema...');
      
      await prisma.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN'); END IF; END $$;`);
      await prisma.$executeRawUnsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProcessStatus') THEN CREATE TYPE "ProcessStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED'); END IF; END $$;`);
      results.push('Enums created.');

      // Step 3: Create tables
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "users" ("id" TEXT NOT NULL, "email" TEXT NOT NULL, "password_hash" TEXT NOT NULL, "name" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'STUDENT', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "users_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "admins" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "admins_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "research_links" ("id" TEXT NOT NULL, "url" TEXT NOT NULL, "status" "ProcessStatus" NOT NULL DEFAULT 'PENDING', "added_by_user_id" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, "error_msg" TEXT, CONSTRAINT "research_links_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "universities" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "domain" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "universities_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "departments" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "university_id" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "departments_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "professors" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "title" TEXT, "university_id" TEXT NOT NULL, "department_id" TEXT, "public_profile_url" TEXT, "email" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "professors_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "research_items" ("id" TEXT NOT NULL, "research_link_id" TEXT NOT NULL, "title" TEXT NOT NULL, "summary" TEXT NOT NULL, "significance" TEXT, "university_id" TEXT NOT NULL, "department_id" TEXT, "professor_id" TEXT, "publication_date" TIMESTAMP(3), "source_url" TEXT NOT NULL, "source_type" TEXT NOT NULL DEFAULT 'publication', "confidence_scores" JSONB NOT NULL, "missing_info_flags" JSONB NOT NULL, "is_verified" BOOLEAN NOT NULL DEFAULT false, "verified_by_user_id" TEXT, "activity_status" TEXT NOT NULL DEFAULT 'ACTIVE', "activity_evidence" TEXT, "last_verified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "research_items_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "professor_research_links" ("professor_id" TEXT NOT NULL, "research_item_id" TEXT NOT NULL, CONSTRAINT "professor_research_links_pkey" PRIMARY KEY ("professor_id","research_item_id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "topics" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "topics_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "research_item_topics" ("research_item_id" TEXT NOT NULL, "topic_id" TEXT NOT NULL, CONSTRAINT "research_item_topics_pkey" PRIMARY KEY ("research_item_id","topic_id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "saved_research" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "research_item_id" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "saved_research_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "outreach_drafts" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "professor_id" TEXT NOT NULL, "research_item_id" TEXT NOT NULL, "student_name" TEXT NOT NULL, "student_major" TEXT NOT NULL, "student_year" TEXT NOT NULL, "student_interests" TEXT NOT NULL, "student_skills" TEXT NOT NULL, "email_subject" TEXT NOT NULL, "email_body" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "outreach_drafts_pkey" PRIMARY KEY ("id"))`);
      await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "extraction_logs" ("id" TEXT NOT NULL, "research_link_id" TEXT NOT NULL, "step_name" TEXT NOT NULL, "status" TEXT NOT NULL, "message" TEXT NOT NULL, "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "extraction_logs_pkey" PRIMARY KEY ("id"))`);
      results.push('All 13 tables created.');

      // Step 4: Create indexes (ignore if already exist)
      const indexes = [
        `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "admins_user_id_key" ON "admins"("user_id")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "research_links_url_key" ON "research_links"("url")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "research_items_research_link_id_key" ON "research_items"("research_link_id")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "universities_name_key" ON "universities"("name")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "departments_name_university_id_key" ON "departments"("name", "university_id")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "topics_name_key" ON "topics"("name")`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "saved_research_user_id_research_item_id_key" ON "saved_research"("user_id", "research_item_id")`,
      ];
      for (const idx of indexes) {
        await prisma.$executeRawUnsafe(idx);
      }
      results.push('Indexes created.');

      // Step 5: Add foreign keys (use DO block to skip if exists)
      const fkeys = [
        { name: 'admins_user_id_fkey', sql: `ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'research_links_added_by_user_id_fkey', sql: `ALTER TABLE "research_links" ADD CONSTRAINT "research_links_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
        { name: 'research_items_research_link_id_fkey', sql: `ALTER TABLE "research_items" ADD CONSTRAINT "research_items_research_link_id_fkey" FOREIGN KEY ("research_link_id") REFERENCES "research_links"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'research_items_university_id_fkey', sql: `ALTER TABLE "research_items" ADD CONSTRAINT "research_items_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE` },
        { name: 'research_items_department_id_fkey', sql: `ALTER TABLE "research_items" ADD CONSTRAINT "research_items_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
        { name: 'research_items_professor_id_fkey', sql: `ALTER TABLE "research_items" ADD CONSTRAINT "research_items_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
        { name: 'research_items_verified_by_user_id_fkey', sql: `ALTER TABLE "research_items" ADD CONSTRAINT "research_items_verified_by_user_id_fkey" FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
        { name: 'professors_university_id_fkey', sql: `ALTER TABLE "professors" ADD CONSTRAINT "professors_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE` },
        { name: 'professors_department_id_fkey', sql: `ALTER TABLE "professors" ADD CONSTRAINT "professors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE` },
        { name: 'professor_research_links_professor_id_fkey', sql: `ALTER TABLE "professor_research_links" ADD CONSTRAINT "professor_research_links_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'professor_research_links_research_item_id_fkey', sql: `ALTER TABLE "professor_research_links" ADD CONSTRAINT "professor_research_links_research_item_id_fkey" FOREIGN KEY ("research_item_id") REFERENCES "research_items"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'departments_university_id_fkey', sql: `ALTER TABLE "departments" ADD CONSTRAINT "departments_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'research_item_topics_research_item_id_fkey', sql: `ALTER TABLE "research_item_topics" ADD CONSTRAINT "research_item_topics_research_item_id_fkey" FOREIGN KEY ("research_item_id") REFERENCES "research_items"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'research_item_topics_topic_id_fkey', sql: `ALTER TABLE "research_item_topics" ADD CONSTRAINT "research_item_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'saved_research_user_id_fkey', sql: `ALTER TABLE "saved_research" ADD CONSTRAINT "saved_research_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'saved_research_research_item_id_fkey', sql: `ALTER TABLE "saved_research" ADD CONSTRAINT "saved_research_research_item_id_fkey" FOREIGN KEY ("research_item_id") REFERENCES "research_items"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'outreach_drafts_user_id_fkey', sql: `ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'outreach_drafts_professor_id_fkey', sql: `ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'outreach_drafts_research_item_id_fkey', sql: `ALTER TABLE "outreach_drafts" ADD CONSTRAINT "outreach_drafts_research_item_id_fkey" FOREIGN KEY ("research_item_id") REFERENCES "research_items"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
        { name: 'extraction_logs_research_link_id_fkey', sql: `ALTER TABLE "extraction_logs" ADD CONSTRAINT "extraction_logs_research_link_id_fkey" FOREIGN KEY ("research_link_id") REFERENCES "research_links"("id") ON DELETE CASCADE ON UPDATE CASCADE` },
      ];
      for (const fk of fkeys) {
        try { await prisma.$executeRawUnsafe(fk.sql); } catch { /* constraint already exists */ }
      }
      results.push('Foreign keys created.');
    }

    // Step 6: Seed data (idempotent — uses upsert-like ON CONFLICT DO NOTHING)
    results.push('Seeding data...');

    // Admin user
    await prisma.$executeRawUnsafe(`INSERT INTO "users" ("id","email","password_hash","name","role","created_at","updated_at") VALUES ('1495e6b2-35c1-4c93-99dd-2b2d6539a696','admin@detectresearch.com','$2a$10$YzQ5ZjE4ZmE3YzA0ZjQ0Ou6PqX8pZ5z5z5z5z5z5z5z5z5z5z5z5z','Admin','ADMIN','2026-07-09 02:50:01.800','2026-07-09 02:50:01.800') ON CONFLICT DO NOTHING`);
    await prisma.$executeRawUnsafe(`INSERT INTO "admins" ("id","user_id","created_at","updated_at") VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890','1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.800','2026-07-09 02:50:01.800') ON CONFLICT DO NOTHING`);

    // Universities
    await prisma.$executeRawUnsafe(`INSERT INTO "universities" ("id","name","domain","created_at","updated_at") VALUES ('0b88ab6c-8878-4e54-82a4-cbf1f13edeab','MIT','mit.edu','2026-07-09 02:50:01.806','2026-07-09 02:50:01.806'),('23b09cef-4724-4aa6-b731-13c5672748e1','Stanford University','stanford.edu','2026-07-09 02:50:01.808','2026-07-09 02:50:01.808'),('ac50ec87-4b34-4fbf-bbe9-5158410cc0d8','Harvard University','harvard.edu','2026-07-09 02:50:01.809','2026-07-09 02:50:01.809'),('f08be367-e8f9-4e75-979f-5c4d09921ed8','UC Berkeley','berkeley.edu','2026-07-09 02:50:01.810','2026-07-09 02:50:01.810'),('e2a1b3c4-d5e6-7890-abcd-ef1234567891','CSULB','csulb.edu','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000'),('e2a1b3c4-d5e6-7890-abcd-ef1234567892','University of the Pacific','pacific.edu','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000') ON CONFLICT DO NOTHING`);

    // Departments
    await prisma.$executeRawUnsafe(`INSERT INTO "departments" ("id","name","university_id","created_at","updated_at") VALUES ('f22e5e39-a1b1-4f8e-ae3e-2ca77dba2d36','Department of Physics','0b88ab6c-8878-4e54-82a4-cbf1f13edeab','2026-07-09 02:50:01.812','2026-07-09 02:50:01.812'),('49f0f28b-d816-4575-8ad2-b294c96835c1','Department of Chemical Engineering','23b09cef-4724-4aa6-b731-13c5672748e1','2026-07-09 02:50:01.813','2026-07-09 02:50:01.813'),('26a1c808-5306-45d1-b18b-ce38f598aab4','Department of Genetics','ac50ec87-4b34-4fbf-bbe9-5158410cc0d8','2026-07-09 02:50:01.813','2026-07-09 02:50:01.813'),('5c1a58ad-56fc-4000-b272-f09d1cc32655','Department of Electrical Engineering & Computer Sciences','f08be367-e8f9-4e75-979f-5c4d09921ed8','2026-07-09 02:50:01.814','2026-07-09 02:50:01.814'),('d1a2b3c4-e5f6-7890-abcd-ef1234567891','Computer Engineering & Computer Science (CECS)','e2a1b3c4-d5e6-7890-abcd-ef1234567891','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000'),('d1a2b3c4-e5f6-7890-abcd-ef1234567892','Department of Computer Science','e2a1b3c4-d5e6-7890-abcd-ef1234567892','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000') ON CONFLICT DO NOTHING`);

    // Professors
    await prisma.$executeRawUnsafe(`INSERT INTO "professors" ("id","name","title","university_id","department_id","public_profile_url","email","created_at","updated_at") VALUES ('145c0029-cf1c-470b-b618-e35553d42ad7','Dr. Sarah Chen','Associate Professor','0b88ab6c-8878-4e54-82a4-cbf1f13edeab','f22e5e39-a1b1-4f8e-ae3e-2ca77dba2d36','https://physics.mit.edu/faculty/sarah-chen/','schen@mit.edu','2026-07-09 02:50:01.815','2026-07-09 02:50:01.815'),('957a1458-6179-43c1-962a-994176ea1fdb','Dr. Zhenan Bao','Professor','23b09cef-4724-4aa6-b731-13c5672748e1','49f0f28b-d816-4575-8ad2-b294c96835c1','https://bao.stanford.edu/','zbao@stanford.edu','2026-07-09 02:50:01.816','2026-07-09 02:50:01.816'),('8d224312-8f2a-4666-b571-31bfa56eebd5','Dr. David R. Liu','Professor','ac50ec87-4b34-4fbf-bbe9-5158410cc0d8','26a1c808-5306-45d1-b18b-ce38f598aab4','https://liulab.genetics.harvard.edu/','dliu@harvard.edu','2026-07-09 02:50:01.817','2026-07-09 02:50:01.817'),('8fc2831a-bfed-4bb6-b9fe-abceb3d7b972','Dr. Claire Tomlin','Professor','f08be367-e8f9-4e75-979f-5c4d09921ed8','5c1a58ad-56fc-4000-b272-f09d1cc32655','https://eecs.berkeley.edu/~tomlin/','tomlin@eecs.berkeley.edu','2026-07-09 02:50:01.818','2026-07-09 02:50:01.818'),('p1a2b3c4-e5f6-7890-abcd-ef1234567891','Dr. Shabnam Sodagari','Associate Professor','e2a1b3c4-d5e6-7890-abcd-ef1234567891','d1a2b3c4-e5f6-7890-abcd-ef1234567891','https://www.csulb.edu/college-of-engineering/computer-engineering-computer-science','shabnam.sodagari@csulb.edu','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000'),('p1a2b3c4-e5f6-7890-abcd-ef1234567892','Dr. Michael Canniff','Associate Professor','e2a1b3c4-d5e6-7890-abcd-ef1234567892','d1a2b3c4-e5f6-7890-abcd-ef1234567892','https://www.pacific.edu/engineering-and-computer-science','mcanniff@pacific.edu','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000') ON CONFLICT DO NOTHING`);

    // Research Links
    await prisma.$executeRawUnsafe(`INSERT INTO "research_links" ("id","url","status","added_by_user_id","created_at","updated_at") VALUES ('dc0730fe-2de9-45e2-9a3e-5e66a9eaed24','https://news.mit.edu','PROCESSED','1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.826','2026-07-09 02:50:01.826'),('ad6e6f92-8db0-4975-9c63-b7d90285ab1b','https://engineering.stanford.edu','PROCESSED','1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.827','2026-07-09 02:50:01.827'),('1d859e04-2fee-44af-9da8-919d09fecc42','https://chemistry.harvard.edu','PROCESSED','1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.828','2026-07-09 02:50:01.828'),('d5f7336e-e264-4020-8031-bc18b057a634','https://eecs.berkeley.edu','PROCESSED','1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.829','2026-07-09 02:50:01.829'),('l1a2b3c4-e5f6-7890-abcd-ef1234567891','https://www.csulb.edu/college-of-engineering/computer-engineering-computer-science','PROCESSED','1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000'),('l1a2b3c4-e5f6-7890-abcd-ef1234567892','https://www.pacific.edu/engineering-and-computer-science','PROCESSED','1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000') ON CONFLICT DO NOTHING`);

    // Research Items
    await prisma.$executeRawUnsafe(`INSERT INTO "research_items" ("id","research_link_id","title","summary","significance","university_id","department_id","professor_id","publication_date","source_url","source_type","confidence_scores","missing_info_flags","is_verified","verified_by_user_id","created_at","updated_at") VALUES ('5ed1c2b1-b0ea-449d-aced-f9a37be3abce','dc0730fe-2de9-45e2-9a3e-5e66a9eaed24','Topological Qubit Stabilization via Engineered Phonon Interactions','A breakthrough in quantum computing stability: researchers developed a method to stabilize topological qubits using precisely engineered phonon interactions, achieving coherence times exceeding 10 milliseconds at near-room temperatures.','This could dramatically accelerate practical quantum computing by removing the need for extreme cooling, making quantum processors more accessible and commercially viable.','0b88ab6c-8878-4e54-82a4-cbf1f13edeab','f22e5e39-a1b1-4f8e-ae3e-2ca77dba2d36','145c0029-cf1c-470b-b618-e35553d42ad7','2026-04-15 00:00:00.000','https://news.mit.edu','university news','{"email":1,"title":1,"summary":1,"professor":1,"department":1,"university":1}','[]',true,'1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.830','2026-07-09 02:50:01.830') ON CONFLICT DO NOTHING`);

    await prisma.$executeRawUnsafe(`INSERT INTO "research_items" ("id","research_link_id","title","summary","significance","university_id","department_id","professor_id","publication_date","source_url","source_type","confidence_scores","missing_info_flags","is_verified","verified_by_user_id","created_at","updated_at") VALUES ('478561b7-7cfc-4b4f-baff-116fd1bf9ed6','ad6e6f92-8db0-4975-9c63-b7d90285ab1b','Self-Healing Conductive Polymers for Neural Interface Electrodes','Development of a new class of organic conductive polymers that mimic the mechanical elasticity and self-healing properties of human skin, allowing for long-term stable connection to neural pathways.','Current neural interfaces degrade due to mechanical mismatch with tissue; these flexible, self-healing electrodes could revolutionize neuro-prosthetics and brain-machine interfaces.','23b09cef-4724-4aa6-b731-13c5672748e1','49f0f28b-d816-4575-8ad2-b294c96835c1','957a1458-6179-43c1-962a-994176ea1fdb','2026-03-24 00:00:00.000','https://engineering.stanford.edu','lab page','{"email":1,"title":1,"summary":1,"professor":1,"department":1,"university":1}','[]',true,'1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.837','2026-07-09 02:50:01.837') ON CONFLICT DO NOTHING`);

    await prisma.$executeRawUnsafe(`INSERT INTO "research_items" ("id","research_link_id","title","summary","significance","university_id","department_id","professor_id","publication_date","source_url","source_type","confidence_scores","missing_info_flags","is_verified","verified_by_user_id","created_at","updated_at") VALUES ('3abd714c-910f-4ab1-bbaa-5f52d893c2f1','1d859e04-2fee-44af-9da8-919d09fecc42','Multiplexed Epigenome Editing for Neurodegenerative Disease Prevention','A study showing how multiplexed base editors can simultaneously silence multiple risk alleles associated with Alzheimer''s disease in human neurons without causing double-stranded DNA breaks.','Offers a potential therapeutic avenue to prevent late-onset Alzheimer''s by target gene suppression rather than active editing, reducing off-target risks.','ac50ec87-4b34-4fbf-bbe9-5158410cc0d8','26a1c808-5306-45d1-b18b-ce38f598aab4','8d224312-8f2a-4666-b571-31bfa56eebd5','2026-01-15 00:00:00.000','https://chemistry.harvard.edu','publication','{"email":1,"title":1,"summary":1,"professor":1,"department":1,"university":1}','[]',true,'1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.840','2026-07-09 02:50:01.840') ON CONFLICT DO NOTHING`);

    await prisma.$executeRawUnsafe(`INSERT INTO "research_items" ("id","research_link_id","title","summary","significance","university_id","department_id","professor_id","publication_date","source_url","source_type","confidence_scores","missing_info_flags","is_verified","verified_by_user_id","created_at","updated_at") VALUES ('44125f40-bced-459d-96b9-b1aa6f16f94f','d5f7336e-e264-4020-8031-bc18b057a634','Decentralized Machine Learning for Climate-Resilient Power Grids','A collaborative project to implement federated learning control models that dynamically reroute power in regional grids during extreme weather events to minimize blackout risks.','Provides grid operators with real-time adaptive strategies to withstand heatwaves and storms, protecting critical public infrastructure.','f08be367-e8f9-4e75-979f-5c4d09921ed8','5c1a58ad-56fc-4000-b272-f09d1cc32655','8fc2831a-bfed-4bb6-b9fe-abceb3d7b972','2026-06-08 00:00:00.000','https://eecs.berkeley.edu','grant','{"email":1,"title":1,"summary":1,"professor":1,"department":1,"university":1}','[]',true,'1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-09 02:50:01.844','2026-07-09 02:50:01.844') ON CONFLICT DO NOTHING`);

    await prisma.$executeRawUnsafe(`INSERT INTO "research_items" ("id","research_link_id","title","summary","significance","university_id","department_id","professor_id","publication_date","source_url","source_type","confidence_scores","missing_info_flags","is_verified","verified_by_user_id","created_at","updated_at") VALUES ('r1a2b3c4-e5f6-7890-abcd-ef1234567891','l1a2b3c4-e5f6-7890-abcd-ef1234567891','Deep Learning & Dynamic Spectrum Allocation for High-Density Urban 5G/6G Networks','CSULB researchers developed deep neural network classifiers to mitigate wireless RF interference and optimize spectrum sharing for emergency services and smart city devices in high-density urban environments.','Ensures reliable real-time communication channels for first responders and autonomous traffic sensors during network congestion.','e2a1b3c4-d5e6-7890-abcd-ef1234567891','d1a2b3c4-e5f6-7890-abcd-ef1234567891','p1a2b3c4-e5f6-7890-abcd-ef1234567891','2026-06-18 00:00:00.000','https://www.csulb.edu/college-of-engineering/computer-engineering-computer-science','publication','{"email":1,"title":1,"summary":1,"professor":1,"department":1,"university":1}','[]',true,'1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000') ON CONFLICT DO NOTHING`);

    await prisma.$executeRawUnsafe(`INSERT INTO "research_items" ("id","research_link_id","title","summary","significance","university_id","department_id","professor_id","publication_date","source_url","source_type","confidence_scores","missing_info_flags","is_verified","verified_by_user_id","created_at","updated_at") VALUES ('r1a2b3c4-e5f6-7890-abcd-ef1234567892','l1a2b3c4-e5f6-7890-abcd-ef1234567892','Low-Power Mesh IoT Sensor Nodes for Real-Time Agricultural Water Quality Monitoring','UOP engineering researchers designed self-powered electrochemical wireless sensors deployed across Central Valley farmland to monitor soil salinity, nitrate runoff, and irrigation efficiency.','Empowers local agricultural communities to optimize water conservation and prevent toxic fertilizer runoff into California waterways.','e2a1b3c4-d5e6-7890-abcd-ef1234567892','d1a2b3c4-e5f6-7890-abcd-ef1234567892','p1a2b3c4-e5f6-7890-abcd-ef1234567892','2026-07-02 00:00:00.000','https://www.pacific.edu/engineering-and-computer-science','grant','{"email":1,"title":1,"summary":1,"professor":1,"department":1,"university":1}','[]',true,'1495e6b2-35c1-4c93-99dd-2b2d6539a696','2026-07-31 20:00:00.000','2026-07-31 20:00:00.000') ON CONFLICT DO NOTHING`);

    // Topics
    await prisma.$executeRawUnsafe(`INSERT INTO "topics" ("id","name","created_at","updated_at") VALUES ('17314074-79a9-45dc-8e3d-ae0b254cf50e','Quantum Computing','2026-07-09 02:50:01.821','2026-07-09 02:50:01.821'),('dbbe224d-43c9-4aa7-bb5f-d84759ed9c2b','Materials Science','2026-07-09 02:50:01.822','2026-07-09 02:50:01.822'),('8b06dd2a-7070-4d0d-8644-d6ec7fe0c7f0','Nanotechnology','2026-07-09 02:50:01.822','2026-07-09 02:50:01.822'),('f4003c1b-af7d-45e6-9a56-d022a93a493f','Bioelectronics','2026-07-09 02:50:01.823','2026-07-09 02:50:01.823'),('5f3ff9d8-eb0a-4ad0-a6c5-1c6ddd7cf886','Neuroengineering','2026-07-09 02:50:01.823','2026-07-09 02:50:01.823'),('955d02d6-a179-486d-ba9b-c137617fce6e','Gene Editing','2026-07-09 02:50:01.824','2026-07-09 02:50:01.824'),('d4e8bb72-1908-49e1-bf27-1284c51fc9a4','Neuroscience','2026-07-09 02:50:01.824','2026-07-09 02:50:01.824'),('d96447ce-cff0-4c08-a476-86f497c64125','Biotechnology','2026-07-09 02:50:01.824','2026-07-09 02:50:01.824'),('c8f711d5-1683-4143-b439-5fa3cf77876b','Smart Grids','2026-07-09 02:50:01.825','2026-07-09 02:50:01.825'),('94a2770e-788b-491b-8241-853afc555d93','Artificial Intelligence','2026-07-09 02:50:01.825','2026-07-09 02:50:01.825'),('6d2351f8-6dff-4646-9e34-5f49548491ee','Climate Technology','2026-07-09 02:50:01.826','2026-07-09 02:50:01.826') ON CONFLICT DO NOTHING`);

    // Professor-Research Links
    await prisma.$executeRawUnsafe(`INSERT INTO "professor_research_links" ("professor_id","research_item_id") VALUES ('145c0029-cf1c-470b-b618-e35553d42ad7','5ed1c2b1-b0ea-449d-aced-f9a37be3abce'),('957a1458-6179-43c1-962a-994176ea1fdb','478561b7-7cfc-4b4f-baff-116fd1bf9ed6'),('8d224312-8f2a-4666-b571-31bfa56eebd5','3abd714c-910f-4ab1-bbaa-5f52d893c2f1'),('8fc2831a-bfed-4bb6-b9fe-abceb3d7b972','44125f40-bced-459d-96b9-b1aa6f16f94f') ON CONFLICT DO NOTHING`);

    // Research Item Topics
    await prisma.$executeRawUnsafe(`INSERT INTO "research_item_topics" ("research_item_id","topic_id") VALUES ('5ed1c2b1-b0ea-449d-aced-f9a37be3abce','17314074-79a9-45dc-8e3d-ae0b254cf50e'),('5ed1c2b1-b0ea-449d-aced-f9a37be3abce','dbbe224d-43c9-4aa7-bb5f-d84759ed9c2b'),('5ed1c2b1-b0ea-449d-aced-f9a37be3abce','8b06dd2a-7070-4d0d-8644-d6ec7fe0c7f0'),('478561b7-7cfc-4b4f-baff-116fd1bf9ed6','f4003c1b-af7d-45e6-9a56-d022a93a493f'),('478561b7-7cfc-4b4f-baff-116fd1bf9ed6','dbbe224d-43c9-4aa7-bb5f-d84759ed9c2b'),('478561b7-7cfc-4b4f-baff-116fd1bf9ed6','5f3ff9d8-eb0a-4ad0-a6c5-1c6ddd7cf886'),('3abd714c-910f-4ab1-bbaa-5f52d893c2f1','955d02d6-a179-486d-ba9b-c137617fce6e'),('3abd714c-910f-4ab1-bbaa-5f52d893c2f1','d4e8bb72-1908-49e1-bf27-1284c51fc9a4'),('3abd714c-910f-4ab1-bbaa-5f52d893c2f1','d96447ce-cff0-4c08-a476-86f497c64125'),('44125f40-bced-459d-96b9-b1aa6f16f94f','c8f711d5-1683-4143-b439-5fa3cf77876b'),('44125f40-bced-459d-96b9-b1aa6f16f94f','94a2770e-788b-491b-8241-853afc555d93'),('44125f40-bced-459d-96b9-b1aa6f16f94f','6d2351f8-6dff-4646-9e34-5f49548491ee') ON CONFLICT DO NOTHING`);
    
    results.push('Seed data inserted.');

    // Final count
    const finalCount = await prisma.university.count();
    
    return NextResponse.json({ 
      success: true, 
      steps: results,
      universityCount: finalCount
    });
  } catch (err: any) {
    console.error('DB setup error:', err);
    return NextResponse.json({ 
      success: false, 
      steps: results,
      error: err.message 
    }, { status: 500 });
  }
}

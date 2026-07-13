import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

const UNIVERSITIES = [
  'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'Caltech',
  'Princeton University', 'Yale University', 'Columbia University', 'Cornell University',
  'University of Chicago', 'University of Pennsylvania', 'Northwestern University',
  'Duke University', 'Johns Hopkins University', 'Carnegie Mellon University',
  'University of Michigan', 'Georgia Tech', 'University of Washington', 'UC San Diego',
  'UCLA', 'UT Austin', 'UIUC', 'University of Wisconsin', 'Purdue University',
  'University of Maryland', 'University of Minnesota', 'Ohio State University',
  'Penn State University', 'University of Florida', 'UNC Chapel Hill', 'USC',
  'Boston University', 'NYU', 'Brown University', 'Dartmouth College', 'Vanderbilt University'
];

const DEPARTMENTS = [
  'Department of Computer Science',
  'Department of Electrical Engineering',
  'Department of Bioengineering',
  'Department of Mechanical Engineering',
  'Department of Materials Science & Engineering',
  'Department of Physics',
  'Department of Chemistry',
  'Department of Biology',
  'Department of Genetics',
  'Department of Brain and Cognitive Sciences'
];

const TOPICS = [
  'Quantum Computing', 'Gene Editing', 'Climate Technology', 'Bioelectronics',
  'Artificial Intelligence', 'Materials Science', 'Cybersecurity', 'Robotics',
  'Neuroscience', 'Renewable Energy', 'Genomics', 'Nanotechnology',
  'Computational Biology', 'Space Systems', 'Nuclear Engineering', 'Sensors'
];

const FIRST_NAMES = [
  'Sarah', 'Michael', 'Emily', 'David', 'James', 'Jessica', 'John', 'Robert', 'Linda',
  'William', 'Elizabeth', 'Zhenan', 'Claire', 'Evelyn', 'Andrew', 'Richard', 'Thomas',
  'Charles', 'Christopher', 'Daniel', 'Matthew', 'Joseph', 'Donald', 'Paul', 'Mark',
  'George', 'Steven', 'Edward', 'Ken', 'David', 'Lisa', 'Karen', 'Nancy', 'Donna'
];

const LAST_NAMES = [
  'Chen', 'Bao', 'Liu', 'Tomlin', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
  'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor',
  'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez',
  'Lee', 'Gonzalez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen'
];

const PROJECT_TEMPLATES = [
  'Decentralized {Topic} for {Application}',
  'Scalable {Topic} systems in {Application}',
  'Multiplexed {Topic} algorithms for {Application}',
  'Flexible {Topic} interfaces for next-generation {Application}',
  'Self-healing {Topic} polymers for {Application}',
  'High-performance {Topic} tools for {Application}',
  'Neuromorphic {Topic} devices in {Application}',
  'Autonomous {Topic} frameworks for {Application}',
  'Cooperative {Topic} protocols in {Application}',
  'Bio-inspired {Topic} architecture for {Application}'
];

const APPLICATIONS = [
  'Climate-Resilient Power Grids',
  'Neurodegenerative Disease Prevention',
  'Neuro-Prosthetic Interfaces',
  'Quantum Cryptography Networks',
  'Targeted Drug Delivery Vehicles',
  'Scalable Deep Learning Infrastructures',
  'Autonomous Drone Swarms',
  'Wearable Health Trackers',
  'Deep Space Communications',
  'Efficient Thermal Management in EVs',
  'Precision Gene Editing',
  'Marine Ecosystem Monitoring',
  'Micro-Robotic Surgery Tools',
  'Carbon Capture & Storage Systems'
];

const EVIDENCE_TEMPLATES = [
  "Lab page says ''undergraduate research openings available for Fall 2026''.",
  "Active NSF grant (Award ID: {Id}) running from 2025 to 2028.",
  "Professor profile lists ongoing projects in {Topic} for student involvement.",
  "Lab website recently updated with active recruitment calls for research helpers.",
  "Active NIH project funding allocated through 2029.",
  "Page mentions ''recruiting motivated undergraduate assistants for laboratory placements''."
];

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

function runGeneration() {
  const targetCount = parseInt(process.argv[2], 10) || 100000;
  console.log(`Generating SQL script for ${targetCount} opportunities...`);

  const sqlFilePath = path.join(process.cwd(), 'import-data.sql');
  const writeStream = fs.createWriteStream(sqlFilePath);

  // Write transaction header and locks
  writeStream.write(`BEGIN;\n`);
  writeStream.write(`SET CONSTRAINTS ALL DEFERRED;\n\n`);
  writeStream.write(`TRUNCATE TABLE "universities" CASCADE;\n`);
  writeStream.write(`TRUNCATE TABLE "research_links" CASCADE;\n`);
  writeStream.write(`TRUNCATE TABLE "topics" CASCADE;\n\n`);

  // 1. Generate Universities
  const uniIdMap = new Map<string, string>();
  const uniSqlValues: string[] = [];
  for (const name of UNIVERSITIES) {
    const id = crypto.randomUUID();
    uniIdMap.set(name, id);
    const domain = `${name.toLowerCase().replace(/[^a-z]/g, '')}.edu`;
    uniSqlValues.push(`('${id}', '${escapeSql(name)}', '${domain}', NOW(), NOW())`);
  }
  writeStream.write(`INSERT INTO "universities" ("id", "name", "domain", "created_at", "updated_at") VALUES\n${uniSqlValues.join(',\n')}\nON CONFLICT (name) DO UPDATE SET updated_at = NOW();\n\n`);

  // 2. Generate Departments
  const deptIdMap = new Map<string, string[]>(); // uniName -> deptIds[]
  const deptSqlValues: string[] = [];
  for (const uniName of UNIVERSITIES) {
    const uniId = uniIdMap.get(uniName)!;
    const ids: string[] = [];
    for (const name of DEPARTMENTS) {
      const id = crypto.randomUUID();
      ids.push(id);
      deptSqlValues.push(`('${id}', '${escapeSql(name)}', '${uniId}', NOW(), NOW())`);
    }
    deptIdMap.set(uniName, ids);
  }
  writeStream.write(`INSERT INTO "departments" ("id", "name", "university_id", "created_at", "updated_at") VALUES\n${deptSqlValues.join(',\n')}\nON CONFLICT (name, university_id) DO UPDATE SET updated_at = NOW();\n\n`);

  // 3. Generate Topics
  const topicIdMap = new Map<string, string>();
  const topicSqlValues: string[] = [];
  for (const name of TOPICS) {
    const id = crypto.randomUUID();
    topicIdMap.set(name, id);
    topicSqlValues.push(`('${id}', '${escapeSql(name)}', NOW(), NOW())`);
  }
  writeStream.write(`INSERT INTO "topics" ("id", "name", "created_at", "updated_at") VALUES\n${topicSqlValues.join(',\n')}\nON CONFLICT (name) DO UPDATE SET updated_at = NOW();\n\n`);

  // 4. Generate 2,000 unique professors
  const profsList: Array<{ id: string; name: string; email: string; universityId: string; departmentId: string }> = [];
  const profUniqueKeys = new Set<string>();
  const profSqlValues: string[] = [];

  while (profsList.length < 2000) {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `Dr. ${first} ${last}`;
    const uniName = UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)];
    const uniId = uniIdMap.get(uniName)!;
    const depts = deptIdMap.get(uniName)!;
    const deptId = depts[Math.floor(Math.random() * depts.length)];

    const key = `${name} @ ${uniName}`;
    if (!profUniqueKeys.has(key)) {
      profUniqueKeys.add(key);
      const id = crypto.randomUUID();
      const email = `${first.toLowerCase()}.${last.toLowerCase()}@${uniName.toLowerCase().replace(/[^a-z]/g, '')}.edu`;
      
      profsList.push({ id, name, email, universityId: uniId, departmentId: deptId });
      profSqlValues.push(`('${id}', '${escapeSql(name)}', 'Professor', '${email}', 'https://faculty.edu/${first.toLowerCase()}-${last.toLowerCase()}', '${uniId}', '${deptId}', NOW(), NOW())`);
    }
  }
  writeStream.write(`INSERT INTO "professors" ("id", "name", "title", "email", "public_profile_url", "university_id", "department_id", "created_at", "updated_at") VALUES\n${profSqlValues.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`);

  // 5. Generate 100,000 Research Items in batches of 10,000
  console.log(`Writing research items and associations to dump.sql...`);
  
  let count = 0;
  const confidenceScoresJson = JSON.stringify({ title: 1.0, professor: 1.0, university: 1.0, summary: 1.0, email: 1.0 });

  while (count < targetCount) {
    const batchSize = Math.min(10000, targetCount - count);
    const linkValues: string[] = [];
    const itemValues: string[] = [];
    const topicLinkValues: string[] = [];
    const profLinkValues: string[] = [];

    for (let i = 0; i < batchSize; i++) {
      const linkId = crypto.randomUUID();
      const itemId = crypto.randomUUID();
      const randomProf = profsList[Math.floor(Math.random() * profsList.length)];
      
      const topicName = TOPICS[Math.floor(Math.random() * TOPICS.length)];
      const topicId = topicIdMap.get(topicName)!;

      const titleTemplate = PROJECT_TEMPLATES[Math.floor(Math.random() * PROJECT_TEMPLATES.length)];
      const app = APPLICATIONS[Math.floor(Math.random() * APPLICATIONS.length)];
      const title = titleTemplate.replace('{Topic}', topicName).replace('{Application}', app);
      
      const summary = `Active research group exploring advanced methodologies in ${topicName.toLowerCase()} and ${app.toLowerCase()}. We aim to implement robust modeling pipelines to investigate structural mechanisms and improve scalability.`;
      const significance = `This project targets critical bottlenecks in ${app.toLowerCase()}, laying structural groundwork for academic and public deployment.`;
      
      const sourceUrl = `https://labs.university.edu/projects/${crypto.randomBytes(6).toString('hex')}`;
      
      const evidenceTemplate = EVIDENCE_TEMPLATES[Math.floor(Math.random() * EVIDENCE_TEMPLATES.length)];
      const evidence = evidenceTemplate
        .replace('{Id}', Math.floor(Math.random() * 9000000 + 1000000).toString())
        .replace('{Topic}', topicName);

      const status = Math.random() > 0.15 ? 'ACTIVE' : 'POSSIBLY_ACTIVE';

      linkValues.push(`('${linkId}', '${sourceUrl}', 'PROCESSED', NOW(), NOW())`);
      
      itemValues.push(`('${itemId}', '${linkId}', '${escapeSql(title)}', '${escapeSql(summary)}', '${escapeSql(significance)}', '${randomProf.universityId}', '${randomProf.departmentId}', '${randomProf.id}', '${sourceUrl}', 'lab page', true, NULL, '${status}', '${escapeSql(evidence)}', NOW(), '${confidenceScoresJson}'::jsonb, '[]'::jsonb, NOW(), NOW())`);
      
      topicLinkValues.push(`('${itemId}', '${topicId}')`);
      
      profLinkValues.push(`('${randomProf.id}', '${itemId}')`);
    }

    // Write links
    writeStream.write(`INSERT INTO "research_links" ("id", "url", "status", "created_at", "updated_at") VALUES\n${linkValues.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`);
    
    // Write items
    writeStream.write(`INSERT INTO "research_items" ("id", "research_link_id", "title", "summary", "significance", "university_id", "department_id", "professor_id", "source_url", "source_type", "is_verified", "verified_by_user_id", "activity_status", "activity_evidence", "last_verified", "confidence_scores", "missing_info_flags", "created_at", "updated_at") VALUES\n${itemValues.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`);
    
    // Write topic relations
    writeStream.write(`INSERT INTO "research_item_topics" ("research_item_id", "topic_id") VALUES\n${topicLinkValues.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`);
    
    // Write professor relations
    writeStream.write(`INSERT INTO "professor_research_links" ("professor_id", "research_item_id") VALUES\n${profLinkValues.join(',\n')}\nON CONFLICT DO NOTHING;\n\n`);

    count += batchSize;
    console.log(`Wrote batch to SQL stream: ${count}/${targetCount}`);
  }

  writeStream.write(`COMMIT;\n`);
  writeStream.end(() => {
    console.log(`Finished writing SQL dump to ${sqlFilePath}. Ready to execute.`);
  });
}

runGeneration();

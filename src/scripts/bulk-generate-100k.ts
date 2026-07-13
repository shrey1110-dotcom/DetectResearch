import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

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

// Title generation templates
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
  "Lab page says 'undergraduate research openings available for Fall 2026'.",
  "Active NSF grant (Award ID: {Id}) running from 2025 to 2028.",
  "Professor profile lists ongoing projects in {Topic} for student involvement.",
  "Lab website recently updated with active recruitment calls for research helpers.",
  "Active NIH project funding allocated through 2029.",
  "Page mentions 'recruiting motivated undergraduate assistants for laboratory placements'."
];

async function generateData(totalCount: number) {
  console.log(`Generating ${totalCount} active research opportunities across ${UNIVERSITIES.length} universities...`);
  
  // 1. Create Universities and Departments in DB
  console.log('Inserting Universities and Departments...');
  const uniIds: string[] = [];
  const deptIdsMap = new Map<string, string[]>(); // uniId -> deptIds[]

  for (const uniName of UNIVERSITIES) {
    const uni = await prisma.university.upsert({
      where: { name: uniName },
      update: {},
      create: { name: uniName, domain: `${uniName.toLowerCase().replace(/[^a-z]/g, '')}.edu` }
    });
    uniIds.push(uni.id);

    const depts: string[] = [];
    for (const deptName of DEPARTMENTS) {
      const dept = await prisma.department.upsert({
        where: { name_universityId: { name: deptName, universityId: uni.id } },
        update: {},
        create: { name: deptName, universityId: uni.id }
      });
      depts.push(dept.id);
    }
    deptIdsMap.set(uni.id, depts);
  }

  // 2. Create Topics in DB
  console.log('Inserting Topics...');
  const topicIds: string[] = [];
  for (const topicName of TOPICS) {
    const topic = await prisma.topic.upsert({
      where: { name: topicName },
      update: {},
      create: { name: topicName }
    });
    topicIds.push(topic.id);
  }

  // 3. Generate 3,000 unique professors first to associate projects with
  console.log('Generating 3,000 Professors...');
  const profsList: any[] = [];
  const profUniqueKeys = new Set<string>();

  while (profsList.length < 3000) {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `Dr. ${first} ${last}`;
    const uniId = uniIds[Math.floor(Math.random() * uniIds.length)];
    const depts = deptIdsMap.get(uniId) || [];
    const deptId = depts[Math.floor(Math.random() * depts.length)];

    const key = `${name} @ ${uniId}`;
    if (!profUniqueKeys.has(key)) {
      profUniqueKeys.add(key);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}@${UNIVERSITIES.find((u, i) => uniIds[i] === uniId)?.toLowerCase().replace(/[^a-z]/g, '') || 'uni'}.edu`;
      profsList.push({
        id: crypto.randomUUID(),
        name,
        title: 'Professor',
        email,
        universityId: uniId,
        departmentId: deptId,
        publicProfileUrl: `https://faculty.university.edu/${first.toLowerCase()}-${last.toLowerCase()}`
      });
    }
  }

  // Insert professors in batches of 1000 to prevent timeouts
  console.log('Bulk inserting professors...');
  for (let i = 0; i < profsList.length; i += 1000) {
    const batch = profsList.slice(i, i + 1000);
    // Use manual insert to avoid duplicate constraints if run twice
    for (const prof of batch) {
      await prisma.professor.create({
        data: prof
      }).catch(() => {}); // ignore duplicates
    }
  }

  // Fetch db professors to get correct IDs
  const allProfs = await prisma.professor.findMany({ select: { id: true, universityId: true, departmentId: true } });

  // 4. Generate Research Projects in batches of 5000
  console.log(`Inserting ${totalCount} Research Opportunities...`);
  let createdCount = 0;
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const adminUserId = adminUser?.id || null;

  const batchSize = 5000;
  
  while (createdCount < totalCount) {
    const batchItems: any[] = [];
    const batchLinks: any[] = [];
    const batchLinkIds: string[] = [];
    
    const size = Math.min(batchSize, totalCount - createdCount);
    
    for (let k = 0; k < size; k++) {
      const linkId = crypto.randomUUID();
      const itemId = crypto.randomUUID();
      
      const randomProf = allProfs[Math.floor(Math.random() * allProfs.length)];
      const profId = randomProf.id;
      const uniId = randomProf.universityId;
      const deptId = randomProf.departmentId;

      const topicName = TOPICS[Math.floor(Math.random() * TOPICS.length)];
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

      batchLinks.push({
        id: linkId,
        url: sourceUrl,
        status: 'PROCESSED'
      });

      batchItems.push({
        id: itemId,
        researchLinkId: linkId,
        title,
        summary,
        significance,
        universityId: uniId,
        departmentId: deptId,
        professorId: profId,
        sourceUrl,
        sourceType: 'lab page',
        isVerified: Math.random() > 0.2, // 80% verified
        verifiedByUserId: adminUserId,
        activityStatus: status,
        activityEvidence: evidence,
        lastVerified: new Date(),
        confidenceScores: { title: 0.9, professor: 0.9, university: 1.0, summary: 0.8, email: 0.8 },
        missingInfoFlags: []
      });
      
      batchLinkIds.push(linkId);
    }

    // Insert links and items
    try {
      await prisma.researchLink.createMany({ data: batchLinks, skipDuplicates: true });
      await prisma.researchItem.createMany({ data: batchItems, skipDuplicates: true });

      // Create topic links and professor links in database
      const dbItems = await prisma.researchItem.findMany({
        where: { researchLinkId: { in: batchLinkIds } },
        select: { id: true, title: true, professorId: true }
      });

      const topicAssociations: any[] = [];
      const profAssociations: any[] = [];

      for (const item of dbItems) {
        // Map to a random topic
        const randomTopicId = topicIds[Math.floor(Math.random() * topicIds.length)];
        topicAssociations.push({
          researchItemId: item.id,
          topicId: randomTopicId
        });

        // Map prof association
        if (item.professorId) {
          profAssociations.push({
            professorId: item.professorId,
            researchItemId: item.id
          });
        }
      }

      await prisma.researchItemTopic.createMany({ data: topicAssociations, skipDuplicates: true });
      await prisma.professorResearchLink.createMany({ data: profAssociations, skipDuplicates: true });

      createdCount += size;
      console.log(`Generated batch: ${createdCount}/${totalCount} active records enqueued in DB.`);
    } catch (err: any) {
      console.error(`Failed to write batch: ${err.message}`);
    }
  }

  console.log(`\nBulk generation successfully completed! ${createdCount} active lab records inserted.`);
  process.exit(0);
}

const targetCount = parseInt(process.argv[2], 10) || 100000;
generateData(targetCount).catch(err => {
  console.error('Fatal generation error:', err);
  process.exit(1);
});

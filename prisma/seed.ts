import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean existing database
  await prisma.extractionLog.deleteMany({});
  await prisma.outreachDraft.deleteMany({});
  await prisma.savedResearch.deleteMany({});
  await prisma.researchItemTopic.deleteMany({});
  await prisma.professorResearchLink.deleteMany({});
  await prisma.researchItem.deleteMany({});
  await prisma.researchLink.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.professor.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.university.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // 2. Create Users
  const passwordHashAdmin = bcrypt.hashSync('admin123', 10);
  const passwordHashStudent = bcrypt.hashSync('student123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@researchlink.edu',
      name: 'Dr. Sarah Jenkins',
      passwordHash: passwordHashAdmin,
      role: 'ADMIN'
    }
  });

  await prisma.admin.create({
    data: {
      userId: adminUser.id
    }
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@researchlink.edu',
      name: 'Alex Morgan',
      passwordHash: passwordHashStudent,
      role: 'STUDENT'
    }
  });

  console.log('Users created: Admin (admin@researchlink.edu/admin123), Student (student@researchlink.edu/student123)');

  // 3. Create Universities
  const csulb = await prisma.university.create({ data: { name: 'CSULB', domain: 'csulb.edu' } });
  const uop = await prisma.university.create({ data: { name: 'University of the Pacific', domain: 'pacific.edu' } });
  const mit = await prisma.university.create({ data: { name: 'MIT', domain: 'mit.edu' } });
  const stanford = await prisma.university.create({ data: { name: 'Stanford University', domain: 'stanford.edu' } });
  const harvard = await prisma.university.create({ data: { name: 'Harvard University', domain: 'harvard.edu' } });
  const berkeley = await prisma.university.create({ data: { name: 'UC Berkeley', domain: 'berkeley.edu' } });

  console.log('Universities created (including CSULB and UOP).');

  // 4. Create Departments
  const csulbCECS = await prisma.department.create({
    data: { name: 'Computer Engineering & Computer Science (CECS)', universityId: csulb.id }
  });
  const csulbMAE = await prisma.department.create({
    data: { name: 'Mechanical & Aerospace Engineering', universityId: csulb.id }
  });

  const uopCS = await prisma.department.create({
    data: { name: 'Department of Computer Science', universityId: uop.id }
  });
  const uopBio = await prisma.department.create({
    data: { name: 'Department of Bioengineering', universityId: uop.id }
  });

  const mitMatSci = await prisma.department.create({
    data: { name: 'Materials Science and Engineering', universityId: mit.id }
  });
  const stanfordChemEng = await prisma.department.create({
    data: { name: 'Chemical Engineering', universityId: stanford.id }
  });
  const harvardChem = await prisma.department.create({
    data: { name: 'Chemistry and Chemical Biology', universityId: harvard.id }
  });
  const berkeleyEECS = await prisma.department.create({
    data: { name: 'Electrical Engineering and Computer Sciences', universityId: berkeley.id }
  });

  console.log('Departments created.');

  // 5. Create Professors
  const shabnamSodagari = await prisma.professor.create({
    data: {
      name: 'Shabnam Sodagari',
      title: 'Associate Professor of Computer Engineering & Computer Science',
      universityId: csulb.id,
      departmentId: csulbCECS.id,
      email: 'shabnam.sodagari@csulb.edu',
      publicProfileUrl: 'https://www.csulb.edu/college-of-engineering/computer-engineering-computer-science'
    }
  });

  const christopherDares = await prisma.professor.create({
    data: {
      name: 'Christopher Dares',
      title: 'Assistant Professor of Mechanical & Aerospace Engineering',
      universityId: csulb.id,
      departmentId: csulbMAE.id,
      email: 'christopher.dares@csulb.edu',
      publicProfileUrl: 'https://www.csulb.edu/college-of-engineering'
    }
  });

  const michaelCanniff = await prisma.professor.create({
    data: {
      name: 'Michael Canniff',
      title: 'Associate Professor of Computer Science',
      universityId: uop.id,
      departmentId: uopCS.id,
      email: 'mcanniff@pacific.edu',
      publicProfileUrl: 'https://www.pacific.edu/engineering-and-computer-science'
    }
  });

  const elizabethBasha = await prisma.professor.create({
    data: {
      name: 'Elizabeth Basha',
      title: 'Professor of Electrical & Bioengineering',
      universityId: uop.id,
      departmentId: uopBio.id,
      email: 'ebasha@pacific.edu',
      publicProfileUrl: 'https://www.pacific.edu/engineering-and-computer-science'
    }
  });

  const evelynChen = await prisma.professor.create({
    data: {
      name: 'Evelyn Chen',
      title: 'Professor of Materials Science',
      universityId: mit.id,
      departmentId: mitMatSci.id,
      email: 'echen@mit.edu',
      publicProfileUrl: 'https://dmse.mit.edu/people/evelyn-chen'
    }
  });

  const zhenanBao = await prisma.professor.create({
    data: {
      name: 'Zhenan Bao',
      title: 'Professor of Chemical Engineering',
      universityId: stanford.id,
      departmentId: stanfordChemEng.id,
      email: 'zbao@stanford.edu',
      publicProfileUrl: 'https://chemeng.stanford.edu/people/zhenan-bao'
    }
  });

  const davidLiu = await prisma.professor.create({
    data: {
      name: 'David Liu',
      title: 'Professor of Chemistry and Chemical Biology',
      universityId: harvard.id,
      departmentId: harvardChem.id,
      email: 'drliu@harvard.edu',
      publicProfileUrl: 'https://chemistry.harvard.edu/people/david-liu'
    }
  });

  const claireTomlin = await prisma.professor.create({
    data: {
      name: 'Claire Tomlin',
      title: 'Professor of Electrical Engineering and Computer Sciences',
      universityId: berkeley.id,
      departmentId: berkeleyEECS.id,
      email: 'tomlin@berkeley.edu',
      publicProfileUrl: 'https://eecs.berkeley.edu/people/claire-tomlin'
    }
  });

  console.log('Professors created (including CSULB & UOP faculty).');

  // 6. Create Topics
  const topicNames = [
    'Quantum Computing', 'Materials Science', 'Nanotechnology', 'Bioelectronics', 
    'Neuroengineering', 'Gene Editing', 'Neuroscience', 'Biotechnology', 
    'Smart Grids', 'Artificial Intelligence', 'Climate Technology', 'Robotics'
  ];
  const topicMap: Record<string, any> = {};
  for (const name of topicNames) {
    topicMap[name] = await prisma.topic.create({ data: { name } });
  }

  console.log('Topics created.');

  // 7. Seed CSULB Link 1 (Signal Intelligence / 5G)
  const linkCSULB1 = await prisma.researchLink.create({
    data: {
      url: 'https://www.csulb.edu/college-of-engineering/research/5g-wireless-signal-intelligence',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const itemCSULB1 = await prisma.researchItem.create({
    data: {
      researchLinkId: linkCSULB1.id,
      title: 'Deep Learning & Dynamic Spectrum Allocation for High-Density Urban 5G/6G Networks',
      summary: 'CSULB researchers developed deep neural network classifiers to mitigate wireless RF interference and optimize spectrum sharing for emergency services and smart city devices in high-density urban environments.',
      significance: 'Ensures reliable real-time communication channels for first responders and autonomous traffic sensors during network congestion.',
      universityId: csulb.id,
      departmentId: csulbCECS.id,
      professorId: shabnamSodagari.id,
      publicationDate: new Date('2026-06-18'),
      sourceUrl: linkCSULB1.url,
      sourceType: 'publication',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: itemCSULB1.id, topicId: topicMap['Artificial Intelligence'].id },
      { researchItemId: itemCSULB1.id, topicId: topicMap['Smart Grids'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: shabnamSodagari.id, researchItemId: itemCSULB1.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: linkCSULB1.id, stepName: 'ENQUEUE', status: 'INFO', message: 'CSULB link added to queue.' },
      { researchLinkId: linkCSULB1.id, stepName: 'FETCHING', status: 'INFO', message: 'Fetched CSULB CECS research webpage.' },
      { researchLinkId: linkCSULB1.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Successfully extracted CSULB research profile.' }
    ]
  });

  // 8. Seed CSULB Link 2 (Autonomous Drone Navigation)
  const linkCSULB2 = await prisma.researchLink.create({
    data: {
      url: 'https://www.csulb.edu/college-of-engineering/research/autonomous-drone-swarms',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const itemCSULB2 = await prisma.researchItem.create({
    data: {
      researchLinkId: linkCSULB2.id,
      title: 'Decentralized Vision SLAM for Autonomous Drone Swarms in Coastal Search & Rescue',
      summary: 'A project focused on computer vision-guided path planning for micro-UAV swarms conducting maritime search and rescue operations off Southern California shores without GPS connectivity.',
      significance: 'Significantly improves search coverage and rescue response times during ocean emergencies when satellite signals fail.',
      universityId: csulb.id,
      departmentId: csulbMAE.id,
      professorId: christopherDares.id,
      publicationDate: new Date('2026-05-28'),
      sourceUrl: linkCSULB2.url,
      sourceType: 'lab page',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: itemCSULB2.id, topicId: topicMap['Robotics'].id },
      { researchItemId: itemCSULB2.id, topicId: topicMap['Artificial Intelligence'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: christopherDares.id, researchItemId: itemCSULB2.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: linkCSULB2.id, stepName: 'ENQUEUE', status: 'INFO', message: 'CSULB drone research enqueued.' },
      { researchLinkId: linkCSULB2.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Extracted CSULB aerospace drone research.' }
    ]
  });

  // 9. Seed UOP Link 1 (Agricultural IoT Sensors)
  const linkUOP1 = await prisma.researchLink.create({
    data: {
      url: 'https://www.pacific.edu/engineering-and-computer-science/research/agricultural-iot-sensors',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const itemUOP1 = await prisma.researchItem.create({
    data: {
      researchLinkId: linkUOP1.id,
      title: 'Low-Power Mesh IoT Sensor Nodes for Real-Time Agricultural Water Quality Monitoring',
      summary: 'UOP engineering researchers designed self-powered electrochemical wireless sensors deployed across Central Valley farmland to monitor soil salinity, nitrate runoff, and irrigation efficiency.',
      significance: 'Empowers local agricultural communities to optimize water conservation and prevent toxic fertilizer runoff into California waterways.',
      universityId: uop.id,
      departmentId: uopCS.id,
      professorId: michaelCanniff.id,
      publicationDate: new Date('2026-07-02'),
      sourceUrl: linkUOP1.url,
      sourceType: 'grant',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: itemUOP1.id, topicId: topicMap['Climate Technology'].id },
      { researchItemId: itemUOP1.id, topicId: topicMap['Smart Grids'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: michaelCanniff.id, researchItemId: itemUOP1.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: linkUOP1.id, stepName: 'ENQUEUE', status: 'INFO', message: 'UOP link enqueued.' },
      { researchLinkId: linkUOP1.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Saved UOP agricultural IoT project.' }
    ]
  });

  // 10. Seed UOP Link 2 (Microfluidic Pathogen Detection)
  const linkUOP2 = await prisma.researchLink.create({
    data: {
      url: 'https://www.pacific.edu/engineering-and-computer-science/research/microfluidic-biosensors',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const itemUOP2 = await prisma.researchItem.create({
    data: {
      researchLinkId: linkUOP2.id,
      title: 'Handheld Microfluidic Lab-on-a-Chip Biosensors for Rapid Point-of-Care Pathogen Diagnostics',
      summary: 'Engineers at University of the Pacific developed portable microfluidic cartridges with integrated neural network optical classifiers to detect bacterial biomarkers in patient blood samples within 15 minutes.',
      significance: 'Accelerates clinical diagnostic speed in rural healthcare facilities, enabling fast targeted antibiotic administration.',
      universityId: uop.id,
      departmentId: uopBio.id,
      professorId: elizabethBasha.id,
      publicationDate: new Date('2026-06-25'),
      sourceUrl: linkUOP2.url,
      sourceType: 'university news',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: itemUOP2.id, topicId: topicMap['Biotechnology'].id },
      { researchItemId: itemUOP2.id, topicId: topicMap['Bioelectronics'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: elizabethBasha.id, researchItemId: itemUOP2.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: linkUOP2.id, stepName: 'ENQUEUE', status: 'INFO', message: 'UOP biosensor link enqueued.' },
      { researchLinkId: linkUOP2.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Saved UOP bioengineering research.' }
    ]
  });

  // Seed baseline MIT, Stanford, Harvard, Berkeley items
  const link1 = await prisma.researchLink.create({
    data: {
      url: 'https://news.mit.edu/2026/quantum-coherence-materials-0512',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const item1 = await prisma.researchItem.create({
    data: {
      researchLinkId: link1.id,
      title: 'Achieving Room Temperature Quantum Coherence in 2D Halide Perovskites',
      summary: 'Researchers have successfully demonstrated quantum coherence at room temperature in layered 2D halide perovskite materials, paving the way for scalable quantum memories and sensors without cryogenic cooling.',
      significance: 'This breakthrough could democratize quantum technology by eliminating liquid-helium refrigeration systems.',
      universityId: mit.id,
      departmentId: mitMatSci.id,
      professorId: evelynChen.id,
      publicationDate: new Date('2026-05-12'),
      sourceUrl: link1.url,
      sourceType: 'university news',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: item1.id, topicId: topicMap['Quantum Computing'].id },
      { researchItemId: item1.id, topicId: topicMap['Materials Science'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: evelynChen.id, researchItemId: item1.id }
  });

  const link2 = await prisma.researchLink.create({
    data: {
      url: 'https://stanford.edu/lab/bao-group/flexible-organic-electronics',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const item2 = await prisma.researchItem.create({
    data: {
      researchLinkId: link2.id,
      title: 'Self-Healing Skin-Like Electrodes for Neuro-Prosthetic Interfaces',
      summary: 'Development of a new class of organic conductive polymers that mimic mechanical elasticity and self-healing properties of human skin for long-term stable connection to neural pathways.',
      significance: 'Revolutionizes neuro-prosthetics by providing flexible, tissue-compatible neural interfaces.',
      universityId: stanford.id,
      departmentId: stanfordChemEng.id,
      professorId: zhenanBao.id,
      publicationDate: new Date('2026-03-24'),
      sourceUrl: link2.url,
      sourceType: 'lab page',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: item2.id, topicId: topicMap['Bioelectronics'].id },
      { researchItemId: item2.id, topicId: topicMap['Neuroengineering'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: zhenanBao.id, researchItemId: item2.id }
  });

  console.log('All research links (including CSULB & UOP) seeded and processed successfully.');
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

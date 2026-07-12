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
  const mit = await prisma.university.create({ data: { name: 'MIT', domain: 'mit.edu' } });
  const stanford = await prisma.university.create({ data: { name: 'Stanford University', domain: 'stanford.edu' } });
  const harvard = await prisma.university.create({ data: { name: 'Harvard University', domain: 'harvard.edu' } });
  const berkeley = await prisma.university.create({ data: { name: 'UC Berkeley', domain: 'berkeley.edu' } });

  console.log('Universities created.');

  // 4. Create Departments
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

  console.log('Professors created.');

  // 6. Create Topics
  const topicNames = ['Quantum Computing', 'Materials Science', 'Nanotechnology', 'Bioelectronics', 'Neuroengineering', 'Gene Editing', 'Neuroscience', 'Biotechnology', 'Smart Grids', 'Artificial Intelligence', 'Climate Technology'];
  const topicMap: Record<string, any> = {};
  for (const name of topicNames) {
    topicMap[name] = await prisma.topic.create({ data: { name } });
  }

  console.log('Topics created.');

  // 7. Seed Link 1 (MIT Quantum)
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
      summary: 'Researchers have successfully demonstrated quantum coherence at room temperature in layered 2D halide perovskite materials, paving the way for scalable quantum memories and sensors without the need for extreme cryogenic cooling.',
      significance: 'This breakthrough could democratize quantum technology by eliminating the cost and complexity of liquid-helium refrigeration systems.',
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
      { researchItemId: item1.id, topicId: topicMap['Materials Science'].id },
      { researchItemId: item1.id, topicId: topicMap['Nanotechnology'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: evelynChen.id, researchItemId: item1.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: link1.id, stepName: 'ENQUEUE', status: 'INFO', message: 'Link added to the processing queue.' },
      { researchLinkId: link1.id, stepName: 'FETCHING', status: 'INFO', message: 'Started fetching and parsing page.' },
      { researchLinkId: link1.id, stepName: 'EXTRACTING', status: 'INFO', message: 'HTML parsed successfully. Extracted details.' },
      { researchLinkId: link1.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Successfully extracted and saved research profile.' }
    ]
  });

  // Seed Link 2 (Stanford Bioelectronics)
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
      summary: 'Development of a new class of organic conductive polymers that mimic the mechanical elasticity and self-healing properties of human skin, allowing for long-term stable connection to neural pathways.',
      significance: 'Current neural interfaces degrade due to mechanical mismatch with tissue; these flexible, self-healing electrodes could revolutionize neuro-prosthetics and brain-machine interfaces.',
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
      { researchItemId: item2.id, topicId: topicMap['Materials Science'].id },
      { researchItemId: item2.id, topicId: topicMap['Neuroengineering'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: zhenanBao.id, researchItemId: item2.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: link2.id, stepName: 'ENQUEUE', status: 'INFO', message: 'Link added to the processing queue.' },
      { researchLinkId: link2.id, stepName: 'FETCHING', status: 'INFO', message: 'Started fetching and parsing page.' },
      { researchLinkId: link2.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Successfully extracted and saved research profile.' }
    ]
  });

  // Seed Link 3 (Harvard CRISPR)
  const link3 = await prisma.researchLink.create({
    data: {
      url: 'https://www.nature.com/articles/s41587-026-crispr-epigenome',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const item3 = await prisma.researchItem.create({
    data: {
      researchLinkId: link3.id,
      title: 'Multiplexed Epigenome Editing for Neurodegenerative Disease Prevention',
      summary: 'A study showing how multiplexed base editors can simultaneously silence multiple risk alleles associated with Alzheimer\'s disease in human neurons without causing double-stranded DNA breaks.',
      significance: 'Offers a potential therapeutic avenue to prevent late-onset Alzheimer\'s by target gene suppression rather than active editing, reducing off-target risks.',
      universityId: harvard.id,
      departmentId: harvardChem.id,
      professorId: davidLiu.id,
      publicationDate: new Date('2026-01-15'),
      sourceUrl: link3.url,
      sourceType: 'publication',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: item3.id, topicId: topicMap['Gene Editing'].id },
      { researchItemId: item3.id, topicId: topicMap['Neuroscience'].id },
      { researchItemId: item3.id, topicId: topicMap['Biotechnology'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: davidLiu.id, researchItemId: item3.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: link3.id, stepName: 'ENQUEUE', status: 'INFO', message: 'Link added to the processing queue.' },
      { researchLinkId: link3.id, stepName: 'FETCHING', status: 'INFO', message: 'Started fetching and parsing page.' },
      { researchLinkId: link3.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Successfully extracted and saved research profile.' }
    ]
  });

  // Seed Link 4 (Berkeley Climate Grid)
  const link4 = await prisma.researchLink.create({
    data: {
      url: 'https://berkeley.edu/grants/nsf-climate-resilient-grid-2026',
      status: 'PROCESSED',
      addedByUserId: adminUser.id
    }
  });

  const item4 = await prisma.researchItem.create({
    data: {
      researchLinkId: link4.id,
      title: 'Decentralized Machine Learning for Climate-Resilient Power Grids',
      summary: 'A collaborative project to implement federated learning control models that dynamically reroute power in regional grids during extreme weather events to minimize blackout risks.',
      significance: 'Provides grid operators with real-time adaptive strategies to withstand heatwaves and storms, protecting critical public infrastructure.',
      universityId: berkeley.id,
      departmentId: berkeleyEECS.id,
      professorId: claireTomlin.id,
      publicationDate: new Date('2026-06-08'),
      sourceUrl: link4.url,
      sourceType: 'grant',
      isVerified: true,
      verifiedByUserId: adminUser.id,
      confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
      missingInfoFlags: []
    }
  });

  await prisma.researchItemTopic.createMany({
    data: [
      { researchItemId: item4.id, topicId: topicMap['Smart Grids'].id },
      { researchItemId: item4.id, topicId: topicMap['Artificial Intelligence'].id },
      { researchItemId: item4.id, topicId: topicMap['Climate Technology'].id }
    ]
  });

  await prisma.professorResearchLink.create({
    data: { professorId: claireTomlin.id, researchItemId: item4.id }
  });

  await prisma.extractionLog.createMany({
    data: [
      { researchLinkId: link4.id, stepName: 'ENQUEUE', status: 'INFO', message: 'Link added to the processing queue.' },
      { researchLinkId: link4.id, stepName: 'FETCHING', status: 'INFO', message: 'Started fetching and parsing page.' },
      { researchLinkId: link4.id, stepName: 'SAVING', status: 'SUCCESS', message: 'Successfully extracted and saved research profile.' }
    ]
  });

  console.log('Four main research links seeded and processed successfully.');
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

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('Start seeding from API...');

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

    // 3. Create Universities
    const csulb = await prisma.university.create({ data: { name: 'CSULB', domain: 'csulb.edu' } });
    const uop = await prisma.university.create({ data: { name: 'University of the Pacific', domain: 'pacific.edu' } });
    const mit = await prisma.university.create({ data: { name: 'MIT', domain: 'mit.edu' } });
    const stanford = await prisma.university.create({ data: { name: 'Stanford University', domain: 'stanford.edu' } });
    const harvard = await prisma.university.create({ data: { name: 'Harvard University', domain: 'harvard.edu' } });
    const berkeley = await prisma.university.create({ data: { name: 'UC Berkeley', domain: 'berkeley.edu' } });

    // 4. Create Departments
    const csulbCECS = await prisma.department.create({ data: { name: 'Computer Engineering & Computer Science (CECS)', universityId: csulb.id } });
    const csulbMAE = await prisma.department.create({ data: { name: 'Mechanical & Aerospace Engineering', universityId: csulb.id } });

    const uopCS = await prisma.department.create({ data: { name: 'Department of Computer Science', universityId: uop.id } });
    const uopBio = await prisma.department.create({ data: { name: 'Department of Bioengineering', universityId: uop.id } });

    const mitMatSci = await prisma.department.create({ data: { name: 'Materials Science and Engineering', universityId: mit.id } });
    const stanfordChemEng = await prisma.department.create({ data: { name: 'Chemical Engineering', universityId: stanford.id } });
    const harvardChem = await prisma.department.create({ data: { name: 'Chemistry and Chemical Biology', universityId: harvard.id } });
    const berkeleyEECS = await prisma.department.create({ data: { name: 'Electrical Engineering and Computer Sciences', universityId: berkeley.id } });

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
        publicProfileUrl: 'https://www.pacific.edu/engineering-and-computer-science/academics/computer-science'
      }
    });

    const evelynChen = await prisma.professor.create({
      data: {
        name: 'Evelyn Chen',
        title: 'Professor of Materials Science',
        universityId: mit.id,
        departmentId: mitMatSci.id,
        email: 'echen@mit.edu',
        publicProfileUrl: 'https://dmse.mit.edu'
      }
    });

    const zhenanBao = await prisma.professor.create({
      data: {
        name: 'Zhenan Bao',
        title: 'Professor of Chemical Engineering',
        universityId: stanford.id,
        departmentId: stanfordChemEng.id,
        email: 'zbao@stanford.edu',
        publicProfileUrl: 'https://bao.stanford.edu'
      }
    });

    const davidLiu = await prisma.professor.create({
      data: {
        name: 'David Liu',
        title: 'Professor of Chemistry and Chemical Biology',
        universityId: harvard.id,
        departmentId: harvardChem.id,
        email: 'drliu@harvard.edu',
        publicProfileUrl: 'https://chemistry.harvard.edu'
      }
    });

    const claireTomlin = await prisma.professor.create({
      data: {
        name: 'Claire Tomlin',
        title: 'Professor of Electrical Engineering and Computer Sciences',
        universityId: berkeley.id,
        departmentId: berkeleyEECS.id,
        email: 'tomlin@berkeley.edu',
        publicProfileUrl: 'https://eecs.berkeley.edu'
      }
    });

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

    // 7. Seed CSULB Link 1
    const linkCSULB1 = await prisma.researchLink.create({
      data: {
        url: 'https://www.csulb.edu/college-of-engineering/research/5g-deep-learning',
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
        sourceUrl: 'https://www.csulb.edu/college-of-engineering/research/5g-deep-learning',
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

    // 8. Seed CSULB Link 2
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
        sourceUrl: 'https://www.csulb.edu/college-of-engineering/research/autonomous-drone-swarms',
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

    // 9. Seed UOP Link 1
    const linkUOP1 = await prisma.researchLink.create({
      data: {
        url: 'https://www.pacific.edu/engineering/research/iot-water-quality',
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
        sourceUrl: 'https://www.pacific.edu/engineering/research/iot-water-quality',
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

    // 10. Seed UOP Link 2
    const linkUOP2 = await prisma.researchLink.create({
      data: {
        url: 'https://www.pacific.edu/engineering/research/microfluidic-pathogen-detection',
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
        sourceUrl: 'https://www.pacific.edu/engineering/research/microfluidic-pathogen-detection',
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

    // 11. Seed UOP Link 3
    const linkUOP3 = await prisma.researchLink.create({
      data: {
        url: 'https://www.pacific.edu/engineering/research/neuromorphic-computing-prosthetics',
        status: 'PROCESSED',
        addedByUserId: adminUser.id
      }
    });

    const itemUOP3 = await prisma.researchItem.create({
      data: {
        researchLinkId: linkUOP3.id,
        title: 'Neuromorphic Computing Architectures for Real-Time Control of Robotic Prosthetics',
        summary: 'UOP researchers are developing novel neuromorphic chip architectures designed to mimic the brain\'s neural pathways, enabling ultra-low latency control and sensory feedback for advanced robotic prosthetic limbs.',
        significance: 'Provides amputees with natural, instantaneous limb control and restores sensory perception without the high computational overhead of traditional processors.',
        universityId: uop.id,
        departmentId: uopCS.id,
        professorId: michaelCanniff.id,
        publicationDate: new Date('2026-08-01'),
        sourceUrl: 'https://www.pacific.edu/engineering/research/neuromorphic-computing-prosthetics',
        sourceType: 'lab page',
        isVerified: true,
        verifiedByUserId: adminUser.id,
        confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, department: 1.0, summary: 1.0, email: 1.0 },
        missingInfoFlags: []
      }
    });

    await prisma.researchItemTopic.createMany({
      data: [
        { researchItemId: itemUOP3.id, topicId: topicMap['Neuroengineering'].id },
        { researchItemId: itemUOP3.id, topicId: topicMap['Robotics'].id },
        { researchItemId: itemUOP3.id, topicId: topicMap['Artificial Intelligence'].id }
      ]
    });

    await prisma.professorResearchLink.create({
      data: { professorId: michaelCanniff.id, researchItemId: itemUOP3.id }
    });

    // MIT
    const link1 = await prisma.researchLink.create({
      data: {
        url: 'https://news.mit.edu/quantum-coherence-materials',
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
        sourceUrl: 'https://news.mit.edu/quantum-coherence-materials',
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

    // Stanford
    const link2 = await prisma.researchLink.create({
      data: {
        url: 'https://bao.stanford.edu/research/flexible-organic-electronics',
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
        sourceUrl: 'https://bao.stanford.edu/research/flexible-organic-electronics',
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

    return NextResponse.json({ message: 'Seed complete' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

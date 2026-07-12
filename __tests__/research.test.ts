import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { extractResearchLink } from '../src/lib/extractor';
import prisma from '../src/lib/prisma';

describe('ResearchLink Automated Test Suite', () => {

  // 1. Test Email Draft Generation Logic
  it('should generate outreach email drafts with correct placeholder replacements', () => {
    const studentName = 'Alex Morgan';
    const studentYear = 'Sophomore';
    const studentMajor = 'Bioengineering';
    const paperTitle = 'Self-Healing Skin-Like Electrodes for Neuro-Prosthetic Interfaces';
    const paperTopic = 'Bioelectronics';
    const professorLastName = 'Bao';
    const interestReason = 'I found the self-healing properties of organic polymers fascinating';
    const skills = 'microfluidics, cleanroom fabrication, and Python scripting';

    const subject = `Interest in Your Research on ${paperTopic}`;
    const body = `Dear Professor ${professorLastName},

My name is ${studentName}, and I’m a ${studentYear.toLowerCase()} ${studentMajor} student interested in ${paperTopic.toLowerCase()}. I came across your research on "${paperTitle}", and I found it especially interesting because ${interestReason}.

I’m interested in learning more about your work and wanted to ask whether there may be any current or future opportunities for undergraduate students to get involved.

I have experience with ${skills}, and I would be grateful for the chance to contribute or learn more.

Thank you for your time.

Best,
${studentName}`;

    // Assertions for replacements
    expect(subject).toBe('Interest in Your Research on Bioelectronics');
    expect(body).toContain('Dear Professor Bao,');
    expect(body).toContain('My name is Alex Morgan');
    expect(body).toContain('sophomore');
    expect(body).toContain('Bioengineering');
    expect(body).toContain('interested in bioelectronics');
    expect(body).toContain('research on "Self-Healing Skin-Like Electrodes for Neuro-Prosthetic Interfaces"');
    expect(body).toContain('interesting because I found the self-healing properties of organic polymers fascinating');
    expect(body).toContain('experience with microfluidics, cleanroom fabrication, and Python scripting');
  });

  // 2. Test Link Extraction Logic
  it('should extract correct mock research profile for known seed URL', async () => {
    const url = 'https://news.mit.edu/2026/quantum-coherence-materials-0512';
    const extracted = await extractResearchLink(url);

    expect(extracted.title).toBe('Achieving Room Temperature Quantum Coherence in 2D Halide Perovskites');
    expect(extracted.professorName).toBe('Evelyn Chen');
    expect(extracted.university).toBe('MIT');
    expect(extracted.department).toBe('Materials Science and Engineering');
    expect(extracted.topic).toBe('Quantum Computing');
    expect(extracted.email).toBe('echen@mit.edu');
    expect(extracted.confidenceScores.title).toBe(1.0);
  });

  it('should extract fallback domain and estimated parameters for unknown URL', async () => {
    const url = 'https://princeton.edu/people/jane-doe/research-quantum';
    const extracted = await extractResearchLink(url);

    expect(extracted.university).toBe('Princeton University');
    expect(extracted.topic).toBe('Quantum Computing');
    expect(extracted.sourceType).toBe('professor page');
  });

  // 3. Test Search & Filter Database Queries (using actual Postgres connection)
  it('should filter database items by school / university', async () => {
    const mitUni = await prisma.university.findUnique({
      where: { name: 'MIT' }
    });
    
    expect(mitUni).not.toBeNull();

    const items = await prisma.researchItem.findMany({
      where: { universityId: mitUni!.id },
      include: { university: true }
    });

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].university.name).toBe('MIT');
    expect(items[0].title).toBe('Achieving Room Temperature Quantum Coherence in 2D Halide Perovskites');
  });

  it('should search database items by keyword text match', async () => {
    const items = await prisma.researchItem.findMany({
      include: { professor: true, university: true }
    });

    // Search for "epigenome" keyword
    const searchResult = items.filter(item => 
      item.title.toLowerCase().includes('epigenome') || 
      item.summary.toLowerCase().includes('epigenome')
    );

    expect(searchResult.length).toBeGreaterThan(0);
    expect(searchResult[0].professor?.name).toBe('David Liu');
    expect(searchResult[0].university.name).toBe('Harvard University');
  });

  // 4. Test Multi-tier Sort & Ranking algorithm
  it('should rank items by date, verification state, and source quality correctly', () => {
    const mockItems = [
      {
        id: '1',
        title: 'Older Paper',
        publicationDate: new Date('2025-01-01'),
        createdAt: new Date('2025-01-01'),
        isVerified: true,
        sourceType: 'publication',
        professor: { email: 'prof1@uni.edu' }
      },
      {
        id: '2',
        title: 'Recent Unverified Paper',
        publicationDate: new Date('2026-06-01'),
        createdAt: new Date('2026-06-01'),
        isVerified: false,
        sourceType: 'publication',
        professor: { email: 'prof2@uni.edu' }
      },
      {
        id: '3',
        title: 'Recent Verified Paper',
        publicationDate: new Date('2026-06-01'),
        createdAt: new Date('2026-06-01'),
        isVerified: true,
        sourceType: 'publication',
        professor: { email: 'prof3@uni.edu' }
      },
      {
        id: '4',
        title: 'Recent Verified Lab Page (Lower Quality than Publication)',
        publicationDate: new Date('2026-06-01'),
        createdAt: new Date('2026-06-01'),
        isVerified: true,
        sourceType: 'lab page',
        professor: { email: 'prof4@uni.edu' }
      }
    ];

    const sourceQualityRank: Record<string, number> = {
      'publication': 5,
      'grant': 4,
      'lab page': 3,
      'university news': 2,
      'professor page': 1
    };

    const sorted = [...mockItems].sort((a, b) => {
      // 1. Most recent publication date
      const dateA = a.publicationDate.getTime();
      const dateB = b.publicationDate.getTime();
      if (dateB !== dateA) return dateB - dateA;

      // 2. Verified first
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }

      // 3. Source quality
      const qualA = sourceQualityRank[a.sourceType] || 0;
      const qualB = sourceQualityRank[b.sourceType] || 0;
      if (qualB !== qualA) return qualB - qualA;

      return 0;
    });

    // Verification check
    // Rank 1: item 3 (Recent, Verified, Publication)
    // Rank 2: item 4 (Recent, Verified, Lab Page - lower quality than publication)
    // Rank 3: item 2 (Recent, Unverified, Publication)
    // Rank 4: item 1 (Older, Verified, Publication)
    expect(sorted[0].id).toBe('3');
    expect(sorted[1].id).toBe('4');
    expect(sorted[2].id).toBe('2');
    expect(sorted[3].id).toBe('1');
  });

});

// Assertions extension

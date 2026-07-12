import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const universityId = searchParams.get('universityId') || '';
    const departmentId = searchParams.get('departmentId') || '';
    const topic = searchParams.get('topic') || '';
    const professor = searchParams.get('professor') || '';
    const sourceType = searchParams.get('sourceType') || '';
    const dateStart = searchParams.get('dateStart') || '';
    const dateEnd = searchParams.get('dateEnd') || '';

    // Build Prisma query filters
    const where: any = {};

    // Apply specific filters
    if (universityId) {
      where.universityId = universityId;
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (sourceType) {
      where.sourceType = sourceType;
    }
    if (dateStart || dateEnd) {
      where.publicationDate = {};
      if (dateStart) {
        where.publicationDate.gte = new Date(dateStart);
      }
      if (dateEnd) {
        where.publicationDate.lte = new Date(dateEnd);
      }
    }

    if (topic) {
      where.topics = {
        some: {
          topic: {
            name: {
              equals: topic,
              mode: 'insensitive'
            }
          }
        }
      };
    }

    // Fetch all matched research items
    let items = await prisma.researchItem.findMany({
      where,
      include: {
        university: true,
        department: true,
        professor: true,
        topics: {
          include: { topic: true }
        }
      }
    });

    // Apply keyword search in memory for robust multi-field matches
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(q);
        const summaryMatch = item.summary.toLowerCase().includes(q);
        const sigMatch = item.significance?.toLowerCase().includes(q) || false;
        const profMatch = item.professor?.name.toLowerCase().includes(q) || false;
        const uniMatch = item.university.name.toLowerCase().includes(q);
        const deptMatch = item.department?.name.toLowerCase().includes(q) || false;
        const topicMatch = item.topics.some(t => t.topic.name.toLowerCase().includes(q));
        
        return titleMatch || summaryMatch || sigMatch || profMatch || uniMatch || deptMatch || topicMatch;
      });
    }

    if (professor) {
      const p = professor.toLowerCase();
      items = items.filter(item => item.professor?.name.toLowerCase().includes(p));
    }

    // Apply the five-tier ranking system in JavaScript
    const sourceQualityRank: Record<string, number> = {
      'publication': 5,
      'grant': 4,
      'lab page': 3,
      'university news': 2,
      'professor page': 1
    };

    items.sort((a, b) => {
      // 1. Most recent publication/update date (fallback to createdAt)
      const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : new Date(b.createdAt).getTime();
      if (dateB !== dateA) return dateB - dateA;

      // 2. Verified research entries first
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }

      // 3. Stronger source quality
      const qualA = sourceQualityRank[a.sourceType.toLowerCase()] || 0;
      const qualB = sourceQualityRank[b.sourceType.toLowerCase()] || 0;
      if (qualB !== qualA) return qualB - qualA;

      // 4. Clear professor/contact information (email present)
      const emailA = a.professor?.email ? 1 : 0;
      const emailB = b.professor?.email ? 1 : 0;
      if (emailB !== emailA) return emailB - emailA;

      // 5. Relevance to student search query (score matches)
      if (search) {
        const q = search.toLowerCase();
        const score = (item: typeof a) => {
          let s = 0;
          if (item.title.toLowerCase().includes(q)) s += 10;
          if (item.topics.some(t => t.topic.name.toLowerCase().includes(q))) s += 7;
          if (item.professor?.name.toLowerCase().includes(q)) s += 5;
          if (item.summary.toLowerCase().includes(q)) s += 3;
          return s;
        };
        return score(b) - score(a);
      }

      // Final default: insertion order
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Also fetch aggregate lists to build filters on landing & search feeds
    const universities = await prisma.university.findMany({
      orderBy: { name: 'asc' }
    });
    
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { university: true }
    });

    const topics = await prisma.topic.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      items,
      filters: {
        universities,
        departments,
        topics
      }
    });
  } catch (err: any) {
    console.error('Search API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

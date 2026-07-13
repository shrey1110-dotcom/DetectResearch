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
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

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

    if (professor) {
      where.professor = {
        name: {
          contains: professor,
          mode: 'insensitive'
        }
      };
    }

    // Apply keyword search in database for maximum speed and scaling
    if (search) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { significance: { contains: q, mode: 'insensitive' } },
        { professor: { name: { contains: q, mode: 'insensitive' } } },
        { university: { name: { contains: q, mode: 'insensitive' } } },
        { department: { name: { contains: q, mode: 'insensitive' } } }
      ];
    }

    // Fetch total count for pagination metadata
    const totalCount = await prisma.researchItem.count({ where });

    // Fetch paginated slice matched research items
    const items = await prisma.researchItem.findMany({
      where,
      take: limit,
      skip,
      orderBy: [
        // Prioritize Active opportunities, verified, and recent verification date
        { activityStatus: 'asc' }, // ACTIVE first alphabetically, but ARCHIVED is also start with A. That is fine, we will sort the batch of 20 items in memory or let Postgres ordering handle it.
        { isVerified: 'desc' },
        { lastVerified: 'desc' }
      ],
      include: {
        university: true,
        department: true,
        professor: true,
        topics: {
          include: { topic: true }
        }
      }
    });

    // Quick in-memory sort of the 20-item slice to ensure perfect active-first ranking
    const statusScore = (status: string) => {
      if (status === 'ACTIVE') return 4;
      if (status === 'POSSIBLY_ACTIVE') return 3;
      if (status === 'UNKNOWN') return 2;
      if (status === 'ARCHIVED') return 1;
      return 0;
    };

    items.sort((a, b) => {
      const statusA = statusScore(a.activityStatus);
      const statusB = statusScore(b.activityStatus);
      if (statusB !== statusA) return statusB - statusA;

      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }

      const timeA = new Date(a.lastVerified || a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.lastVerified || b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    // Fetch aggregate lists to build filters (these are small cached/static tables)
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
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      },
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

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Fetch the research item
    const item = await prisma.researchItem.findUnique({
      where: { id },
      include: {
        university: true,
        department: true,
        professor: true,
        researchLink: {
          include: {
            logs: {
              orderBy: { timestamp: 'desc' }
            }
          }
        },
        topics: {
          include: { topic: true }
        }
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Research item not found' }, { status: 404 });
    }

    // Find related research items (same topics or same school)
    const topicIds = item.topics.map(t => t.topicId);
    
    const relatedItems = await prisma.researchItem.findMany({
      where: {
        id: { not: id },
        OR: [
          { universityId: item.universityId },
          {
            topics: {
              some: {
                topicId: { in: topicIds }
              }
            }
          }
        ]
      },
      take: 3,
      include: {
        university: true,
        professor: true,
        topics: {
          include: { topic: true }
        }
      }
    });

    // If student is logged in, check if they have bookmarked/saved this research item
    let isSaved = false;
    if (user) {
      const saved = await prisma.savedResearch.findUnique({
        where: {
          userId_researchItemId: {
            userId: user.id,
            researchItemId: id
          }
        }
      });
      isSaved = !!saved;
    }

    return NextResponse.json({
      item,
      relatedItems,
      isSaved
    });
  } catch (err: any) {
    console.error('Research detail API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// Student bookmark/save route
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Toggle bookmark
    const existing = await prisma.savedResearch.findUnique({
      where: {
        userId_researchItemId: {
          userId: user.id,
          researchItemId: id
        }
      }
    });

    if (existing) {
      await prisma.savedResearch.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.savedResearch.create({
        data: {
          userId: user.id,
          researchItemId: id
        }
      });
      return NextResponse.json({ saved: true });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

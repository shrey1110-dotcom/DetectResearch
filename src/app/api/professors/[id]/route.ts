import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureAbsoluteUrl } from '@/lib/url';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        university: true,
        department: true,
        researchLinks: {
          include: {
            researchItem: {
              include: {
                university: true,
                department: true,
                topics: {
                  include: { topic: true }
                }
              }
            }
          }
        }
      }
    });

    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }

    // Extract research items from the join table
    const researchItems = professor.researchLinks
      .map(rl => rl.researchItem)
      .filter(Boolean);

    // Also pull research items where professor is directly linked (primary researcher)
    const directItems = await prisma.researchItem.findMany({
      where: { professorId: id },
      include: {
        university: true,
        department: true,
        topics: {
          include: { topic: true }
        }
      }
    });

    // Merge and deduplicate items
    const allItemsMap = new Map<string, any>();
    [...researchItems, ...directItems].forEach(item => {
      allItemsMap.set(item.id, item);
    });
    const uniqueResearchItems = Array.from(allItemsMap.values());

    // Sort uniqueResearchItems from recent to old
    uniqueResearchItems.sort((a, b) => {
      const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    // Derive research interests from topic tags of their publications
    const interestSet = new Set<string>();
    uniqueResearchItems.forEach(item => {
      item.topics.forEach((t: any) => {
        interestSet.add(t.topic.name);
      });
    });
    const interests = Array.from(interestSet);

    const sanitizedResearchItems = uniqueResearchItems.map(item => ({
      ...item,
      sourceUrl: ensureAbsoluteUrl(item.sourceUrl, item.university?.name, item.university?.domain),
      topic: item.topics && item.topics.length > 0 ? item.topics[0].topic.name : 'Research'
    }));

    return NextResponse.json({
      professor: {
        id: professor.id,
        name: professor.name,
        title: professor.title,
        email: professor.email,
        publicProfileUrl: ensureAbsoluteUrl(professor.publicProfileUrl, professor.university?.name, professor.university?.domain),
        university: professor.university,
        department: professor.department,
        interests
      },
      researchItems: sanitizedResearchItems
    });
  } catch (err: any) {
    console.error('Professor detail API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

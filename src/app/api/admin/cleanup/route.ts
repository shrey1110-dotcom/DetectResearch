import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST() {
  try {
    // Authenticate admin
    await requireAdmin();

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - 365);

    // Find links that are older than 365 days OR have a research item with publication/created date older than 365 days
    const expiredLinks = await prisma.researchLink.findMany({
      where: {
        OR: [
          {
            createdAt: {
              lt: expirationDate
            }
          },
          {
            researchItem: {
              OR: [
                {
                  publicationDate: {
                    lt: expirationDate
                  }
                },
                {
                  createdAt: {
                    lt: expirationDate
                  }
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        url: true
      }
    });

    const linkIds = expiredLinks.map(l => l.id);

    if (linkIds.length > 0) {
      await prisma.researchLink.deleteMany({
        where: {
          id: {
            in: linkIds
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      purgedCount: linkIds.length,
      purgedUrls: expiredLinks.map(l => l.url)
    });
  } catch (err: any) {
    console.error('Cleanup API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { enqueueLink, processLinkBackground } from '@/lib/queue';

export async function GET() {
  try {
    // Authenticate admin
    await requireAdmin();

    const links = await prisma.researchLink.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        researchItem: {
          select: { id: true, title: true }
        },
        logs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    return NextResponse.json({ links });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    // Authenticate admin
    const admin = await requireAdmin();

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const link = await enqueueLink(url, admin.id);

    return NextResponse.json({ link });
  } catch (err: any) {
    console.error('Link process API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

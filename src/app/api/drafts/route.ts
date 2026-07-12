import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const drafts = await prisma.outreachDraft.findMany({
      where: { userId: user.id },
      include: {
        professor: true,
        researchItem: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ drafts });
  } catch (err: any) {
    console.error('Fetch drafts API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const {
      professorId,
      researchItemId,
      studentName,
      studentMajor,
      studentYear,
      studentInterests,
      studentSkills,
      emailSubject,
      emailBody
    } = body;

    if (!professorId || !researchItemId || !studentName || !studentMajor || !studentYear) {
      return NextResponse.json({ error: 'Missing required draft details' }, { status: 400 });
    }

    const draft = await prisma.outreachDraft.create({
      data: {
        userId: user.id,
        professorId,
        researchItemId,
        studentName,
        studentMajor,
        studentYear,
        studentInterests: studentInterests || '',
        studentSkills: studentSkills || '',
        emailSubject,
        emailBody
      },
      include: {
        professor: true,
        researchItem: true
      }
    });

    return NextResponse.json({ draft });
  } catch (err: any) {
    console.error('Create draft API error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { processLinkBackground } from '@/lib/queue';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const link = await prisma.researchLink.findUnique({
      where: { id }
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Reset status and trigger processing
    const updated = await prisma.researchLink.update({
      where: { id },
      data: {
        status: 'PENDING',
        errorMsg: null,
        updatedAt: new Date()
      }
    });

    await prisma.extractionLog.create({
      data: {
        researchLinkId: id,
        stepName: 'REPROCESS',
        status: 'INFO',
        message: 'Manual re-processing triggered by admin.'
      }
    });

    await processLinkBackground(id);

    return NextResponse.json({ link: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const link = await prisma.researchLink.findUnique({
      where: { id }
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    await prisma.researchLink.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

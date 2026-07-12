import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const {
      title,
      summary,
      significance,
      universityName,
      departmentName,
      professorName,
      professorTitle,
      email,
      publicProfileUrl,
      publicationDate,
      sourceType,
      topics,
      isVerified
    } = body;

    const item = await prisma.researchItem.findUnique({
      where: { id }
    });

    if (!item) {
      return NextResponse.json({ error: 'Research item not found' }, { status: 404 });
    }

    // 1. Process University
    let universityId = item.universityId;
    if (universityName) {
      const university = await prisma.university.upsert({
        where: { name: universityName },
        update: {},
        create: { name: universityName }
      });
      universityId = university.id;
    }

    // 2. Process Department
    let departmentId = item.departmentId;
    if (departmentName) {
      const dept = await prisma.department.upsert({
        where: {
          name_universityId: {
            name: departmentName,
            universityId
          }
        },
        update: {},
        create: {
          name: departmentName,
          universityId
        }
      });
      departmentId = dept.id;
    } else if (body.hasOwnProperty('departmentName') && !departmentName) {
      departmentId = null;
    }

    // 3. Process Professor
    let professorId = item.professorId;
    if (professorName && professorName !== 'Unknown Researcher') {
      let prof = await prisma.professor.findFirst({
        where: {
          name: professorName,
          universityId
        }
      });

      if (prof) {
        prof = await prisma.professor.update({
          where: { id: prof.id },
          data: {
            title: professorTitle !== undefined ? professorTitle : prof.title,
            email: email !== undefined ? email : prof.email,
            publicProfileUrl: publicProfileUrl !== undefined ? publicProfileUrl : prof.publicProfileUrl,
            departmentId
          }
        });
      } else {
        prof = await prisma.professor.create({
          data: {
            name: professorName,
            title: professorTitle,
            universityId,
            departmentId,
            email,
            publicProfileUrl
          }
        });
      }
      professorId = prof.id;
    } else if (body.hasOwnProperty('professorName') && (!professorName || professorName === 'Unknown Researcher')) {
      professorId = null;
    }

    // 4. Update Topics if provided
    if (topics && Array.isArray(topics)) {
      // Clear previous topic associations
      await prisma.researchItemTopic.deleteMany({
        where: { researchItemId: id }
      });

      for (const topicName of topics) {
        if (!topicName.trim()) continue;
        const topic = await prisma.topic.upsert({
          where: { name: topicName.trim() },
          update: {},
          create: { name: topicName.trim() }
        });

        await prisma.researchItemTopic.create({
          data: {
            researchItemId: id,
            topicId: topic.id
          }
        });
      }
    }

    // 5. Connect Professor to Research Item in join table
    if (professorId) {
      await prisma.professorResearchLink.upsert({
        where: {
          professorId_researchItemId: {
            professorId,
            researchItemId: id
          }
        },
        update: {},
        create: {
          professorId,
          researchItemId: id
        }
      });
    }

    // 6. Update ResearchItem details
    const updatedItem = await prisma.researchItem.update({
      where: { id },
      data: {
        title: title !== undefined ? title : item.title,
        summary: summary !== undefined ? summary : item.summary,
        significance: significance !== undefined ? significance : item.significance,
        universityId,
        departmentId,
        professorId,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        sourceType: sourceType !== undefined ? sourceType : item.sourceType,
        isVerified: isVerified !== undefined ? isVerified : item.isVerified,
        verifiedByUserId: isVerified ? admin.id : null,
        updatedAt: new Date()
      },
      include: {
        university: true,
        department: true,
        professor: true,
        topics: {
          include: { topic: true }
        }
      }
    });

    return NextResponse.json({ researchItem: updatedItem });
  } catch (err: any) {
    console.error('Research item update API error:', err);
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

    const item = await prisma.researchItem.findUnique({
      where: { id }
    });

    if (!item) {
      return NextResponse.json({ error: 'Research item not found' }, { status: 404 });
    }

    await prisma.researchItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

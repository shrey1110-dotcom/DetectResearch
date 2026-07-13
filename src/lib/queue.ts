import prisma from './prisma';
import { extractResearchLink } from './extractor';

export async function enqueueLink(url: string, addedByUserId?: string) {
  // First, check if the link already exists in the database
  let link = await prisma.researchLink.findUnique({
    where: { url }
  });

  if (link) {
    // If it exists, reset status to PENDING so it re-processes
    link = await prisma.researchLink.update({
      where: { id: link.id },
      data: {
        status: 'PENDING',
        errorMsg: null,
        updatedAt: new Date()
      }
    });
  } else {
    // Create new link queue item
    link = await prisma.researchLink.create({
      data: {
        url,
        status: 'PENDING',
        addedByUserId
      }
    });
  }

  // Create initial log
  await logStep(link.id, 'ENQUEUE', 'INFO', 'Link added to the processing queue.');
  
  // Trigger processing asynchronously (in-app fire-and-forget background job)
  processLinkBackground(link.id).catch(err => {
    console.error(`Error triggering background processing for link ${link.id}:`, err);
  });

  return link;
}

export async function processLinkBackground(linkId: string): Promise<void> {
  // Fire and forget wrapper to process in background
  setTimeout(async () => {
    try {
      await processLink(linkId);
    } catch (err) {
      console.error(`Async background process failure for link ${linkId}:`, err);
    }
  }, 100);
}

export async function processLink(linkId: string): Promise<boolean> {
  const link = await prisma.researchLink.findUnique({
    where: { id: linkId }
  });

  if (!link) {
    console.error(`Link not found: ${linkId}`);
    return false;
  }

  // Avoid double processing
  if (link.status === 'PROCESSING') {
    return false;
  }

  // Update status to PROCESSING
  await prisma.researchLink.update({
    where: { id: linkId },
    data: { status: 'PROCESSING', errorMsg: null }
  });

  await logStep(linkId, 'FETCHING', 'INFO', `Started fetching and parsing page: ${link.url}`);

  try {
    // Run the extractor
    const data = await extractResearchLink(link.url);

    await logStep(linkId, 'EXTRACTING', 'INFO', `HTML parsed successfully. Extracted title: "${data.title}"`);

    // 1. Process University
    const university = await prisma.university.upsert({
      where: { name: data.university },
      update: {},
      create: { name: data.university }
    });

    // 2. Process Department (if available)
    let departmentId: string | undefined = undefined;
    if (data.department) {
      const dept = await prisma.department.upsert({
        where: {
          name_universityId: {
            name: data.department,
            universityId: university.id
          }
        },
        update: {},
        create: {
          name: data.department,
          universityId: university.id
        }
      });
      departmentId = dept.id;
    }

    // 3. Process Professor
    let professorId: string | undefined = undefined;
    if (data.professorName && data.professorName !== 'Unknown Researcher') {
      // Upsert Professor (by name + university)
      // Since there is no unique constraint on name+university in professor, we find first or create
      let prof = await prisma.professor.findFirst({
        where: {
          name: data.professorName,
          universityId: university.id
        }
      });

      if (prof) {
        // Update details if they are newly extracted
        prof = await prisma.professor.update({
          where: { id: prof.id },
          data: {
            title: data.professorTitle || prof.title,
            email: data.email || prof.email,
            publicProfileUrl: data.professorProfileUrl || prof.publicProfileUrl,
            departmentId: departmentId || prof.departmentId
          }
        });
      } else {
        prof = await prisma.professor.create({
          data: {
            name: data.professorName,
            title: data.professorTitle,
            universityId: university.id,
            departmentId: departmentId,
            email: data.email,
            publicProfileUrl: data.professorProfileUrl
          }
        });
      }
      professorId = prof.id;
    }

    // 4. Process ResearchItem
    // Check if it already exists for this link
    const existingItem = await prisma.researchItem.findUnique({
      where: { researchLinkId: link.id }
    });

    let researchItem;
    if (existingItem) {
      researchItem = await prisma.researchItem.update({
        where: { id: existingItem.id },
        data: {
          title: data.title,
          summary: data.summary,
          significance: data.significance,
          universityId: university.id,
          departmentId: departmentId,
          professorId: professorId,
          publicationDate: data.publicationDate,
          sourceUrl: data.sourceUrl,
          sourceType: data.sourceType,
          confidenceScores: data.confidenceScores,
          missingInfoFlags: data.missingInfoFlags,
          activityStatus: data.activityStatus || 'ACTIVE',
          activityEvidence: data.activityEvidence || null,
          lastVerified: new Date(),
          updatedAt: new Date()
        }
      });
    } else {
      researchItem = await prisma.researchItem.create({
        data: {
          researchLinkId: link.id,
          title: data.title,
          summary: data.summary,
          significance: data.significance,
          universityId: university.id,
          departmentId: departmentId,
          professorId: professorId,
          publicationDate: data.publicationDate,
          sourceUrl: data.sourceUrl,
          sourceType: data.sourceType,
          confidenceScores: data.confidenceScores,
          missingInfoFlags: data.missingInfoFlags,
          activityStatus: data.activityStatus || 'ACTIVE',
          activityEvidence: data.activityEvidence || null,
          lastVerified: new Date()
        }
      });
    }

    // 5. Connect Topics
    if (data.topics && data.topics.length > 0) {
      // Clear previous topics relationships for this research item to avoid duplicates
      await prisma.researchItemTopic.deleteMany({
        where: { researchItemId: researchItem.id }
      });

      for (const topicName of data.topics) {
        const topic = await prisma.topic.upsert({
          where: { name: topicName },
          update: {},
          create: { name: topicName }
        });

        await prisma.researchItemTopic.create({
          data: {
            researchItemId: researchItem.id,
            topicId: topic.id
          }
        });
      }
    }

    // 6. Connect Professor to Research Item (many-to-many relationship)
    if (professorId) {
      await prisma.professorResearchLink.upsert({
        where: {
          professorId_researchItemId: {
            professorId: professorId,
            researchItemId: researchItem.id
          }
        },
        update: {},
        create: {
          professorId: professorId,
          researchItemId: researchItem.id
        }
      });
    }

    // Mark as PROCESSED
    await prisma.researchLink.update({
      where: { id: linkId },
      data: { status: 'PROCESSED' }
    });

    await logStep(linkId, 'SAVING', 'SUCCESS', `Successfully extracted and saved research profile for: "${data.title}"`);
    return true;
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.error(`Error processing link ${linkId}:`, err);
    
    await prisma.researchLink.update({
      where: { id: linkId },
      data: { status: 'FAILED', errorMsg }
    });

    await logStep(linkId, 'FAILED', 'ERROR', `Processing failed: ${errorMsg}`);
    return false;
  }
}

export async function logStep(linkId: string, stepName: string, status: 'INFO' | 'SUCCESS' | 'ERROR', message: string) {
  try {
    await prisma.extractionLog.create({
      data: {
        researchLinkId: linkId,
        stepName,
        status,
        message
      }
    });
  } catch (err) {
    console.error('Failed to write log step:', err);
  }
}

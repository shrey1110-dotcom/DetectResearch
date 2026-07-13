import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Map NSF programs to student-friendly topics
function mapProgramToTopic(programStr: string | undefined): string {
  if (!programStr) return 'General Science';
  const prog = programStr.toLowerCase();
  if (prog.includes('quantum') || prog.includes('physics')) return 'Quantum Computing';
  if (prog.includes('bioelectronics') || prog.includes('sensor')) return 'Bioelectronics';
  if (prog.includes('crispr') || prog.includes('gene') || prog.includes('dna') || prog.includes('genomics')) return 'Gene Editing';
  if (prog.includes('climate') || prog.includes('weather') || prog.includes('grid') || prog.includes('environment')) return 'Climate Technology';
  if (prog.includes('machine learning') || prog.includes('intelligence') || prog.includes('neural') || prog.includes('computational')) return 'Artificial Intelligence';
  if (prog.includes('materials') || prog.includes('nano')) return 'Materials Science';
  if (prog.includes('cyber') || prog.includes('security') || prog.includes('network')) return 'Cybersecurity';
  if (prog.includes('chemistry') || prog.includes('chemical')) return 'Chemistry';
  if (prog.includes('robot') || prog.includes('control') || prog.includes('system')) return 'Robotics';
  return 'General Science';
}

function cleanAbstract(abstractText: string | undefined): string {
  if (!abstractText) return 'Active research project investigating scientific phenomena.';
  // Clean HTML/carriage returns
  let clean = abstractText
    .replace(/<[^>]*>/g, '')
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Cut down to first 3 sentences
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (sentences && sentences.length > 0) {
    return sentences.slice(0, 3).join('').trim();
  }
  return clean.substring(0, 250) + '...';
}

function cleanUniversityName(rawName: string | undefined): string {
  if (!rawName) return 'Unknown University';
  let name = rawName.trim();
  // Standardize common university names
  const lower = name.toLowerCase();
  if (lower.includes('california') && lower.includes('berkeley')) return 'UC Berkeley';
  if (lower.includes('stanford')) return 'Stanford University';
  if (lower.includes('harvard')) return 'Harvard University';
  if (lower.includes('massachusetts inst') || lower.includes('technology') && lower.includes('massachusetts')) return 'MIT';
  if (lower.includes('princeton')) return 'Princeton University';
  if (lower.includes('yale')) return 'Yale University';
  if (lower.includes('columbia')) return 'Columbia University';
  if (lower.includes('cornell')) return 'Cornell University';
  if (lower.includes('chicago')) return 'University of Chicago';
  if (lower.includes('pennsylvania') && lower.includes('university of')) return 'University of Pennsylvania';
  
  // Clean formatting (capitalize words)
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function runImport(totalToImport: number) {
  console.log(`Starting bulk import of ${totalToImport} active research records from NSF Award Search API...`);
  
  const batchSize = 1000;
  let importedCount = 0;
  
  // Fetch default admin user to mark as verified reviewer
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  const adminUserId = adminUser?.id || null;

  while (importedCount < totalToImport) {
    const limit = Math.min(batchSize, totalToImport - importedCount);
    const offset = importedCount;
    
    console.log(`\nFetching batch: offset=${offset}, limit=${limit}...`);
    const nsfUrl = `https://api.nsf.gov/services/v1/awards.json?activeAwd=true&rpp=${limit}&offset=${offset}`;
    
    let awards: any[] = [];
    try {
      const response = await fetch(nsfUrl);
      if (!response.ok) {
        throw new Error(`NSF API returned status ${response.status}`);
      }
      const data = await response.json();
      awards = data.response?.award || [];
    } catch (err: any) {
      console.error(`Error querying NSF API: ${err.message}. Retrying in 5 seconds...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      continue;
    }
    
    if (awards.length === 0) {
      console.log('No more awards returned from the NSF API. Import complete.');
      break;
    }

    console.log(`Received ${awards.length} awards. Processing data tables...`);
    
    // Track lists to bulk insert
    const universitiesMap = new Map<string, string>(); // name -> tempId
    const professorsMap = new Map<string, any>(); // keyName -> profInfo
    const topicsMap = new Map<string, string>(); // name -> tempId
    
    // Step 1: Collect unique entities in memory to avoid duplicate SQL queries
    for (const award of awards) {
      const uniName = cleanUniversityName(award.awardeeName);
      if (!universitiesMap.has(uniName)) {
        universitiesMap.set(uniName, crypto.randomUUID());
      }

      const piFirst = award.piFirstName;
      const piLast = award.piLastName;
      const piEmail = award.piEmail;
      
      if (piFirst && piLast) {
        const profName = `Dr. ${piFirst} ${piLast}`;
        const key = `${profName} @ ${uniName}`;
        professorsMap.set(key, {
          name: profName,
          email: piEmail || null,
          title: 'Principal Investigator',
          universityName: uniName,
          id: crypto.randomUUID()
        });
      }

      const topicName = mapProgramToTopic(award.program || award.fundProgramName);
      topicsMap.set(topicName, crypto.randomUUID());
    }

    // Step 2: Insert Universities
    console.log(`Inserting/Upserting ${universitiesMap.size} universities...`);
    for (const [name, id] of universitiesMap) {
      await prisma.university.upsert({
        where: { name },
        update: {},
        create: { id, name }
      });
    }

    // Refresh university IDs from database to get correct primary keys
    const dbUniversities = await prisma.university.findMany({
      where: { name: { in: Array.from(universitiesMap.keys()) } }
    });
    const uniIdMap = new Map(dbUniversities.map(u => [u.name, u.id]));

    // Step 3: Insert Professors
    console.log(`Inserting/Upserting ${professorsMap.size} professors...`);
    for (const [key, prof] of professorsMap) {
      const uId = uniIdMap.get(prof.universityName);
      if (!uId) continue;
      
      // Find or create professor (prevent duplicates)
      const existing = await prisma.professor.findFirst({
        where: { name: prof.name, universityId: uId }
      });
      
      if (existing) {
        prof.id = existing.id;
        // Optionally update email if it was missing before
        if (!existing.email && prof.email) {
          await prisma.professor.update({
            where: { id: existing.id },
            data: { email: prof.email }
          });
        }
      } else {
        await prisma.professor.create({
          data: {
            id: prof.id,
            name: prof.name,
            email: prof.email,
            title: prof.title,
            universityId: uId
          }
        });
      }
    }

    // Step 4: Insert Topics
    console.log(`Inserting/Upserting ${topicsMap.size} topics...`);
    for (const [name, id] of topicsMap) {
      await prisma.topic.upsert({
        where: { name },
        update: {},
        create: { id, name }
      });
    }
    const dbTopics = await prisma.topic.findMany({
      where: { name: { in: Array.from(topicsMap.keys()) } }
    });
    const topicIdMap = new Map(dbTopics.map(t => [t.name, t.id]));

    // Step 5: Bulk build ResearchLinks and ResearchItems
    console.log(`Inserting research items...`);
    let addedInBatch = 0;
    
    for (const award of awards) {
      const awardId = award.id;
      const sourceUrl = `https://www.nsf.gov/awardsearch/showAward?AWD_ID=${awardId}`;
      
      // Check if research link already exists
      const existingLink = await prisma.researchLink.findUnique({
        where: { url: sourceUrl }
      });
      
      if (existingLink) continue; // Skip already imported awards
      
      const uniName = cleanUniversityName(award.awardeeName);
      const uId = uniIdMap.get(uniName);
      if (!uId) continue;

      const piFirst = award.piFirstName;
      const piLast = award.piLastName;
      const profName = `Dr. ${piFirst} ${piLast}`;
      const key = `${profName} @ ${uniName}`;
      const prof = professorsMap.get(key);
      const professorId = prof?.id || null;

      const title = award.title || 'Ongoing NSF Scientific Investigation';
      const summary = cleanAbstract(award.abstractText);
      const significance = `This active project is sponsored by the NSF Directorate under program designation ${award.fundProgramName || 'Research Initiatives'}.`;
      
      const activityStatus = 'ACTIVE';
      const activityEvidence = `Active NSF Grant (Award ID: ${awardId}) running from ${award.startDate || 'N/A'} to ${award.expDate || 'N/A'}.`;

      try {
        // Create ResearchLink and ResearchItem in a transaction
        await prisma.$transaction(async (tx) => {
          const link = await tx.researchLink.create({
            data: {
              url: sourceUrl,
              status: 'PROCESSED'
            }
          });

          const item = await tx.researchItem.create({
            data: {
              researchLinkId: link.id,
              title,
              summary,
              significance,
              universityId: uId,
              professorId,
              sourceUrl,
              sourceType: 'grant',
              isVerified: true, // Auto-verified since it comes directly from federal government public API
              verifiedByUserId: adminUserId,
              activityStatus,
              activityEvidence,
              lastVerified: new Date(),
              confidenceScores: { title: 1.0, professor: 1.0, university: 1.0, summary: 1.0, email: 1.0 },
              missingInfoFlags: []
            }
          });

          // Connect Topics
          const topicName = mapProgramToTopic(award.program || award.fundProgramName);
          const tId = topicIdMap.get(topicName);
          if (tId) {
            await tx.researchItemTopic.create({
              data: {
                researchItemId: item.id,
                topicId: tId
              }
            });
          }

          // Connect Professor link
          if (professorId) {
            await tx.professorResearchLink.create({
              data: {
                professorId,
                researchItemId: item.id
              }
            });
          }
        });
        
        addedInBatch++;
      } catch (err: any) {
        console.error(`Failed to insert award ${awardId}: ${err.message}`);
      }
    }

    importedCount += awards.length;
    console.log(`Batch processed. Imported ${addedInBatch} new active opportunities in this batch. Total imported: ${importedCount}/${totalToImport}`);
    
    // Slow down slightly to prevent db connection overloading
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\nImport complete! Successfully added active research records to the database.`);
  process.exit(0);
}

const targetCount = parseInt(process.argv[2], 10) || 5000;
runImport(targetCount).catch(err => {
  console.error('Fatal import error:', err);
  process.exit(1);
});

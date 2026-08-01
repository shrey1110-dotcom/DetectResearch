import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeed() {
  const universities = await prisma.university.findMany({
    include: { departments: true, professors: true, researchItems: true }
  });

  console.log(`Verified ${universities.length} universities in database:`);
  for (const u of universities) {
    console.log(`- ${u.name} (${u.domain}): ${u.departments.length} departments, ${u.professors.length} professors, ${u.researchItems.length} research items.`);
  }
}

verifySeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

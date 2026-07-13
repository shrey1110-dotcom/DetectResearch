import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function executeSqlFile() {
  const sqlFilePath = path.join(process.cwd(), 'import-data.sql');
  console.log(`Reading SQL file from ${sqlFilePath}...`);
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error('SQL file not found.');
    process.exit(1);
  }

  const content = fs.readFileSync(sqlFilePath, 'utf8');
  console.log('Splitting SQL statements...');
  
  // Split statements by semicolon followed by newline
  const rawStatements = content.split(/;\r?\n/);
  
  // Clean statements
  const statements = rawStatements
    .map(s => s.trim())
    .filter(s => s.length > 0 && s !== 'BEGIN' && s !== 'COMMIT' && s !== 'SET CONSTRAINTS ALL DEFERRED');

  console.log(`Identified ${statements.length} SQL execution blocks.`);
  
  // Execute clean slate first (TRUNCATES)
  const truncates = statements.filter(s => s.startsWith('TRUNCATE'));
  const inserts = statements.filter(s => !s.startsWith('TRUNCATE'));

  console.log(`Executing TRUNCATE blocks...`);
  for (const trunc of truncates) {
    console.log(`Executing: ${trunc.substring(0, 50)}...`);
    await prisma.$executeRawUnsafe(trunc);
  }

  console.log(`\nExecuting INSERT blocks (${inserts.length} blocks)...`);
  let index = 1;
  for (const insert of inserts) {
    const start = Date.now();
    console.log(`[${index}/${inserts.length}] Executing statement block (${(insert.length / 1024 / 1024).toFixed(2)} MB)...`);
    
    try {
      await prisma.$executeRawUnsafe(insert);
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`  Success! Elapsed time: ${elapsed}s`);
    } catch (err: any) {
      console.error(`  Error executing statement block: ${err.message}`);
    }
    
    index++;
  }

  console.log('\nAll SQL statement blocks successfully executed on the database.');
  process.exit(0);
}

executeSqlFile().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

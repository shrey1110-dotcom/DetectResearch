import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function GET() {
  try {
    console.log('Executing programmatic schema push...');
    
    // Run prisma generate first just in case
    execSync('npx prisma generate', {
      env: { ...process.env },
      encoding: 'utf-8'
    });

    // Run prisma db push to create tables on Supabase
    const pushOutput = execSync('npx prisma db push --accept-data-loss', {
      env: { ...process.env },
      encoding: 'utf-8'
    });
    
    console.log('Database push success:', pushOutput);
    
    // Run prisma db seed to seed the 4 research items
    const seedOutput = execSync('npx prisma db seed', {
      env: { ...process.env },
      encoding: 'utf-8'
    });
    
    console.log('Database seed success:', seedOutput);
    
    return NextResponse.json({
      success: true,
      push: pushOutput,
      seed: seedOutput
    });
  } catch (err: any) {
    console.error('Programmatic setup failed:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
      stderr: err.stderr || err.toString()
    }, { status: 500 });
  }
}

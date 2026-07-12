import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export async function GET() {
  try {
    console.log('Executing programmatic schema push...');
    
    // Call the local prisma binary directly to avoid npx writing to read-only home dir cache
    const prismaBin = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');

    // Run prisma db push to create tables on Supabase
    const pushOutput = execSync(`"${prismaBin}" db push --accept-data-loss`, {
      env: { 
        ...process.env,
        HOME: '/tmp' // Redirect home cache path to writable /tmp
      },
      encoding: 'utf-8'
    });
    
    console.log('Database push success:', pushOutput);
    
    // Run prisma db seed to seed the 4 research items
    const seedOutput = execSync(`"${prismaBin}" db seed`, {
      env: { 
        ...process.env,
        HOME: '/tmp'
      },
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

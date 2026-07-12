import prisma from './prisma';
import { processLink } from './queue';

async function runWorker() {
  console.log('=== ResearchLink Queue Worker Started ===');
  console.log('Polling database for PENDING links...');

  let running = true;

  // Graceful shutdown handlers
  process.on('SIGINT', () => {
    console.log('\nShutting down worker gracefully...');
    running = false;
  });
  
  process.on('SIGTERM', () => {
    console.log('\nShutting down worker gracefully...');
    running = false;
  });

  while (running) {
    try {
      // Find the oldest PENDING link
      const pendingLink = await prisma.researchLink.findFirst({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' }
      });

      if (pendingLink) {
        console.log(`[${new Date().toISOString()}] Found pending link: ${pendingLink.url}. Processing...`);
        const success = await processLink(pendingLink.id);
        console.log(`[${new Date().toISOString()}] Processing result for ${pendingLink.url}: ${success ? 'SUCCESS' : 'FAILED'}`);
      }
    } catch (error) {
      console.error('Error in worker poll cycle:', error);
    }

    // Wait 3 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('=== Worker Stopped ===');
}

// Run the worker
runWorker().catch(err => {
  console.error('Fatal error in worker execution:', err);
  process.exit(1);
});

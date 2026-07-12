import prisma from './prisma';
import { processLink } from './queue';

async function runWorker() {
  console.log('=== Detect Research Queue Worker Started ===');
  console.log('Polling database for PENDING links...');

  let running = true;
  let lastCleanupTime = 0;

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
      // Run daily cleanup for research older than 365 days
      const now = Date.now();
      if (now - lastCleanupTime > 24 * 60 * 60 * 1000) {
        console.log(`[${new Date().toISOString()}] Running daily database cleanup for research older than 365 days...`);
        try {
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() - 365);
          
          const expiredLinks = await prisma.researchLink.findMany({
            where: {
              OR: [
                { createdAt: { lt: expirationDate } },
                {
                  researchItem: {
                    OR: [
                      { publicationDate: { lt: expirationDate } },
                      { createdAt: { lt: expirationDate } }
                    ]
                  }
                }
              ]
            },
            select: { id: true }
          });
          
          const linkIds = expiredLinks.map(l => l.id);
          if (linkIds.length > 0) {
            const result = await prisma.researchLink.deleteMany({
              where: { id: { in: linkIds } }
            });
            console.log(`[${new Date().toISOString()}] Cleaned up ${result.count} expired research links older than 365 days.`);
          } else {
            console.log(`[${new Date().toISOString()}] No expired research links found.`);
          }
          lastCleanupTime = now;
        } catch (cleanupError) {
          console.error('Error during automatic database cleanup:', cleanupError);
        }
      }

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

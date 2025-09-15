const { createApp, logger } = require('./app');
const db = require('./database/prisma-db');

const app = createApp();
const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    await db.connect();
    await db.seedDatabase();

    app.listen(PORT, () => {
      logger.info(`AutoTrade MVP server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await db.disconnect();
  process.exit(0);
});

startServer();
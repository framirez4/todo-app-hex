import { createApp } from './infrastructure/ExpressApp';
import { DependencyContainer } from './infrastructure/DependencyContainer';

async function startServer() {
  try {
    // Get dependency container and configuration
    const container = DependencyContainer.getInstance();
    const config = container.config;

    // Display configuration info
    console.log('Starting Todo Application...');
    console.log(config.getInfo());

    // Initialize async resources (e.g., database connection)
    await container.initialize();

    // Create and start Express app
    const app = createApp();
    const PORT = config.port;

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📋 Todo API available at http://localhost:${PORT}/api`);
      console.log(`❤️  Health check at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('\nSIGTERM received, shutting down gracefully...');
      await container.cleanup();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('\nSIGINT received, shutting down gracefully...');
      await container.cleanup();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


import { createApp } from './infrastructure/ExpressApp';

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Todo API available at http://localhost:${PORT}/api`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});


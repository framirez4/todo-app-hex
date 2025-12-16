import express, { Application } from 'express';
import cors from 'cors';
import { DependencyContainer } from './DependencyContainer';
import { createTodoRoutes } from '../adapters/inbound/TodoRoutes';

export function createApp(): Application {
  const app = express();
  const container = DependencyContainer.getInstance();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', createTodoRoutes(container.todoController));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}


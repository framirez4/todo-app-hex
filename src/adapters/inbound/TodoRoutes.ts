import { Router } from 'express';
import { TodoController } from './TodoController';

export function createTodoRoutes(todoController: TodoController): Router {
  const router = Router();

  // Create a new todo
  router.post('/todos', (req, res) => todoController.createTodo(req, res));

  // Get all todos
  router.get('/todos', (req, res) => todoController.listTodos(req, res));

  // Get a specific todo
  router.get('/todos/:id', (req, res) => todoController.getTodo(req, res));

  // Update a todo
  router.put('/todos/:id', (req, res) => todoController.updateTodo(req, res));

  // Complete a todo
  router.patch('/todos/:id/complete', (req, res) => todoController.completeTodo(req, res));

  // Delete a todo
  router.delete('/todos/:id', (req, res) => todoController.deleteTodo(req, res));

  return router;
}


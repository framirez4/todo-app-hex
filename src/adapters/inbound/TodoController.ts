import { Request, Response } from 'express';
import { CreateTodoUseCase } from '../../application/ports/CreateTodoUseCase';
import { GetTodoUseCase } from '../../application/ports/GetTodoUseCase';
import { ListTodosUseCase } from '../../application/ports/ListTodosUseCase';
import { UpdateTodoUseCase } from '../../application/ports/UpdateTodoUseCase';
import { CompleteTodoUseCase } from '../../application/ports/CompleteTodoUseCase';
import { DeleteTodoUseCase } from '../../application/ports/DeleteTodoUseCase';
import { DomainException } from '../../domain/exceptions/DomainException';

/**
 * Inbound Adapter - REST API Controller
 */
export class TodoController {
  constructor(
    private readonly createTodoUseCase: CreateTodoUseCase,
    private readonly getTodoUseCase: GetTodoUseCase,
    private readonly listTodosUseCase: ListTodosUseCase,
    private readonly updateTodoUseCase: UpdateTodoUseCase,
    private readonly completeTodoUseCase: CompleteTodoUseCase,
    private readonly deleteTodoUseCase: DeleteTodoUseCase
  ) {}

  async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const { title, description } = req.body;
      const todo = await this.createTodoUseCase.execute({ title, description });
      res.status(201).json(todo.toObject());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async getTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await this.getTodoUseCase.execute(id);
      res.status(200).json(todo.toObject());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async listTodos(req: Request, res: Response): Promise<void> {
    try {
      const todos = await this.listTodosUseCase.execute();
      res.status(200).json(todos.map(todo => todo.toObject()));
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const todo = await this.updateTodoUseCase.execute({ id, title, description });
      res.status(200).json(todo.toObject());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async completeTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await this.completeTodoUseCase.execute(id);
      res.status(200).json(todo.toObject());
    } catch (error) {
      this.handleError(error, res);
    }
  }

  async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteTodoUseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    if (error instanceof DomainException) {
      res.status(404).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}


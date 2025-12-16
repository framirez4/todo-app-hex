import { TodoRepository } from '../application/ports/TodoRepository';
import { CreateTodoUseCase } from '../application/ports/CreateTodoUseCase';
import { GetTodoUseCase } from '../application/ports/GetTodoUseCase';
import { ListTodosUseCase } from '../application/ports/ListTodosUseCase';
import { UpdateTodoUseCase } from '../application/ports/UpdateTodoUseCase';
import { CompleteTodoUseCase } from '../application/ports/CompleteTodoUseCase';
import { DeleteTodoUseCase } from '../application/ports/DeleteTodoUseCase';

import { CreateTodo } from '../application/use-cases/CreateTodo';
import { GetTodo } from '../application/use-cases/GetTodo';
import { ListTodos } from '../application/use-cases/ListTodos';
import { UpdateTodo } from '../application/use-cases/UpdateTodo';
import { CompleteTodo } from '../application/use-cases/CompleteTodo';
import { DeleteTodo } from '../application/use-cases/DeleteTodo';

import { InMemoryTodoRepository } from '../adapters/outbound/InMemoryTodoRepository';
import { TodoController } from '../adapters/inbound/TodoController';

/**
 * Dependency Injection Container
 * Wires up all the dependencies following hexagonal architecture principles
 */
export class DependencyContainer {
  private static instance: DependencyContainer;
  
  private _todoRepository: TodoRepository;
  private _createTodoUseCase: CreateTodoUseCase;
  private _getTodoUseCase: GetTodoUseCase;
  private _listTodosUseCase: ListTodosUseCase;
  private _updateTodoUseCase: UpdateTodoUseCase;
  private _completeTodoUseCase: CompleteTodoUseCase;
  private _deleteTodoUseCase: DeleteTodoUseCase;
  private _todoController: TodoController;

  private constructor() {
    // Initialize repository (outbound adapter)
    this._todoRepository = new InMemoryTodoRepository();

    // Initialize use cases (application layer)
    this._createTodoUseCase = new CreateTodo(this._todoRepository);
    this._getTodoUseCase = new GetTodo(this._todoRepository);
    this._listTodosUseCase = new ListTodos(this._todoRepository);
    this._updateTodoUseCase = new UpdateTodo(this._todoRepository);
    this._completeTodoUseCase = new CompleteTodo(this._todoRepository);
    this._deleteTodoUseCase = new DeleteTodo(this._todoRepository);

    // Initialize controller (inbound adapter)
    this._todoController = new TodoController(
      this._createTodoUseCase,
      this._getTodoUseCase,
      this._listTodosUseCase,
      this._updateTodoUseCase,
      this._completeTodoUseCase,
      this._deleteTodoUseCase
    );
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  get todoRepository(): TodoRepository {
    return this._todoRepository;
  }

  get createTodoUseCase(): CreateTodoUseCase {
    return this._createTodoUseCase;
  }

  get getTodoUseCase(): GetTodoUseCase {
    return this._getTodoUseCase;
  }

  get listTodosUseCase(): ListTodosUseCase {
    return this._listTodosUseCase;
  }

  get updateTodoUseCase(): UpdateTodoUseCase {
    return this._updateTodoUseCase;
  }

  get completeTodoUseCase(): CompleteTodoUseCase {
    return this._completeTodoUseCase;
  }

  get deleteTodoUseCase(): DeleteTodoUseCase {
    return this._deleteTodoUseCase;
  }

  get todoController(): TodoController {
    return this._todoController;
  }
}


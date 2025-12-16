import { Todo, TodoProps } from '../../domain/entities/Todo';
import { TodoRepository } from '../../application/ports/TodoRepository';

/**
 * Outbound Adapter - In-Memory implementation of TodoRepository
 */
export class InMemoryTodoRepository implements TodoRepository {
  private todos: Map<string, TodoProps> = new Map();

  async save(todo: Todo): Promise<Todo> {
    const todoData = todo.toObject();
    this.todos.set(todoData.id!, todoData);
    return new Todo(todoData);
  }

  async findById(id: string): Promise<Todo | null> {
    const todoData = this.todos.get(id);
    if (!todoData) {
      return null;
    }
    return new Todo(todoData);
  }

  async findAll(): Promise<Todo[]> {
    const allTodos = Array.from(this.todos.values());
    return allTodos.map(todoData => new Todo(todoData));
  }

  async update(todo: Todo): Promise<Todo> {
    const todoData = todo.toObject();
    const id = todoData.id!;
    
    if (!this.todos.has(id)) {
      throw new Error(`Todo with id ${id} not found`);
    }
    
    this.todos.set(id, todoData);
    return new Todo(todoData);
  }

  async delete(id: string): Promise<boolean> {
    return this.todos.delete(id);
  }

  // Helper method for testing/debugging
  clear(): void {
    this.todos.clear();
  }
}


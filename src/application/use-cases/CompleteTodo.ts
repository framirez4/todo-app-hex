import { Todo } from '../../domain/entities/Todo';
import { TodoNotFoundException } from '../../domain/exceptions/DomainException';
import { CompleteTodoUseCase } from '../ports/CompleteTodoUseCase';
import { TodoRepository } from '../ports/TodoRepository';

export class CompleteTodo implements CompleteTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id);
    
    if (!todo) {
      throw new TodoNotFoundException(id);
    }

    todo.complete();

    return await this.todoRepository.update(todo);
  }
}


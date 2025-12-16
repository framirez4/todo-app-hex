import { Todo } from '../../domain/entities/Todo';
import { TodoNotFoundException } from '../../domain/exceptions/DomainException';
import { GetTodoUseCase } from '../ports/GetTodoUseCase';
import { TodoRepository } from '../ports/TodoRepository';

export class GetTodo implements GetTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id);
    
    if (!todo) {
      throw new TodoNotFoundException(id);
    }

    return todo;
  }
}


import { TodoNotFoundException } from '../../domain/exceptions/DomainException';
import { DeleteTodoUseCase } from '../ports/DeleteTodoUseCase';
import { TodoRepository } from '../ports/TodoRepository';

export class DeleteTodo implements DeleteTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: string): Promise<void> {
    const todo = await this.todoRepository.findById(id);
    
    if (!todo) {
      throw new TodoNotFoundException(id);
    }

    await this.todoRepository.delete(id);
  }
}


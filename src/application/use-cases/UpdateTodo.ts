import { Todo } from '../../domain/entities/Todo';
import { TodoNotFoundException } from '../../domain/exceptions/DomainException';
import { UpdateTodoCommand, UpdateTodoUseCase } from '../ports/UpdateTodoUseCase';
import { TodoRepository } from '../ports/TodoRepository';

export class UpdateTodo implements UpdateTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(command: UpdateTodoCommand): Promise<Todo> {
    const todo = await this.todoRepository.findById(command.id);
    
    if (!todo) {
      throw new TodoNotFoundException(command.id);
    }

    if (command.title) {
      todo.updateTitle(command.title);
    }

    if (command.description !== undefined) {
      todo.updateDescription(command.description);
    }

    return await this.todoRepository.update(todo);
  }
}


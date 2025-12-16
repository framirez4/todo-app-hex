import { Todo } from '../../domain/entities/Todo';
import { CreateTodoCommand, CreateTodoUseCase } from '../ports/CreateTodoUseCase';
import { TodoRepository } from '../ports/TodoRepository';

export class CreateTodo implements CreateTodoUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(command: CreateTodoCommand): Promise<Todo> {
    const todo = new Todo({
      title: command.title,
      description: command.description
    });

    return await this.todoRepository.save(todo);
  }
}


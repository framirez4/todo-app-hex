import { Todo } from '../../domain/entities/Todo';
import { ListTodosUseCase } from '../ports/ListTodosUseCase';
import { TodoRepository } from '../ports/TodoRepository';

export class ListTodos implements ListTodosUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(): Promise<Todo[]> {
    return await this.todoRepository.findAll();
  }
}


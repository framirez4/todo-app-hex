import { Todo } from '../../domain/entities/Todo';

export interface CreateTodoCommand {
  title: string;
  description?: string;
}

/**
 * Input Port - Use case interface for creating a todo
 */
export interface CreateTodoUseCase {
  execute(command: CreateTodoCommand): Promise<Todo>;
}


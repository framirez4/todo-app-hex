import { Todo } from '../../domain/entities/Todo';

export interface UpdateTodoCommand {
  id: string;
  title?: string;
  description?: string;
}

/**
 * Input Port - Use case interface for updating a todo
 */
export interface UpdateTodoUseCase {
  execute(command: UpdateTodoCommand): Promise<Todo>;
}


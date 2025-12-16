import { Todo } from '../../domain/entities/Todo';

/**
 * Input Port - Use case interface for getting a todo by id
 */
export interface GetTodoUseCase {
  execute(id: string): Promise<Todo>;
}


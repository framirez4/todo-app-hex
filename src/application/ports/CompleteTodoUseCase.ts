import { Todo } from '../../domain/entities/Todo';

/**
 * Input Port - Use case interface for completing a todo
 */
export interface CompleteTodoUseCase {
  execute(id: string): Promise<Todo>;
}


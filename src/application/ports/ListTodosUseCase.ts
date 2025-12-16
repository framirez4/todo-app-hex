import { Todo } from '../../domain/entities/Todo';

/**
 * Input Port - Use case interface for listing all todos
 */
export interface ListTodosUseCase {
  execute(): Promise<Todo[]>;
}


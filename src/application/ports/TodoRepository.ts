import { Todo } from '../../domain/entities/Todo';

/**
 * Output Port - Repository interface
 * This defines what the application needs from the persistence layer
 */
export interface TodoRepository {
  init(): Promise<void>;
  save(todo: Todo): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
  findAll(): Promise<Todo[]>;
  update(todo: Todo): Promise<Todo>;
  delete(id: string): Promise<boolean>;
}


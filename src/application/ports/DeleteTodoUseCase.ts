/**
 * Input Port - Use case interface for deleting a todo
 */
export interface DeleteTodoUseCase {
  execute(id: string): Promise<void>;
}


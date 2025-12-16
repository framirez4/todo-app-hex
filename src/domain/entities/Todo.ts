import { TodoId } from '../value-objects/TodoId';
import { TodoTitle } from '../value-objects/TodoTitle';
import { TodoStatus, TodoStatusEnum } from '../value-objects/TodoStatus';

export interface TodoProps {
  id?: string;
  title: string;
  description?: string;
  status?: TodoStatusEnum;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Todo {
  private readonly id: TodoId;
  private title: TodoTitle;
  private description: string;
  private status: TodoStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: TodoProps) {
    this.id = new TodoId(props.id);
    this.title = new TodoTitle(props.title);
    this.description = props.description || '';
    this.status = new TodoStatus(props.status);
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  // Getters
  public getId(): TodoId {
    return this.id;
  }

  public getTitle(): TodoTitle {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getStatus(): TodoStatus {
    return this.status;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic
  public updateTitle(title: string): void {
    this.title = new TodoTitle(title);
    this.updatedAt = new Date();
  }

  public updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  public complete(): void {
    if (this.status.isCompleted()) {
      throw new Error('Todo is already completed');
    }
    this.status = this.status.complete();
    this.updatedAt = new Date();
  }

  public reopen(): void {
    if (this.status.isPending()) {
      throw new Error('Todo is already pending');
    }
    this.status = new TodoStatus(TodoStatusEnum.PENDING);
    this.updatedAt = new Date();
  }

  public isCompleted(): boolean {
    return this.status.isCompleted();
  }

  public isPending(): boolean {
    return this.status.isPending();
  }

  // Convert to plain object for persistence/serialization
  public toObject(): TodoProps {
    return {
      id: this.id.getValue(),
      title: this.title.getValue(),
      description: this.description,
      status: this.status.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}


export enum TodoStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export class TodoStatus {
  private readonly value: TodoStatusEnum;

  constructor(value: TodoStatusEnum = TodoStatusEnum.PENDING) {
    this.value = value;
  }

  public getValue(): TodoStatusEnum {
    return this.value;
  }

  public isPending(): boolean {
    return this.value === TodoStatusEnum.PENDING;
  }

  public isCompleted(): boolean {
    return this.value === TodoStatusEnum.COMPLETED;
  }

  public complete(): TodoStatus {
    return new TodoStatus(TodoStatusEnum.COMPLETED);
  }

  public equals(other: TodoStatus): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}


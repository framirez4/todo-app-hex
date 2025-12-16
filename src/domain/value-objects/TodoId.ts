export class TodoId {
  private readonly value: string;

  constructor(value?: string) {
    this.value = value || this.generateId();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TodoId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}


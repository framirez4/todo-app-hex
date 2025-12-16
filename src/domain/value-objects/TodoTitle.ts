export class TodoTitle {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value.trim();
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Todo title cannot be empty');
    }
    if (value.trim().length > 200) {
      throw new Error('Todo title cannot exceed 200 characters');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TodoTitle): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}


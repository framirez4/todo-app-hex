export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class TodoNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Todo with id ${id} not found`);
    this.name = 'TodoNotFoundException';
  }
}


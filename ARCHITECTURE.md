# Hexagonal Architecture Documentation

## What is Hexagonal Architecture?

Hexagonal Architecture (also known as Ports and Adapters) is an architectural pattern that aims to create loosely coupled application components that can be easily connected to their software environment by means of ports and adapters.

## Core Principles

### 1. Separation of Concerns
The application is divided into three main layers:

```
┌─────────────────────────────────────────────────┐
│                   ADAPTERS                       │
│  (Inbound)              │         (Outbound)     │
│  - REST API            │         - Database      │
│  - GraphQL             │         - Email         │
│  - CLI                 │         - External APIs │
└────────────┬───────────┴────────────┬────────────┘
             │                        │
             ↓                        ↑
┌────────────────────────────────────────────────┐
│              APPLICATION LAYER                  │
│  - Use Cases (Business Operations)             │
│  - Ports (Interfaces)                          │
│    * Input Ports (Use Case Interfaces)         │
│    * Output Ports (Repository Interfaces)      │
└─────────────────────┬──────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────┐
│                 DOMAIN LAYER                     │
│  - Entities (Todo)                              │
│  - Value Objects (TodoId, TodoTitle, etc.)      │
│  - Business Rules                               │
│  - Domain Exceptions                            │
└─────────────────────────────────────────────────┘
```

### 2. Dependency Rule

Dependencies point inward:
- **Domain** → No dependencies (pure business logic)
- **Application** → Depends only on Domain
- **Adapters** → Depend on Application and Domain
- **Infrastructure** → Orchestrates everything

### 3. Ports and Adapters

#### Ports (Interfaces)
- **Input Ports**: Define what the application can do (Use Case interfaces)
- **Output Ports**: Define what the application needs (Repository interfaces)

#### Adapters (Implementations)
- **Input Adapters**: Translate external requests into application actions (Controllers, CLI)
- **Output Adapters**: Implement output ports (Repositories, Email services)

## Flow of Control

### Example: Creating a Todo

```
1. HTTP Request arrives at REST API (Input Adapter)
   ↓
2. TodoController extracts data and calls CreateTodoUseCase (Input Port)
   ↓
3. CreateTodo (Use Case Implementation) creates Todo entity (Domain)
   ↓
4. CreateTodo calls TodoRepository.save() (Output Port)
   ↓
5. InMemoryTodoRepository (Output Adapter) stores the todo
   ↓
6. Todo is returned through the layers
   ↓
7. TodoController sends HTTP Response
```

## Layer Responsibilities

### Domain Layer (`src/domain/`)

**Purpose**: Contains the business logic and rules

**Domain-Driven Design (DDD)**:
The domain layer follows **Domain-Driven Design (DDD)** principles for modeling the business domain. While Hexagonal Architecture provides the overall structure for isolation and dependency flow, DDD specifically guides how we model and organize the domain logic. This combination gives us both clean separation of concerns and rich domain modeling.

**Components**:
- **Entities**: Objects with identity and lifecycle (Todo)
  - Have a unique identifier that persists over time
  - Contain business behavior, not just data
  - Encapsulate business rules within their methods
- **Value Objects**: Immutable objects without identity (TodoId, TodoTitle, TodoStatus)
  - Defined by their attributes, not identity
  - Enforce invariants through validation in constructors
  - Immutable once created
- **Domain Exceptions**: Business rule violations
  - Express domain-specific error conditions

**Rules**:
- No dependencies on external frameworks
- Contains pure business logic
- Entities contain behavior, not just data
- Value objects enforce invariants
- All business rules belong in the domain layer

**Example**:
```typescript
// Entity with business logic
export class Todo {
  public complete(): void {
    if (this.status.isCompleted()) {
      throw new Error('Todo is already completed');
    }
    this.status = this.status.complete();
    this.updatedAt = new Date();
  }
}
```

### Application Layer (`src/application/`)

**Purpose**: Orchestrates the domain layer and defines contracts

**Components**:
- **Ports**: Interfaces that define boundaries
  - Input Ports: Use case interfaces
  - Output Ports: Repository interfaces
- **Use Cases**: Implementations of input ports

**Rules**:
- Depends only on Domain layer
- No knowledge of external frameworks
- Each use case has a single responsibility
- Use cases coordinate domain objects

**Example**:
```typescript
// Input Port (Interface)
export interface CreateTodoUseCase {
  execute(command: CreateTodoCommand): Promise<Todo>;
}

// Use Case Implementation
export class CreateTodo implements CreateTodoUseCase {
  constructor(private todoRepository: TodoRepository) {}
  
  async execute(command: CreateTodoCommand): Promise<Todo> {
    const todo = new Todo({
      title: command.title,
      description: command.description
    });
    return await this.todoRepository.save(todo);
  }
}
```

### Adapters Layer (`src/adapters/`)

**Purpose**: Connect external world to application

**Components**:
- **Inbound Adapters**: Handle external requests (REST API, CLI)
- **Outbound Adapters**: Implement output ports (Repositories, Services)

**Rules**:
- Can depend on Application and Domain
- Convert external data formats to domain objects
- Handle technical concerns (HTTP, database queries)
- Multiple adapters can exist for the same port

**Example**:
```typescript
// Inbound Adapter (REST Controller)
export class TodoController {
  async createTodo(req: Request, res: Response): Promise<void> {
    const { title, description } = req.body;
    const todo = await this.createTodoUseCase.execute({ title, description });
    res.status(201).json(todo.toObject());
  }
}

// Outbound Adapter (Repository Implementation)
export class InMemoryTodoRepository implements TodoRepository {
  async save(todo: Todo): Promise<Todo> {
    const todoData = todo.toObject();
    this.todos.set(todoData.id!, todoData);
    return new Todo(todoData);
  }
}
```

### Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Application bootstrap and dependency wiring

**Components**:
- **Dependency Container**: Creates and wires dependencies
- **Application Setup**: Configures frameworks (Express)
- **Entry Point**: Starts the application

**Rules**:
- Can depend on all other layers
- Responsible for dependency injection
- Framework-specific configuration
- Single place to change implementations

## Benefits

### 1. Testability
```typescript
// Easy to test use cases with mock repository
const mockRepo = new MockTodoRepository();
const useCase = new CreateTodo(mockRepo);
const result = await useCase.execute({ title: "Test" });
```

### 2. Framework Independence
```typescript
// Core logic doesn't depend on Express
// Can easily switch to Fastify, Koa, etc.
```

### 3. Multiple Interfaces
```typescript
// Same use case can be used by:
// - REST API
// - GraphQL
// - CLI
// - Message Queue Consumer
```

### 4. Easy to Swap Implementations
```typescript
// In DependencyContainer:
// this._todoRepository = new InMemoryTodoRepository();
// Change to:
// this._todoRepository = new MongoTodoRepository();
// No other code changes needed!
```

## Common Patterns

### Command Pattern
Use cases accept command objects:
```typescript
interface CreateTodoCommand {
  title: string;
  description?: string;
}
```

### Repository Pattern
Abstract data access:
```typescript
interface TodoRepository {
  save(todo: Todo): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
}
```

### Dependency Injection
Dependencies injected via constructor:
```typescript
constructor(private todoRepository: TodoRepository) {}
```

## Anti-Patterns to Avoid

❌ **Domain entities depending on frameworks**
```typescript
// BAD: Entity depends on ORM
@Entity()
export class Todo {
  @Column()
  title: string;
}
```

✅ **Keep domain pure**
```typescript
// GOOD: Pure domain entity
export class Todo {
  private title: TodoTitle;
}
```

❌ **Controllers containing business logic**
```typescript
// BAD: Business logic in controller
async createTodo(req, res) {
  if (req.body.title.length === 0) { // validation
    throw new Error('Invalid');
  }
  // ...
}
```

✅ **Business logic in domain/use cases**
```typescript
// GOOD: Validation in value object
export class TodoTitle {
  constructor(value: string) {
    this.validate(value); // Business rule
    this.value = value;
  }
}
```

## Testing Strategy

### Unit Tests
- **Domain Layer**: Test business rules in isolation
- **Application Layer**: Test use cases with mock repositories

### Integration Tests
- **Adapters**: Test with real external systems

### E2E Tests
- Test complete user flows through the API

## Further Reading

- [Original paper by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)


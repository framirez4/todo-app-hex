# Traditional Layered Architecture vs Hexagonal Architecture

## Overview

This document explains how traditional layered architecture relates to Hexagonal Architecture, helping developers transition from one approach to the other.

## Traditional Layered Architecture

Many projects start with a traditional layered architecture:

```
┌─────────────────────┐
│    Express API      │  (Framework)
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│    Controllers      │  (HTTP handling)
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│     Services        │  (Business logic)
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│   Repositories      │  (Data access)
└─────────────────────┘
```

**Characteristics:**
- **Controllers**: Handle HTTP requests/responses, translate to service calls
- **Services**: Contain business logic and orchestration
- **Repositories**: Abstract database access
- Dependencies flow top-down (API → Controllers → Services → Repositories → Database)

## How It Relates to Hexagonal Architecture

### Similarities

The traditional layered approach already contains many Hexagonal Architecture concepts:

1. ✅ **Separation of concerns** - Each layer has a clear responsibility
2. ✅ **Business logic isolation** - Services contain your business rules
3. ✅ **Controllers as adapters** - They translate HTTP to business operations
4. ✅ **Repositories as adapters** - They abstract data access
5. ✅ **Dependency on abstractions** - Services likely depend on Repository interfaces

**You're already thinking in adapters!**

### Key Differences

#### 1. Dependency Direction

**Traditional Layered (top-down):**
```
API → Controllers → Services → Repositories → Database
(Dependencies flow downward)
```

**Hexagonal (inward):**
```
           Adapters (Controllers, Repos)
                      ↓
              Application (Use Cases)
                      ↓
           Domain (Entities, Value Objects)
                      
(All dependencies point toward the domain)
```

#### 2. Domain vs Services

**Traditional Services:**
```typescript
class TodoService {
  constructor(private todoRepo: TodoRepository) {}
  
  async createTodo(title: string, description?: string) {
    // Validation
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    
    // Business logic mixed with orchestration
    const todo = {
      id: generateId(),
      title: title.trim(),
      description: description || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return this.todoRepo.save(todo);
  }
  
  async completeTodo(id: string) {
    const todo = await this.todoRepo.findById(id);
    
    // Business rule in service
    if (todo.status === 'completed') {
      throw new Error('Already completed');
    }
    
    todo.status = 'completed';
    todo.updatedAt = new Date();
    return this.todoRepo.save(todo);
  }
}
```

Services often mix:
- Domain logic (business rules)
- Application logic (orchestration)
- Sometimes framework dependencies

**Hexagonal with DDD:**

**Domain Layer (Pure business logic):**
```typescript
// Value Object - enforces invariants
export class TodoTitle {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Todo title cannot be empty');
    }
    if (value.trim().length > 200) {
      throw new Error('Todo title cannot exceed 200 characters');
    }
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }
}

// Entity - contains business behavior
export class Todo {
  private readonly id: TodoId;
  private title: TodoTitle;
  private status: TodoStatus;
  private updatedAt: Date;
  
  constructor(props: TodoProps) {
    this.id = new TodoId(props.id);
    this.title = new TodoTitle(props.title);
    this.status = new TodoStatus(props.status);
    this.updatedAt = props.updatedAt || new Date();
  }
  
  // Business rule encapsulated in entity
  public complete(): void {
    if (this.status.isCompleted()) {
      throw new Error('Todo is already completed');
    }
    this.status = this.status.complete();
    this.updatedAt = new Date();
  }
}
```

**Application Layer (Orchestration):**
```typescript
export class CreateTodo implements CreateTodoUseCase {
  constructor(private todoRepository: TodoRepository) {}
  
  async execute(command: CreateTodoCommand): Promise<Todo> {
    // Use Case just orchestrates - validation happens in domain
    const todo = new Todo({
      title: command.title,
      description: command.description
    });
    
    return this.todoRepository.save(todo);
  }
}

export class CompleteTodo implements CompleteTodoUseCase {
  constructor(private todoRepository: TodoRepository) {}
  
  async execute(command: CompleteTodoCommand): Promise<Todo> {
    const todo = await this.todoRepository.findById(command.id);
    
    if (!todo) {
      throw new Error('Todo not found');
    }
    
    // Business rule lives in the entity
    todo.complete();
    
    return this.todoRepository.save(todo);
  }
}
```

**Key improvements:**
- **Domain Layer**: Pure business logic, no framework dependencies, rich behavioral models
- **Application Layer**: Thin orchestration that delegates to domain
- **Separation**: Clear distinction between what the business is (domain) and what it does (application)

#### 3. Explicit Ports

**Traditional approach** - Implicit contracts:
```typescript
class TodoService {
  constructor(private todoRepo: TodoRepository) {}
  
  async createTodo(title: string, description?: string) {
    // Implementation...
  }
}
```

**Hexagonal approach** - Explicit ports:
```typescript
// Input Port (Interface) - defines what the application can do
export interface CreateTodoUseCase {
  execute(command: CreateTodoCommand): Promise<Todo>;
}

// Output Port (Interface) - defines what the application needs
export interface TodoRepository {
  save(todo: Todo): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
  findAll(): Promise<Todo[]>;
  delete(id: string): Promise<void>;
}

// Use Case implements input port, depends on output port
export class CreateTodo implements CreateTodoUseCase {
  constructor(private todoRepository: TodoRepository) {}
  
  async execute(command: CreateTodoCommand): Promise<Todo> {
    const todo = new Todo({
      title: command.title,
      description: command.description
    });
    return this.todoRepository.save(todo);
  }
}
```

**Benefits of explicit ports:**
- Clear contracts visible at a glance
- Easy to see all capabilities of the application
- Better documentation
- Easier to mock for testing

#### 4. Multiple Adapters per Port

**Traditional:**
- Usually one controller per service
- Changing interface requires new services

**Hexagonal:**
- Multiple adapters can implement the same port
- Same use case can be driven by different adapters

```typescript
// Same Use Case...
interface CreateTodoUseCase {
  execute(command: CreateTodoCommand): Promise<Todo>;
}

// ...can be used by different adapters:

// REST Controller
class TodoController {
  async createTodo(req: Request, res: Response) {
    const todo = await this.createTodoUseCase.execute(req.body);
    res.status(201).json(todo.toObject());
  }
}

// GraphQL Resolver
class TodoResolver {
  @Mutation()
  async createTodo(@Args() args: CreateTodoArgs) {
    return this.createTodoUseCase.execute(args);
  }
}

// CLI Command
class CreateTodoCommand {
  async run(title: string, description?: string) {
    const todo = await this.createTodoUseCase.execute({ title, description });
    console.log(`Created: ${todo.getId()}`);
  }
}

// Message Queue Consumer
class TodoMessageConsumer {
  async handleCreateMessage(message: CreateTodoMessage) {
    await this.createTodoUseCase.execute(message.data);
  }
}
```

## Architecture Mapping

Here's how traditional layers map to Hexagonal Architecture:

| Traditional Layer | Hexagonal Equivalent | Responsibilities |
|------------------|----------------------|------------------|
| **Controllers** | **Inbound Adapters** | Translate external requests (HTTP, CLI, etc.) to use case calls |
| **Services** | **Application Layer (Use Cases)** | Orchestrate domain objects, coordinate workflows |
| | **Domain Layer (Entities, Value Objects)** | Business rules, domain logic, invariants |
| **Repositories** (interface) | **Output Ports** | Define what the application needs from external systems |
| **Repositories** (implementation) | **Outbound Adapters** | Implement output ports (Database, APIs, etc.) |

## Evolution Path

### Step 1: Identify What You Already Have

Your traditional architecture already has the building blocks:
- ✅ Controllers separating HTTP from business logic
- ✅ Services containing business logic
- ✅ Repository pattern for data access
- ✅ Dependency injection

### Step 2: Split Services into Domain + Application

**Before (Traditional Service):**
```typescript
class TodoService {
  async completeTodo(id: string) {
    const todo = await this.todoRepo.findById(id);
    
    // Business rules mixed with orchestration
    if (todo.status === 'completed') {
      throw new Error('Already completed');
    }
    
    todo.status = 'completed';
    todo.updatedAt = new Date();
    return this.todoRepo.save(todo);
  }
}
```

**After (Domain + Application):**
```typescript
// Domain Entity - business behavior
class Todo {
  complete(): void {
    if (this.status.isCompleted()) {
      throw new Error('Todo is already completed');
    }
    this.status = this.status.complete();
    this.updatedAt = new Date();
  }
}

// Application Use Case - orchestration
class CompleteTodo {
  async execute(command: CompleteTodoCommand): Promise<Todo> {
    const todo = await this.todoRepository.findById(command.id);
    todo.complete(); // Delegate to domain
    return this.todoRepository.save(todo);
  }
}
```

### Step 3: Extract Value Objects

Move validation from services to value objects:

**Before:**
```typescript
class TodoService {
  async createTodo(title: string) {
    if (!title || title.trim().length === 0) {
      throw new Error('Title required');
    }
    if (title.length > 200) {
      throw new Error('Title too long');
    }
    // ...
  }
}
```

**After:**
```typescript
class TodoTitle {
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
}

// Now Todo entity uses TodoTitle
class Todo {
  private title: TodoTitle; // Validation guaranteed
}
```

### Step 4: Make Ports Explicit

Define clear interfaces for use cases and repositories:

**Before:**
```typescript
class TodoService {
  // Methods without explicit contract
  async createTodo(data: any) { }
  async updateTodo(id: string, data: any) { }
}
```

**After:**
```typescript
// Input Ports
interface CreateTodoUseCase {
  execute(command: CreateTodoCommand): Promise<Todo>;
}

interface UpdateTodoUseCase {
  execute(command: UpdateTodoCommand): Promise<Todo>;
}

// Output Ports
interface TodoRepository {
  save(todo: Todo): Promise<Todo>;
  findById(id: string): Promise<Todo | null>;
}
```

### Step 5: Reverse Dependencies

Ensure all dependencies point inward:

```
Before (Layered):
Domain Objects ← Services ← Controllers ← Framework

After (Hexagonal):
Framework → Adapters → Application → Domain
(Dependencies point inward, but control flow goes outward)
```

## Benefits of Going Hexagonal

Your previous approach was already good, but Hexagonal gives you:

### 1. Clearer Boundaries
```typescript
// Explicit ports make contracts obvious
interface CreateTodoUseCase {
  execute(command: CreateTodoCommand): Promise<Todo>;
}
```

### 2. Better Testability
```typescript
// Pure domain is trivial to test - no mocks needed
describe('Todo', () => {
  it('should complete when pending', () => {
    const todo = new Todo({ title: 'Test', status: 'pending' });
    todo.complete();
    expect(todo.isCompleted()).toBe(true);
  });
});

// Use cases easy to test with mock repositories
describe('CreateTodo', () => {
  it('should create todo', async () => {
    const mockRepo = new MockTodoRepository();
    const useCase = new CreateTodo(mockRepo);
    const result = await useCase.execute({ title: 'Test' });
    expect(result.getTitle().getValue()).toBe('Test');
  });
});
```

### 3. More Flexibility
```typescript
// Easy to swap implementations
// In DependencyContainer:
// this._todoRepository = new InMemoryTodoRepository();
// Change to:
// this._todoRepository = new MongoTodoRepository();
// this._todoRepository = new PostgresTodoRepository();
// No other code changes needed!
```

### 4. Richer Models
```typescript
// Instead of anemic data holders
interface Todo {
  id: string;
  title: string;
  status: string;
}

// Rich domain models with behavior
class Todo {
  complete(): void { /* business logic */ }
  reopen(): void { /* business logic */ }
  updateTitle(title: string): void { /* business logic */ }
}
```

### 5. Framework Independence
```typescript
// Core logic completely decoupled from Express
// Can easily switch to:
// - Fastify
// - Koa
// - NestJS
// - AWS Lambda
// - Message Queue Consumer
// - CLI
// Without changing business logic
```

### 6. Multiple Interfaces
```typescript
// Same use case works with:
// - REST API (TodoController)
// - GraphQL (TodoResolver)
// - CLI (TodoCommand)
// - Message Queue (TodoConsumer)
// - WebSocket (TodoHandler)
```

## Conclusion

Think of Hexagonal Architecture as a **refinement and formalization** of the layered thinking you were already doing! 

The key insight is not just about layers, but about:
- **Dependency direction** (inward toward domain)
- **Explicit boundaries** (ports and adapters)
- **Rich domain models** (behavior, not just data)
- **Framework independence** (core logic isolated)

If you're already using Controllers, Services, and Repositories, you're 80% of the way there. The remaining 20% is about refining where business logic lives and making boundaries explicit.

## Further Reading

- [Hexagonal Architecture Documentation](./ARCHITECTURE.md) - Full documentation of this project's architecture
- [Original paper by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)


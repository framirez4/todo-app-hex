# MongoDB Native Driver vs Mongoose: An Architectural Decision

## Decision: Use Native MongoDB Driver

This project uses the **native MongoDB Node.js driver** instead of Mongoose ODM. This document explains the rationale behind this architectural decision.

## Context

We have a TypeScript application following **Hexagonal Architecture** principles with:
- Rich domain entities with business logic
- Value objects with built-in validation
- Clean separation between domain and persistence layers
- Swappable adapters (repository implementations)

## The Question

Should we use Mongoose ODM given that we're working with TypeScript classes and MongoDB?

## The Answer: No, Stick with Native Driver

### Current Strengths of Our Implementation

1. **Rich Domain Entities** - Our `Todo` class contains business logic
2. **Value Objects** - `TodoTitle`, `TodoStatus`, `TodoId` with built-in validation
3. **Clean Separation** - Domain logic is completely independent of persistence
4. **Thin Adapters** - Our repository adapter is focused solely on data mapping

## Why Mongoose Doesn't Fit Well Here

### 1. Duplication of Domain Logic

With our current architecture:

```typescript
// Domain Layer (src/domain/entities/Todo.ts)
class Todo {
  private title: TodoTitle;  // Already validates (max 200 chars, non-empty)
  private status: TodoStatus; // Already validates (PENDING/COMPLETED)
  
  public complete(): void {
    if (this.status.isCompleted()) {
      throw new Error('Todo is already completed');
    }
    this.status = this.status.complete();
    this.updatedAt = new Date();
  }
  
  // More business methods: reopen(), updateTitle(), etc.
}
```

With Mongoose, we would need to duplicate this:

```typescript
// Mongoose Schema (would be redundant)
const todoSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  status: { type: String, enum: ['PENDING', 'COMPLETED'] }
});

// But where does the business logic go?
// Mongoose models? Then we've moved domain logic into the adapter!
// Keep it in Todo? Then the schema validation is redundant!
```

**Problem**: We'd have validation and rules in two places, violating DRY and creating maintenance burden.

### 2. Architectural Purity

Our current adapter is beautifully thin and focused:

```typescript
// src/adapters/outbound/MongoTodoRepository.ts
export class MongoTodoRepository implements TodoRepository {
  private toDocument(todo: Todo): TodoDocument {
    // Simple mapping from domain to persistence
  }
  
  private toDomain(document: TodoDocument): Todo {
    // Simple mapping from persistence to domain
    // Domain entity handles all validation and logic
  }
}
```

**With Mongoose**, we'd be tempted to:
- Add business logic to Mongoose models (wrong layer!)
- Duplicate validation between domain and schema
- Create tight coupling to MongoDB-specific features

**Current approach**: The adapter is just a translator. It doesn't know about business rules.

### 3. Testability

**Native Driver Approach:**
```typescript
// Easy to mock
const mockCollection = {
  findOne: jest.fn().mockResolvedValue(mockDocument),
  insertOne: jest.fn()
};
```

**Mongoose Approach:**
- Need to mock Mongoose models
- More complex test setup
- Schema compilation in tests
- Harder to isolate unit tests

### 4. Flexibility & Future-Proofing

If we decide to switch from MongoDB to PostgreSQL, DynamoDB, or any other storage:

**With Native Driver:**
- Create new `PostgresTodoRepository`
- Implement the same `TodoRepository` interface
- Domain layer remains untouched
- Zero changes to business logic

**With Mongoose:**
- More MongoDB-specific code to untangle
- Schema definitions tied to MongoDB
- Harder migration path

### 5. Performance & Control

**Native Driver:**
- Direct control over queries
- No ODM overhead
- Explicit data mapping
- Clear performance characteristics

**Mongoose:**
- ODM layer adds overhead
- "Magic" behind the scenes (middleware, virtuals)
- Less explicit about what's happening

## When Mongoose WOULD Make Sense

Use Mongoose if you:

❌ **Don't have rich domain entities** (you do!)  
❌ **Need ODM features** like population, virtuals, middleware (you don't!)  
❌ **Want database-level validation** as your primary validation (yours is in the domain!)  
❌ **Are building a simple CRUD app** without hexagonal architecture  
✅ **Don't care about hexagonal architecture principles**  
✅ **Want rapid prototyping** without architectural concerns  

## Our Approach: Domain-Driven Design

```
┌─────────────────────────────────────────────────┐
│           Domain Layer (Core)                   │
│  ┌──────────────────────────────────────┐      │
│  │ Todo Entity                           │      │
│  │ - Business Logic                      │      │
│  │ - Validation (via Value Objects)      │      │
│  │ - State Management                    │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
                    ▲
                    │ (depends on)
                    │
┌─────────────────────────────────────────────────┐
│         Application Layer (Use Cases)           │
│  ┌──────────────────────────────────────┐      │
│  │ TodoRepository Interface (Port)       │      │
│  │ - save(todo: Todo)                    │      │
│  │ - findById(id: string)                │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
                    ▲
                    │ (implements)
                    │
┌─────────────────────────────────────────────────┐
│         Adapter Layer (Infrastructure)          │
│  ┌──────────────────────────────────────┐      │
│  │ MongoTodoRepository (Adapter)         │      │
│  │ - Native MongoDB driver               │      │
│  │ - Thin mapping layer                  │      │
│  │ - No business logic                   │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
```

**Key Insight**: Our TypeScript classes in the domain layer ARE our models. We don't need an ODM to give us models - we already have them, and they're in the right place!

## Benefits of Our Current Approach

✅ **Single Source of Truth** - Business rules live in one place (domain)  
✅ **Clean Architecture** - Adapters are thin and swappable  
✅ **Easy Testing** - Domain logic tests don't need database mocks  
✅ **Framework Independence** - Not tied to Mongoose specifics  
✅ **Clear Boundaries** - Easy to understand what each layer does  
✅ **Maintainable** - Changes to business logic don't affect persistence  
✅ **Explicit** - No "magic" - you see exactly what's happening  

## Example: How It Works

### Creating a Todo

```typescript
// 1. Controller receives HTTP request
POST /api/todos { "title": "Buy milk" }

// 2. Use Case coordinates (Application Layer)
const todo = new Todo({ title: "Buy milk" });  // Domain validation happens here!

// 3. Repository saves (Adapter Layer)
const document = this.toDocument(todo);  // Just mapping
await this.collection.insertOne(document);  // Simple MongoDB operation

// 4. Return domain entity
return this.toDomain(document);
```

No Mongoose schemas, no middleware, no hooks. Just clean, explicit code.

## Conclusion

For a **hexagonal architecture** with **rich domain models**, the native MongoDB driver is the better choice because:

1. It keeps the adapter layer thin
2. It avoids duplication of validation and business logic
3. It maintains architectural purity
4. It's easier to test and maintain
5. It provides flexibility to change databases in the future

**Mongoose is an excellent library**, but it's designed for applications where the database schema IS the model. In our architecture, **our domain entities are the models**, and we just need a simple way to persist them.

## Alternative: If You Really Need Mongoose

If you have specific requirements for Mongoose features (transactions, change streams, advanced querying), you can still use it while maintaining clean architecture:

1. Keep domain entities separate
2. Use Mongoose ONLY in the adapter layer
3. Map between Mongoose documents and domain entities
4. Never let Mongoose models leak into use cases or domain

But ask yourself: **Do you really need those features?** Often, the native driver with clean architecture is simpler and more maintainable.

---

**Remember**: The goal isn't to avoid Mongoose dogmatically. The goal is to maintain architectural purity and avoid duplication. In this case, the native driver serves our needs perfectly.


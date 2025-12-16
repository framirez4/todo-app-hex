# Todo App - Hexagonal Architecture

A well-structured Todo application built with TypeScript and Express, following **Hexagonal Architecture** (also known as Ports and Adapters) principles.

## 🏗️ Architecture Overview

This project implements **Hexagonal Architecture** to achieve:
- **Separation of Concerns**: Business logic is independent of external frameworks and delivery mechanisms
- **Testability**: Core business logic can be tested without external dependencies
- **Flexibility**: Easy to swap implementations (e.g., replace in-memory storage with a database)
- **Maintainability**: Clear boundaries between layers

### Architecture Layers

```
src/
├── domain/                    # Core business logic (entities, value objects)
│   ├── entities/             # Business entities
│   ├── value-objects/        # Value objects (immutable domain concepts)
│   └── exceptions/           # Domain-specific exceptions
│
├── application/               # Application business rules
│   ├── ports/                # Interfaces (contracts)
│   │   ├── *UseCase.ts      # Input ports (what the app can do)
│   │   └── *Repository.ts   # Output ports (what the app needs)
│   └── use-cases/            # Use case implementations
│
├── adapters/                  # External interface implementations
│   ├── inbound/              # Input adapters (API, CLI, etc.)
│   │   ├── TodoController.ts # REST API controller
│   │   └── TodoRoutes.ts     # Route definitions
│   └── outbound/             # Output adapters (Database, external services)
│       └── InMemoryTodoRepository.ts
│
└── infrastructure/            # Application setup and DI
    ├── DependencyContainer.ts # Dependency injection
    └── ExpressApp.ts         # Express app configuration
```

### Key Concepts

- **Domain Layer**: Contains the business logic and rules. No dependencies on external frameworks.
- **Application Layer**: Orchestrates the domain layer. Defines ports (interfaces) for external systems.
- **Adapters**: Concrete implementations of ports. Can be easily swapped without affecting core logic.
- **Infrastructure**: Wires everything together using dependency injection.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Build the project
npm run build

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## 📚 API Endpoints

### Health Check
```bash
GET /health
```

### Todo Endpoints

#### Create a Todo
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

#### Get All Todos
```bash
GET /api/todos
```

#### Get a Specific Todo
```bash
GET /api/todos/:id
```

#### Update a Todo
```bash
PUT /api/todos/:id
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description"
}
```

#### Complete a Todo
```bash
PATCH /api/todos/:id/complete
```

#### Delete a Todo
```bash
DELETE /api/todos/:id
```

## 🧪 Example Usage

### Using cURL

```bash
# Create a todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Hexagonal Architecture", "description": "Study the principles"}'

# List all todos
curl http://localhost:3000/api/todos

# Complete a todo (replace {id} with actual id)
curl -X PATCH http://localhost:3000/api/todos/{id}/complete

# Delete a todo
curl -X DELETE http://localhost:3000/api/todos/{id}
```

## 🎯 Domain Model

### Entities

- **Todo**: The main domain entity with business logic for managing a todo item

### Value Objects

- **TodoId**: Unique identifier for a todo
- **TodoTitle**: Todo title with validation (required, max 200 characters)
- **TodoStatus**: Todo status (PENDING, COMPLETED)

### Business Rules

1. A todo must have a non-empty title
2. Title cannot exceed 200 characters
3. A todo cannot be completed twice
4. A pending todo cannot be reopened

## 🔄 Adding a New Adapter

One of the main benefits of hexagonal architecture is the ability to easily swap implementations. Here's how to add a database adapter:

### Example: Adding MongoDB Repository

1. Create the adapter:
```typescript
// src/adapters/outbound/MongoTodoRepository.ts
export class MongoTodoRepository implements TodoRepository {
  // Implement all TodoRepository methods
  async save(todo: Todo): Promise<Todo> { /* ... */ }
  async findById(id: string): Promise<Todo | null> { /* ... */ }
  // ... other methods
}
```

2. Update the dependency container:
```typescript
// src/infrastructure/DependencyContainer.ts
// Replace:
this._todoRepository = new InMemoryTodoRepository();
// With:
this._todoRepository = new MongoTodoRepository();
```

That's it! No changes needed to the domain or application layers.

## 🏛️ Design Principles Applied

- **Dependency Inversion Principle (DIP)**: Core logic depends on abstractions (ports), not concrete implementations
- **Single Responsibility Principle (SRP)**: Each class has one reason to change
- **Open/Closed Principle (OCP)**: Open for extension (new adapters) but closed for modification (core logic)
- **Interface Segregation Principle (ISP)**: Small, focused interfaces (one use case per interface)

## 📦 Tech Stack

- **TypeScript**: Type-safe JavaScript
- **Express**: Web framework for the REST API
- **Node.js**: Runtime environment

## 🧩 Benefits of This Architecture

1. **Framework Independence**: Core business logic doesn't depend on Express or any framework
2. **Database Independence**: Can switch from in-memory to SQL/NoSQL without touching business logic
3. **Testability**: Easy to test business logic in isolation
4. **UI Independence**: Can add multiple UIs (REST API, GraphQL, CLI, etc.) without changing core logic
5. **Maintainability**: Clear boundaries and responsibilities

## 📝 License

ISC

## 👨‍💻 Development

### Project Structure Philosophy

This project follows the principle of **dependency direction**: dependencies point inward.

```
Adapters → Application → Domain
```

- **Domain** has no dependencies
- **Application** depends only on Domain
- **Adapters** depend on Application and Domain
- **Infrastructure** depends on everything (wires it all together)

This ensures that business logic remains pure and testable!


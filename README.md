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
│       ├── InMemoryTodoRepository.ts # In-memory implementation
│       └── MongoTodoRepository.ts    # MongoDB implementation
│
└── infrastructure/            # Application setup and DI
    ├── Config.ts             # Configuration management
    ├── DependencyContainer.ts # Dependency injection
    ├── ExpressApp.ts         # Express app configuration
    └── MongoDBClient.ts      # MongoDB connection manager
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
- MongoDB (optional - can use in-memory storage for development)

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

The application supports both **in-memory** storage and **MongoDB** persistence. Configuration is managed through environment variables.

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:

**Option 1: In-Memory Storage (Default for development)**
```env
USE_IN_MEMORY_DB=true
PORT=3000
```

**Option 2: MongoDB Storage**
```env
USE_IN_MEMORY_DB=false
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=todo-app
PORT=3000
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGO_DB_NAME=todo-app
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

**Note**: If using MongoDB, make sure MongoDB is running before starting the application.

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

## 🔄 Swapping Adapters

One of the main benefits of hexagonal architecture is the ability to easily swap implementations. This project includes **two repository implementations**:

### 1. In-Memory Repository
- Perfect for development and testing
- No external dependencies required
- Data is lost when the application restarts

### 2. MongoDB Repository
- Persistent storage
- Production-ready
- Requires MongoDB connection

**The active adapter is selected automatically** based on the `USE_IN_MEMORY_DB` environment variable. No code changes are needed!

```typescript
// src/infrastructure/DependencyContainer.ts
if (this._config.useInMemoryDb) {
  this._todoRepository = new InMemoryTodoRepository();
} else {
  this._todoRepository = new MongoTodoRepository(this._mongoClient);
}
```

### Adding Another Adapter (e.g., PostgreSQL)

1. Create a new adapter:
```typescript
// src/adapters/outbound/PostgresTodoRepository.ts
export class PostgresTodoRepository implements TodoRepository {
  // Implement all TodoRepository methods
  async save(todo: Todo): Promise<Todo> { /* ... */ }
  async findById(id: string): Promise<Todo | null> { /* ... */ }
  // ... other methods
}
```

2. Update the dependency container to include the new option
3. That's it! No changes needed to the domain or application layers.

## 🏛️ Design Principles Applied

- **Dependency Inversion Principle (DIP)**: Core logic depends on abstractions (ports), not concrete implementations
- **Single Responsibility Principle (SRP)**: Each class has one reason to change
- **Open/Closed Principle (OCP)**: Open for extension (new adapters) but closed for modification (core logic)
- **Interface Segregation Principle (ISP)**: Small, focused interfaces (one use case per interface)

## 📦 Tech Stack

- **TypeScript**: Type-safe JavaScript
- **Express**: Web framework for the REST API
- **Node.js**: Runtime environment
- **MongoDB**: NoSQL database (optional, with in-memory fallback)
- **dotenv**: Environment variable management

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


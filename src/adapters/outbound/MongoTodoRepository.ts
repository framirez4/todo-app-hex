import { Collection, ObjectId } from 'mongodb';
import { Todo, TodoProps } from '../../domain/entities/Todo';
import { TodoRepository } from '../../application/ports/TodoRepository';
import { MongoDBClient } from '../../infrastructure/MongoDBClient';

/**
 * MongoDB document interface
 * Represents how todos are stored in MongoDB
 */
interface TodoDocument {
  _id?: ObjectId;
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Outbound Adapter - MongoDB implementation of TodoRepository
 * Implements the repository port using MongoDB for persistence
 */
export class MongoTodoRepository implements TodoRepository {
  private collection: Collection<TodoDocument>;
  private readonly collectionName = 'todos';

  constructor(mongoClient: MongoDBClient) {
    const db = mongoClient.getDatabase();
    this.collection = db.collection<TodoDocument>(this.collectionName);
  }

  /**
   * Initialize indexes (call after construction)
   */
  public async init(): Promise<void> {
    await this.ensureIndexes();
  }

  /**
   * Create indexes for better query performance
   */
  private async ensureIndexes(): Promise<void> {
    try {
      await this.collection.createIndex({ id: 1 }, { unique: true });
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ createdAt: -1 });
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  /**
   * Convert domain entity to MongoDB document
   */
  private toDocument(todo: Todo): TodoDocument {
    const todoData = todo.toObject();
    return {
      id: todoData.id!,
      title: todoData.title,
      description: todoData.description || '',
      status: todoData.status!,
      createdAt: todoData.createdAt!,
      updatedAt: todoData.updatedAt!
    };
  }

  /**
   * Convert MongoDB document to domain entity
   */
  private toDomain(document: TodoDocument): Todo {
    const props: TodoProps = {
      id: document.id,
      title: document.title,
      description: document.description,
      status: document.status as any,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    };
    return new Todo(props);
  }

  async save(todo: Todo): Promise<Todo> {
    const document = this.toDocument(todo);
    
    await this.collection.insertOne(document);
    
    return this.toDomain(document);
  }

  async findById(id: string): Promise<Todo | null> {
    const document = await this.collection.findOne({ id });
    
    if (!document) {
      return null;
    }
    
    return this.toDomain(document);
  }

  async findAll(): Promise<Todo[]> {
    const documents = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    return documents.map(doc => this.toDomain(doc));
  }

  async update(todo: Todo): Promise<Todo> {
    const document = this.toDocument(todo);
    const id = document.id;
    
    const result = await this.collection.updateOne(
      { id },
      { 
        $set: {
          title: document.title,
          description: document.description,
          status: document.status,
          updatedAt: document.updatedAt
        }
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error(`Todo with id ${id} not found`);
    }
    
    return this.toDomain(document);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }
}


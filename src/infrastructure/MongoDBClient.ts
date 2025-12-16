import { MongoClient, Db } from 'mongodb';

/**
 * MongoDB Connection Manager
 * Handles connection lifecycle and provides database access
 */
export class MongoDBClient {
  private static instance: MongoDBClient;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private readonly uri: string;
  private readonly dbName: string;

  private constructor(uri: string, dbName: string) {
    this.uri = uri;
    this.dbName = dbName;
  }

  public static getInstance(uri?: string, dbName?: string): MongoDBClient {
    if (!MongoDBClient.instance) {
      if (!uri || !dbName) {
        throw new Error('MongoDB URI and database name are required for first initialization');
      }
      MongoDBClient.instance = new MongoDBClient(uri, dbName);
    }
    return MongoDBClient.instance;
  }

  public async connect(): Promise<void> {
    if (this.client) {
      console.log('MongoDB client already connected');
      return;
    }

    try {
      console.log('Connecting to MongoDB...');
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  public getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }
    return this.db;
  }

  public isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }
}


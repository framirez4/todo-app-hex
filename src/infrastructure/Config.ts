import dotenv from '@dotenvx/dotenvx';

// Load environment variables from .env file
dotenv.config();

/**
 * Application Configuration
 * Centralizes all configuration management
 */
export class Config {
  private static instance: Config;

  public readonly port: number;
  public readonly mongoUri: string;
  public readonly mongoDbName: string;
  public readonly nodeEnv: string;
  public readonly useInMemoryDb: boolean;

  private constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    this.mongoDbName = process.env.MONGO_DB_NAME || 'todo-app';
    this.nodeEnv = process.env.NODE_ENV || 'development';
    
    // Use in-memory DB if explicitly set or if MongoDB URI is not configured
    this.useInMemoryDb = process.env.USE_IN_MEMORY_DB === 'true' || 
                         process.env.MONGO_URI === undefined;
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public validate(): void {
    if (!this.useInMemoryDb && !this.mongoUri) {
      throw new Error('MONGO_URI is required when not using in-memory database');
    }
  }

  public getInfo(): string {
    return `
Configuration:
- Port: ${this.port}
- Node Environment: ${this.nodeEnv}
- Database: ${this.useInMemoryDb ? 'In-Memory' : 'MongoDB'}
${!this.useInMemoryDb ? `- MongoDB URI: ${this.mongoUri}\n- MongoDB Database: ${this.mongoDbName}` : ''}
    `.trim();
  }
}


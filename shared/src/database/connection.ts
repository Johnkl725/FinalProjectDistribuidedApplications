// ===============================================
// DATABASE CONNECTION - SINGLETON PATTERN
// ===============================================

import { Pool, PoolClient, QueryResult } from 'pg';

/**
 * DatabaseConnection - Singleton Pattern
 * Ensures only one database connection pool exists throughout the application
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    // Si existe DATABASE_URL, usarla directamente (para Render/producción)
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: this.getSSLConfig(),
      });
    } else {
      // Fallback a variables individuales (para desarrollo)
      this.pool = new Pool({
        host: process.env.DB_HOST || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'insurance_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: this.getSSLConfig(),
      });
    }

    this.pool.on('connect', () => {
      console.log('✅ Database connection established');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Unexpected database error:', err);
    });
  }

  /**
   * Get SSL configuration based on environment variables
   */
  private getSSLConfig(): boolean | { rejectUnauthorized: boolean } {
    // Check DB_SSL environment variable first
    if (process.env.DB_SSL !== undefined) {
      const dbSSL = process.env.DB_SSL.toLowerCase();
      if (dbSSL === 'false' || dbSSL === '0' || dbSSL === 'no') {
        console.log('🔓 SSL disabled for database connection (DB_SSL=false)');
        return false;
      }
    }

    // Default: Use SSL in production, no SSL in development
    if (process.env.NODE_ENV === 'production') {
      console.log('🔒 SSL enabled for database connection (production mode)');
      return { rejectUnauthorized: false };
    }

    console.log('🔓 SSL disabled for database connection (development mode)');
    return false;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Get the connection pool
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Execute a query
   */
  public async query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      console.log(`📊 Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
      return result;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  /**
   * Get a client from the pool (for transactions)
   */
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Close the connection pool
   */
  public async close(): Promise<void> {
    await this.pool.end();
    console.log('🔌 Database connection closed');
  }

  /**
   * Test the database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW()');
      console.log('✅ Database connection test successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance getter
export const getDatabase = () => DatabaseConnection.getInstance();



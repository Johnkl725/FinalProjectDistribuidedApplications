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
    // Connection pool size based on environment
    // Production: 1 connection × 7 services = 7 (ULTRA SAFE - 32% of Render's 22 limit)
    // Development: 5 connections × 7 services = 35
    const maxConnections = process.env.NODE_ENV === 'production' ? 1 : 5;
    
    // Si existe DATABASE_URL, usarla directamente (para Render/producción)
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: maxConnections, // ULTRA REDUCED: 1 per service = 7 total (68% buffer)
        min: 0, // NEVER keep idle connections in production
        idleTimeoutMillis: 10000, // Close idle after 10s (was 20s)
        connectionTimeoutMillis: 5000, // Fail fast if no connection available (was 10s)
        statement_timeout: 15000, // Force kill queries after 15s
        query_timeout: 15000, // Alternative timeout mechanism
        allowExitOnIdle: true, // Allow pool to close when idle
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
    } else {
      // Fallback a variables individuales (para desarrollo)
      this.pool = new Pool({
        host: process.env.DB_HOST || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'insurance_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: maxConnections,
        min: 1,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
    }

    this.pool.on('connect', (client) => {
      console.log('✅ Database connection established');
      
      // Set statement timeout on each new connection
      client.query('SET statement_timeout = 15000').catch((err) => {
        console.error('Failed to set statement_timeout:', err);
      });
    });

    this.pool.on('acquire', () => {
      const poolInfo = {
        total: this.pool.totalCount,
        idle: this.pool.idleCount,
        waiting: this.pool.waitingCount,
      };
      console.log(`🔌 Connection acquired: total=${poolInfo.total}, idle=${poolInfo.idle}, waiting=${poolInfo.waiting}`);
    });

    this.pool.on('release', () => {
      const poolInfo = {
        total: this.pool.totalCount,
        idle: this.pool.idleCount,
        waiting: this.pool.waitingCount,
      };
      console.log(`🔓 Connection released: total=${poolInfo.total}, idle=${poolInfo.idle}, waiting=${poolInfo.waiting}`);
    });

    this.pool.on('remove', () => {
      console.log('🗑️ Connection removed from pool');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Unexpected database error:', err);
    });
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

  /**
   * Get pool status for monitoring
   */
  public getPoolStatus(): {
    total: number;
    idle: number;
    waiting: number;
  } {
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
    };
  }

  /**
   * Force cleanup of idle connections
   */
  public async cleanupIdleConnections(): Promise<void> {
    const status = this.getPoolStatus();
    console.log(`🧹 Cleaning up idle connections: ${status.idle} idle out of ${status.total} total`);
    
    // Pool will automatically clean up based on idleTimeoutMillis
    // This is just for logging/monitoring
  }
}

// Export singleton instance getter
export const getDatabase = () => DatabaseConnection.getInstance();



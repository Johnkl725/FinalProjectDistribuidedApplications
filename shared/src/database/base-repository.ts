// ===============================================
// BASE REPOSITORY - REPOSITORY PATTERN
// ===============================================

import { Pool, QueryResult } from 'pg';
import { DatabaseConnection } from './connection';
import { requestQueue } from '../utils/request-queue';
import { defaultRetryHandler } from '../utils/retry-handler';

/**
 * BaseRepository - Repository Pattern with resilience
 * Abstract class that provides common database operations
 * All specific repositories should extend this class
 * 
 * @principle Single Responsibility - Only handles database operations
 * @principle Dependency Inversion - Depends on abstractions (interfaces)
 * @pattern Repository Pattern - Encapsulates data access logic
 */
export abstract class BaseRepository<T extends Record<string, any>> {
  protected db: DatabaseConnection;
  protected pool: Pool;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = DatabaseConnection.getInstance();
    this.pool = this.db.getPool();
    this.tableName = tableName;
  }

  /**
   * Execute query with retry logic and concurrency control
   * @param queryFn Query function to execute
   * @param context Context name for logging
   * @returns Query result
   */
  protected async executeWithResilience<R>(
    queryFn: () => Promise<R>,
    context: string
  ): Promise<R> {
    return requestQueue.execute(() =>
      defaultRetryHandler.execute(queryFn, `${this.tableName}.${context}`)
    );
  }

  /**
   * Find a record by ID
   */
  async findById(id: number): Promise<T | null> {
    return this.executeWithResilience(async () => {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
      const result = await this.db.query<T>(query, [id]);
      return result.rows[0] || null;
    }, 'findById');
  }

  /**
   * Find all records
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<T[]> {
    return this.executeWithResilience(async () => {
      const query = `SELECT * FROM ${this.tableName} LIMIT $1 OFFSET $2`;
      const result = await this.db.query<T>(query, [limit, offset]);
      return result.rows;
    }, 'findAll');
  }

  /**
   * Find records by a specific condition
   */
  async findBy(column: string, value: any): Promise<T[]> {
    return this.executeWithResilience(async () => {
      const query = `SELECT * FROM ${this.tableName} WHERE ${column} = $1`;
      const result = await this.db.query<T>(query, [value]);
      return result.rows;
    }, 'findBy');
  }

  /**
   * Find one record by a specific condition
   */
  async findOneBy(column: string, value: any): Promise<T | null> {
    return this.executeWithResilience(async () => {
      const query = `SELECT * FROM ${this.tableName} WHERE ${column} = $1 LIMIT 1`;
      const result = await this.db.query<T>(query, [value]);
      return result.rows[0] || null;
    }, 'findOneBy');
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    return this.executeWithResilience(async () => {
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

      const query = `
        INSERT INTO ${this.tableName} (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await this.db.query<T>(query, values);
      return result.rows[0];
    }, 'create');
  }

  /**
   * Update a record by ID
   */
  async update(id: number, data: Partial<T>): Promise<T | null> {
    return this.executeWithResilience(async () => {
      const entries = Object.entries(data);
      const setClause = entries
        .map(([key], index) => `${key} = $${index + 2}`)
        .join(', ');
      const values = entries.map(([, value]) => value);

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE id = $1
        RETURNING *
      `;

      const result = await this.db.query<T>(query, [id, ...values]);
      return result.rows[0] || null;
    }, 'update');
  }

  /**
   * Delete a record by ID
   */
  async delete(id: number): Promise<boolean> {
    return this.executeWithResilience(async () => {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
      const result = await this.db.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    }, 'delete');
  }

  /**
   * Count total records
   */
  async count(): Promise<number> {
    return this.executeWithResilience(async () => {
      const query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const result = await this.db.query<{ count: string }>(query);
      return parseInt(result.rows[0].count);
    }, 'count');
  }

  /**
   * Execute a custom query with resilience
   */
  async executeQuery<R extends Record<string, any> = any>(
    query: string, 
    params?: any[]
  ): Promise<QueryResult<R>> {
    return this.executeWithResilience(
      () => this.db.query<R>(query, params),
      'executeQuery'
    );
  }

  /**
   * Check if a record exists
   */
  async exists(column: string, value: any): Promise<boolean> {
    return this.executeWithResilience(async () => {
      const query = `SELECT EXISTS(SELECT 1 FROM ${this.tableName} WHERE ${column} = $1)`;
      const result = await this.db.query<{ exists: boolean }>(query, [value]);
      return result.rows[0].exists;
    }, 'exists');
  }
}



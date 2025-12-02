// ===============================================
// USER REPOSITORY - DATA ACCESS LAYER
// ===============================================

import { BaseRepository } from 'shared';
import { User } from '../models/user.model';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOneBy('email', email);
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    return this.exists('email', email);
  }

  /**
   * Create new user
   */
  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    return this.create(userData);
  }

  /**
   * Update user
   */
  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    return this.update(id, userData);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    const query = 'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC';
    const result = await this.executeQuery<User>(query);
    return result.rows;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: number): Promise<boolean> {
    const result = await this.update(id, { is_active: false } as Partial<User>);
    return result !== null;
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await this.delete(id);
    return result;
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const query = `
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
        COUNT(CASE WHEN role = 'employee' THEN 1 END) as employees,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
      FROM users
    `;
    const result = await this.executeQuery(query);
    return result.rows[0];
  }
}



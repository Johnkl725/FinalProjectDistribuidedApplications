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
    const query = `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.department_id,
        u.phone,
        u.is_active,
        u.created_at
      FROM users u
      ORDER BY u.created_at DESC
    `;
    const result = await this.executeQuery<User>(query);
    return result.rows;
  }

  /**
   * Get employees with department info
   */
  async getEmployeesWithDepartment(): Promise<any[]> {
    const query = `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.department_id,
        u.phone,
        u.is_active,
        u.created_at,
        d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role = 'employee'
      ORDER BY u.created_at DESC
    `;
    const result = await this.executeQuery(query);
    return result.rows;
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(departmentId: number): Promise<User[]> {
    const query = `
      SELECT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.department_id,
        u.phone,
        u.is_active,
        u.created_at
      FROM users u
      WHERE u.role = 'employee' AND u.department_id = $1
      ORDER BY u.first_name ASC
    `;
    const result = await this.executeQuery<User>(query, [departmentId]);
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



// ===============================================
// DEPARTMENT REPOSITORY - DATA ACCESS LAYER
// ===============================================

import { BaseRepository } from 'shared';
import { Department } from '../models/user.model';

export class DepartmentRepository extends BaseRepository<Department> {
  constructor() {
    super('departments');
  }

  /**
   * Get all active departments
   */
  async getAllActiveDepartments(): Promise<Department[]> {
    const query = 'SELECT * FROM departments WHERE is_active = true ORDER BY name ASC';
    const result = await this.executeQuery<Department>(query);
    return result.rows;
  }

  /**
   * Get department by name
   */
  async findByName(name: string): Promise<Department | null> {
    return this.findOneBy('name', name);
  }

  /**
   * Create new department
   */
  async createDepartment(data: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> {
    return this.create(data);
  }

  /**
   * Update department
   */
  async updateDepartment(id: number, data: Partial<Department>): Promise<Department | null> {
    return this.update(id, data);
  }

  /**
   * Get employees count by department
   */
  async getEmployeeCountByDepartment() {
    const query = `
      SELECT
        d.id,
        d.name,
        d.description,
        COUNT(u.id) as employee_count
      FROM departments d
      LEFT JOIN users u ON d.id = u.department_id AND u.role = 'employee' AND u.is_active = true
      WHERE d.is_active = true
      GROUP BY d.id, d.name, d.description
      ORDER BY d.name ASC
    `;
    const result = await this.executeQuery(query);
    return result.rows;
  }
}

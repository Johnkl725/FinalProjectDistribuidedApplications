// ===============================================
// AUTH SERVICE - BUSINESS LOGIC LAYER
// ===============================================

import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRegistration, UserLogin, UserResponse } from '../models/user.model';
import { generateToken, JWTPayload } from 'shared';
import { isValidEmail, isValidPassword } from 'shared';

const SALT_ROUNDS = 10;

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Register a new user
   */
  async register(userData: UserRegistration): Promise<{ user: UserResponse; token: string }> {
    // Validate email
    if (!isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    if (!isValidPassword(userData.password)) {
      throw new Error('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create user
    const newUser = await this.userRepository.createUser({
      email: userData.email.toLowerCase(),
      password_hash: passwordHash,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role || 'customer',
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id!,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: this.sanitizeUser(newUser),
      token,
    };
  }

  /**
   * Login user
   */
  async login(credentials: UserLogin): Promise<{ user: UserResponse; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(credentials.email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash!);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id!,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.userRepository.getAllUsers();
    return users.map(user => this.sanitizeUser(user));
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, updates: Partial<User>): Promise<UserResponse> {
    // Prevent updating sensitive fields
    const allowedUpdates = {
      first_name: updates.first_name,
      last_name: updates.last_name,
    };

    const updatedUser = await this.userRepository.updateUser(userId, allowedUpdates);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Change password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash!);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      throw new Error('New password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await this.userRepository.updateUser(userId, { password_hash: passwordHash });
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: number): Promise<void> {
    const success = await this.userRepository.deactivateUser(userId);
    if (!success) {
      throw new Error('Failed to deactivate user');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    return await this.userRepository.getUserStats();
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: number, role: 'customer' | 'employee' | 'admin'): Promise<UserResponse> {
    const updatedUser = await this.userRepository.updateUser(userId, { role });
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(updatedUser);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.deleteUser(userId);
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: User): UserResponse {
    return {
      id: user.id!,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: user.created_at!,
    };
  }
}



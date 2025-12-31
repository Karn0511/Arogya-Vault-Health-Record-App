import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '@models/user.model';

/**
 * User repository interface - abstracts backend implementation
 * Can be implemented with Firebase, NestJS/PostgreSQL, or any other backend
 */
export interface IUserRepository {
  /**
   * Get user by ID
   */
  getById(userId: string): Observable<User | null>;

  /**
   * Get user by email
   */
  getByEmail(email: string): Observable<User | null>;

  /**
   * Get user by phone
   */
  getByPhone(phone: string): Observable<User | null>;

  /**
   * Create a new user
   */
  create(user: CreateUserDto): Observable<User>;

  /**
   * Update existing user
   */
  update(userId: string, updates: UpdateUserDto): Observable<User>;

  /**
   * Delete user
   */
  delete(userId: string): Observable<void>;

  /**
   * Get all doctors (for admin/patient use)
   */
  getDoctors(filters?: { specialization?: string; verified?: boolean }): Observable<User[]>;

  /**
   * Get all users (admin only)
   */
  getAll(filters?: { role?: string; limit?: number; offset?: number }): Observable<User[]>;

  /**
   * Update doctor verification status (admin only)
   */
  updateDoctorVerificationStatus(
    doctorId: string,
    status: string,
    adminNotes?: string
  ): Observable<void>;
}


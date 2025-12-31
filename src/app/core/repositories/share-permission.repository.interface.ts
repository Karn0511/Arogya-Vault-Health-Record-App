import { Observable } from 'rxjs';
import {
  SharePermission,
  CreateSharePermissionDto,
  ShareLink,
} from '@models/share-permission.model';

/**
 * Share Permission repository interface
 */
export interface ISharePermissionRepository {
  /**
   * Get share permission by ID
   */
  getById(shareId: string): Observable<SharePermission | null>;

  /**
   * Get all active shares for a patient
   */
  getByPatientId(patientId: string): Observable<SharePermission[]>;

  /**
   * Get all shares where doctor has access
   */
  getByDoctorId(doctorId: string): Observable<SharePermission[]>;

  /**
   * Create a new share permission
   */
  create(patientId: string, dto: CreateSharePermissionDto): Observable<SharePermission>;

  /**
   * Revoke a share permission
   */
  revoke(shareId: string, revokedBy: string): Observable<void>;

  /**
   * Get share by access code (for link/QR-based access)
   */
  getByAccessCode(accessCode: string): Observable<SharePermission | null>;

  /**
   * Validate and increment access count
   */
  validateAndIncrementAccess(shareId: string): Observable<boolean>;

  /**
   * Generate shareable link with QR code
   */
  generateShareLink(shareId: string): Observable<ShareLink>;

  /**
   * Clean up expired shares (background job)
   */
  cleanupExpired(): Observable<number>;
}


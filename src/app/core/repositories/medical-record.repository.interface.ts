import { Observable } from 'rxjs';
import {
  MedicalRecord,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  RecordFilter,
} from '@models/medical-record.model';

/**
 * Medical Records repository interface
 */
export interface IMedicalRecordRepository {
  /**
   * Get record by ID
   */
  getById(recordId: string): Observable<MedicalRecord | null>;

  /**
   * Get all records for a patient
   */
  getByPatientId(patientId: string, filter?: RecordFilter): Observable<MedicalRecord[]>;

  /**
   * Create a new medical record
   */
  create(patientId: string, record: CreateMedicalRecordDto): Observable<MedicalRecord>;

  /**
   * Update existing record
   */
  update(recordId: string, updates: UpdateMedicalRecordDto): Observable<MedicalRecord>;

  /**
   * Delete record
   */
  delete(recordId: string): Observable<void>;

  /**
   * Upload file for a record
   */
  uploadFile(file: File, recordId: string): Observable<{ url: string; fileName: string }>;

  /**
   * Download file for a record
   */
  downloadFile(fileUrl: string): Observable<Blob>;

  /**
   * Search records (with full-text search if available)
   */
  search(patientId: string, query: string): Observable<MedicalRecord[]>;
}


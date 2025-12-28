export enum RecordType {
  PRESCRIPTION = 'PRESCRIPTION',
  LAB_REPORT = 'LAB_REPORT',
  IMAGING = 'IMAGING',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  VACCINATION = 'VACCINATION',
  CONSULTATION_NOTE = 'CONSULTATION_NOTE',
  OTHER = 'OTHER',
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  uploadedByUserRole: string;

  recordType: RecordType;
  title: string;
  description?: string;

  // File storage
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;

  // Encryption (if client-side encrypted)
  isEncrypted: boolean;
  encryptedBlob?: string;

  // Metadata
  recordDate: Date;
  hospitalName?: string;
  doctorName?: string;
  tags: string[];

  // Sensitivity flag
  isSensitive: boolean;

  // Audit
  createdAt: Date;
  updatedAt: Date;

  // OCR/AI extracted data (future enhancement)
  extractedData?: Record<string, unknown>;
}

export interface CreateMedicalRecordDto {
  recordType: RecordType;
  title: string;
  description?: string;
  file?: File;
  recordDate: Date;
  hospitalName?: string;
  doctorName?: string;
  tags?: string[];
  isSensitive?: boolean;
}

export interface UpdateMedicalRecordDto {
  title?: string;
  description?: string;
  recordDate?: Date;
  hospitalName?: string;
  doctorName?: string;
  tags?: string[];
  isSensitive?: boolean;
}

export interface RecordFilter {
  type?: RecordType[]; // Alias for recordType for compatibility
  recordType?: RecordType[];
  startDate?: Date; // Alias for dateFrom
  endDate?: Date; // Alias for dateTo
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
  tags?: string[];
  doctorName?: string;
  hospitalName?: string;
  limit?: number;
}

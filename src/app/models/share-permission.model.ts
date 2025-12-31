export enum ShareScope {
  ALL = 'ALL',
  PRESCRIPTIONS = 'PRESCRIPTIONS',
  LAB_REPORTS = 'LAB_REPORTS',
  IMAGING = 'IMAGING',
  DISCHARGE_SUMMARIES = 'DISCHARGE_SUMMARIES',
  VACCINATIONS = 'VACCINATIONS',
  CONSULTATION_NOTES = 'CONSULTATION_NOTES',
}

export enum ShareStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export enum ShareMethod {
  DIRECT = 'DIRECT', // Shared with specific doctor ID
  LINK = 'LINK', // Time-bound secure link
  QR_CODE = 'QR_CODE', // QR code scan
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface SharePermission {
  id: string;
  patientId: string;
  patientName: string;

  // Who has access
  sharedWithDoctorId?: string;
  sharedWithEmail?: string;
  sharedWithPhone?: string;
  sharedWithDoctorName?: string;

  // What data is shared
  scopes: ShareScope[];
  dateRange?: DateRange;
  purpose?: string; // Optional purpose/reason for sharing

  // Access control
  shareMethod: ShareMethod;
  accessCode?: string; // For link/QR-based sharing
  shareLink?: string; // Generated share URL
  qrCodeDataUrl?: string; // QR code data URL
  expiresAt?: Date;
  status: ShareStatus;

  // Usage limits
  maxAccessCount?: number;
  currentAccessCount: number;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  revokedAt?: Date;
  revokedBy?: string;
  lastAccessedAt?: Date;
}

export interface CreateSharePermissionDto {
  sharedWithDoctorId?: string;
  sharedWithEmail?: string;
  sharedWithPhone?: string;
  scopes: ShareScope[];
  dateRange?: DateRange;
  shareMethod: ShareMethod;
  expiresAt?: Date;
  maxAccessCount?: number;
}

export interface ShareLink {
  url: string;
  accessCode: string;
  qrCodeDataUrl?: string;
  expiresAt?: Date;
}

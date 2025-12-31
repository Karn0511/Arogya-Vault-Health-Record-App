export enum AccessAction {
  VIEW = 'VIEW',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  SHARE_CREATED = 'SHARE_CREATED',
  SHARE_REVOKED = 'SHARE_REVOKED',
  SHARE_ACCESSED = 'SHARE_ACCESSED',
  RECORD_CREATED = 'RECORD_CREATED',
  RECORD_UPDATED = 'RECORD_UPDATED',
  RECORD_DELETED = 'RECORD_DELETED',
  LOGIN = 'LOGIN',
  FAILED_LOGIN = 'FAILED_LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;

  patientId?: string;
  recordId?: string;
  sharePermissionId?: string;

  action: AccessAction;
  resourceType?: string;
  resourceId?: string;
  recordType?: string; // Type of medical record accessed
  success?: boolean; // For tracking failed attempts

  // Context
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  deviceInfo?: string;

  // Additional metadata
  metadata?: Record<string, unknown>;

  timestamp: Date;
}

export interface CreateAccessLogDto {
  patientId?: string;
  recordId?: string;
  sharePermissionId?: string;
  action: AccessAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface AccessLogFilter {
  patientId?: string;
  userId?: string;
  action?: AccessAction[];
  resourceType?: string;
  success?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}

import { Injectable } from '@angular/core';
import { AccessLog, AccessAction, AccessLogFilter } from '../../models/access-log.model';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Firestore
} from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccessLogService {
  private firestore = inject(Firestore);
  private logsCollection = collection(this.firestore, 'accessLogs');

  /**
   * Log an access event
   */
  async logAccess(logData: Omit<AccessLog, 'id' | 'timestamp'>): Promise<void> {
    const log: Omit<AccessLog, 'id'> = {
      ...logData,
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo()
    };

    const firestoreData = this.toFirestoreFormat(log);
    await addDoc(this.logsCollection, firestoreData);
  }

  /**
   * Get logs for a specific patient
   */
  async getLogsByPatient(patientId: string, limitCount: number = 50): Promise<AccessLog[]> {
    const q = query(
      this.logsCollection,
      where('patientId', '==', patientId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return this.executeQuery(q);
  }

  /**
   * Get logs for a specific share
   */
  async getLogsByShare(sharePermissionId: string): Promise<AccessLog[]> {
    const q = query(
      this.logsCollection,
      where('sharePermissionId', '==', sharePermissionId),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    return this.executeQuery(q);
  }

  /**
   * Get logs by user
   */
  async getLogsByUser(userId: string, limitCount: number = 50): Promise<AccessLog[]> {
    const q = query(
      this.logsCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return this.executeQuery(q);
  }

  /**
   * Get filtered logs
   */
  async getFilteredLogs(filter: AccessLogFilter): Promise<AccessLog[]> {
    let q = query(this.logsCollection);

    if (filter.userId) {
      q = query(q, where('userId', '==', filter.userId));
    }

    if (filter.patientId) {
      q = query(q, where('patientId', '==', filter.patientId));
    }

    if (filter.action) {
      if (Array.isArray(filter.action)) {
        q = query(q, where('action', 'in', filter.action));
      } else {
        q = query(q, where('action', '==', filter.action));
      }
    }

    if (filter.resourceType) {
      q = query(q, where('resourceType', '==', filter.resourceType));
    }

    if (filter.success !== undefined) {
      q = query(q, where('success', '==', filter.success));
    }

    q = query(q, orderBy('timestamp', 'desc'));

    if (filter.limit) {
      q = query(q, limit(filter.limit));
    }

    return this.executeQuery(q);
  }

  /**
   * Get suspicious activities
   */
  async getSuspiciousActivities(patientId?: string): Promise<AccessLog[]> {
    const logs = patientId 
      ? await this.getLogsByPatient(patientId, 100)
      : await this.getFilteredLogs({ limit: 200 });

    // Filter for suspicious patterns
    return logs.filter(log => {
      // Failed login attempts
      if (log.action === 'FAILED_LOGIN' && !log.success) return true;

      // Multiple accesses in short time
      // Unusual access times
      // Access from unusual locations
      // This is a simplified version - enhance based on requirements

      return false;
    });
  }

  /**
   * Execute query and convert results
   */
  private async executeQuery(q: any): Promise<AccessLog[]> {
    const snapshot = await getDocs(q);
    const logs: AccessLog[] = [];
    
    snapshot.forEach(doc => {
      logs.push(this.fromFirestoreFormat({ id: doc.id, ...doc.data() }));
    });

    return logs;
  }

  /**
   * Get client IP (approximate - requires backend for accurate IP)
   */
  private async getClientIP(): Promise<string | undefined> {
    try {
      // In production, this should be handled by backend
      // This is a placeholder
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  }

  /**
   * Convert to Firestore format
   */
  private toFirestoreFormat(data: any): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) {
        result[key] = serverTimestamp();
      } else if (value === undefined) {
        // Skip undefined values
        continue;
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Convert from Firestore format
   */
  private fromFirestoreFormat(data: any): AccessLog {
    const result: any = { ...data };
    
    for (const [key, value] of Object.entries(result)) {
      if (value && typeof value === 'object' && 'toDate' in value) {
        result[key] = (value as Timestamp).toDate();
      }
    }
    
    return result as AccessLog;
  }

  /**
   * Convenience methods for common log types
   */
  async logRecordView(
    userId: string,
    userName: string,
    userRole: any,
    patientId: string,
    patientName: string,
    recordId: string,
    recordType: string,
    sharePermissionId?: string
  ): Promise<void> {
    await this.logAccess({
      userId,
      userName,
      userRole,
      patientId,
      patientName,
      resourceType: 'RECORD',
      resourceId: recordId,
      recordId,
      recordType,
      sharePermissionId,
      action: 'VIEW',
      success: true
    });
  }

  async logRecordDownload(
    userId: string,
    userName: string,
    userRole: any,
    patientId: string,
    patientName: string,
    recordId: string,
    recordType: string,
    sharePermissionId?: string
  ): Promise<void> {
    await this.logAccess({
      userId,
      userName,
      userRole,
      patientId,
      patientName,
      resourceType: 'RECORD',
      resourceId: recordId,
      recordId,
      recordType,
      sharePermissionId,
      action: 'DOWNLOAD',
      success: true
    });
  }

  async logShareCreated(
    userId: string,
    userName: string,
    patientId: string,
    patientName: string,
    sharePermissionId: string
  ): Promise<void> {
    await this.logAccess({
      userId,
      userName,
      userRole: 'PATIENT',
      patientId,
      patientName,
      resourceType: 'SHARE',
      resourceId: sharePermissionId,
      sharePermissionId,
      action: 'SHARE_CREATED',
      success: true
    });
  }

  async logShareRevoked(
    userId: string,
    userName: string,
    patientId: string,
    patientName: string,
    sharePermissionId: string
  ): Promise<void> {
    await this.logAccess({
      userId,
      userName,
      userRole: 'PATIENT',
      patientId,
      patientName,
      resourceType: 'SHARE',
      resourceId: sharePermissionId,
      sharePermissionId,
      action: 'SHARE_REVOKED',
      success: true
    });
  }

  async logLogin(
    userId: string,
    userName: string,
    userRole: any,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.logAccess({
      userId,
      userName,
      userRole,
      resourceType: 'SYSTEM',
      action: success ? 'LOGIN' : 'FAILED_LOGIN',
      success,
      errorMessage
    });
  }
}

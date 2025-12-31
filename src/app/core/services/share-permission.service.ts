import { Injectable } from '@angular/core';
import qrcode from 'qrcode-generator-es6';
import { SharePermission, ShareScope, ShareStatus } from '../../models/share-permission.model';

// Firebase imports
import { inject } from '@angular/core';
import {
    Firestore,
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
    serverTimestamp
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SharePermissionService {
  private firestore = inject(Firestore);
  private sharesCollection = collection(this.firestore, 'sharePermissions');

  /**
   * Create a new share permission
   */
  async createShare(shareData: Partial<SharePermission>): Promise<SharePermission> {
    // Generate access code (6 digits)
    const accessCode = this.generateAccessCode();

    // Generate share link
    const shareLink = `${window.location.origin}/access/${accessCode}`;

    // Generate QR code (ESM)
    const qr = new (qrcode as unknown as new (typeNumber: number, errorCorrectionLevel: string) => {
      addData(data: string): void;
      make(): void;
      createDataURL(moduleSize: number): string;
    })(0, 'M'); // auto type number, medium error correction
    qr.addData(shareLink);
    qr.make();
    const qrCodeDataUrl = qr.createDataURL(6); // module size ~6px

    const newShare: Omit<SharePermission, 'id'> = {
      ...(shareData as Omit<SharePermission, 'id' | 'accessCode' | 'shareLink' | 'qrCodeDataUrl' | 'currentAccessCount' | 'status'>),
      accessCode,
      shareLink,
      qrCodeDataUrl,
      currentAccessCount: 0,
      status: 'ACTIVE' as ShareStatus,
      createdAt: shareData.createdAt || new Date(),
      updatedAt: new Date()
    };

    // Convert to Firestore format
    const firestoreData = this.toFirestoreFormat(newShare);
    const docRef = await addDoc(this.sharesCollection, firestoreData);

    return {
      id: docRef.id,
      ...newShare
    };
  }

  /**
   * Get shares for a specific patient
   */
  async getSharesByPatient(patientId: string, status?: ShareStatus): Promise<SharePermission[]> {
    let q = query(this.sharesCollection, where('patientId', '==', patientId));

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    const shares: SharePermission[] = [];

    snapshot.forEach((docSnapshot: any) => {
      shares.push(this.fromFirestoreFormat({ id: docSnapshot.id, ...docSnapshot.data() }));
    });

    // Check and update expired shares
    await this.checkAndUpdateExpiredShares(shares);

    return shares.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get shares for a specific doctor
   */
  async getSharesForDoctor(email: string): Promise<SharePermission[]> {
    const q = query(
      this.sharesCollection,
      where('sharedWithEmail', '==', email),
      where('status', '==', 'ACTIVE')
    );

    const snapshot = await getDocs(q);
    const shares: SharePermission[] = [];

    snapshot.forEach((docSnapshot: any) => {
      shares.push(this.fromFirestoreFormat({ id: docSnapshot.id, ...docSnapshot.data() }));
    });

    // Check and update expired shares
    await this.checkAndUpdateExpiredShares(shares);

    return shares.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get share by access code
   */
  async getShareByAccessCode(accessCode: string): Promise<SharePermission | null> {
    const q = query(this.sharesCollection, where('accessCode', '==', accessCode));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const share = this.fromFirestoreFormat({
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    });

    // Check if expired
    if (share.expiresAt && share.expiresAt <= new Date()) {
      await this.expireShare(share.id);
      return null;
    }

    return share;
  }

  /**
   * Get share by ID
   */
  async getShareById(shareId: string): Promise<SharePermission | null> {
    const docRef = doc(this.firestore, 'sharePermissions', shareId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return this.fromFirestoreFormat({ id: docSnap.id, ...docSnap.data() });
  }

  /**
   * Revoke a share
   */
  async revokeShare(shareId: string, reason?: string): Promise<void> {
    const docRef = doc(this.firestore, 'sharePermissions', shareId);
    await updateDoc(docRef, {
      status: 'REVOKED',
      revokedAt: serverTimestamp(),
      revokedReason: reason || 'Revoked by patient',
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Increment access count
   */
  async incrementAccessCount(shareId: string): Promise<void> {
    const share = await this.getShareById(shareId);
    if (!share) return;

    const docRef = doc(this.firestore, 'sharePermissions', shareId);
    await updateDoc(docRef, {
      currentAccessCount: share.currentAccessCount + 1,
      lastAccessedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Check if max access count reached
    if (share.maxAccessCount && share.currentAccessCount + 1 >= share.maxAccessCount) {
      await this.expireShare(shareId);
    }
  }

  /**
   * Expire a share
   */
  private async expireShare(shareId: string): Promise<void> {
    const docRef = doc(this.firestore, 'sharePermissions', shareId);
    await updateDoc(docRef, {
      status: 'EXPIRED',
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Check and update expired shares
   */
  private async checkAndUpdateExpiredShares(shares: SharePermission[]): Promise<void> {
    const now = new Date();
    const expiredShares = shares.filter(
      share => share.status === 'ACTIVE' && share.expiresAt && share.expiresAt <= now
    );

    const updatePromises = expiredShares.map(share => this.expireShare(share.id));
    await Promise.all(updatePromises);
  }

  /**
   * Generate 6-digit access code
   */
  private generateAccessCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Convert to Firestore format (Dates to server timestamps)
   */
  private toFirestoreFormat(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Date) {
        result[key] = serverTimestamp();
      } else if (Array.isArray(value)) {
        result[key] = value;
      } else if (value && typeof value === 'object') {
        result[key] = this.toFirestoreFormat(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Convert from Firestore format (Timestamps to Dates)
   */
  private fromFirestoreFormat(data: Record<string, unknown> & { id: string }): SharePermission {
    const result: Record<string, unknown> = { ...data };

    for (const [key, value] of Object.entries(result)) {
      if (value && typeof value === 'object' && 'toDate' in value) {
        result[key] = (value as any).toDate();
      } else if (Array.isArray(value)) {
        result[key] = value;
      } else if (value && typeof value === 'object') {
        result[key] = this.fromFirestoreFormat(value as Record<string, unknown> & { id: string });
      }
    }

    return result as unknown as SharePermission;
  }

  /**
   * Validate share access
   */
  async validateAccess(
    shareId: string,
    requestedScope?: ShareScope,
    recordDate?: Date
  ): Promise<{ valid: boolean; message?: string }> {
    const share = await this.getShareById(shareId);

    if (!share) {
      return { valid: false, message: 'Share not found' };
    }

    if (share.status !== 'ACTIVE') {
      return { valid: false, message: `Share is ${share.status.toLowerCase()}` };
    }

    if (share.expiresAt && share.expiresAt <= new Date()) {
      await this.expireShare(shareId);
      return { valid: false, message: 'Share has expired' };
    }

    if (share.maxAccessCount && share.currentAccessCount >= share.maxAccessCount) {
      return { valid: false, message: 'Maximum access count reached' };
    }

    // Check scope
    if (requestedScope && !share.scopes.includes(ShareScope.ALL) && !share.scopes.includes(requestedScope)) {
      return { valid: false, message: 'Requested scope not included in share' };
    }

    // Check date range
    if (recordDate && share.dateRange) {
      if (share.dateRange.from && recordDate < share.dateRange.from) {
        return { valid: false, message: 'Record date is before shared range' };
      }
      if (share.dateRange.to && recordDate > share.dateRange.to) {
        return { valid: false, message: 'Record date is after shared range' };
      }
    }

    return { valid: true };
  }
}

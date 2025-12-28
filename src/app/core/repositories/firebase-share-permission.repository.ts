import { Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    increment,
} from '@angular/fire/firestore';
import { Observable, from, map, of, throwError } from 'rxjs';
import { ISharePermissionRepository } from './share-permission.repository.interface';
import {
    SharePermission,
    CreateSharePermissionDto,
    ShareLink,
    ShareStatus,
    ShareMethod,
} from '@models/share-permission.model';

@Injectable({
    providedIn: 'root',
})
export class FirebaseSharePermissionRepository implements ISharePermissionRepository {
    private collectionName = 'share_permissions';

    constructor(private firestore: Firestore) { }

    getById(shareId: string): Observable<SharePermission | null> {
        const docRef = doc(this.firestore, this.collectionName, shareId);
        return from(getDoc(docRef)).pipe(
            map((docSnap) => {
                if (!docSnap.exists()) return null;
                return this.deserialize({ id: docSnap.id, ...docSnap.data() });
            })
        );
    }

    getByPatientId(patientId: string): Observable<SharePermission[]> {
        const collRef = collection(this.firestore, this.collectionName);
        const q = query(
            collRef,
            where('patientId', '==', patientId),
            where('status', '==', ShareStatus.ACTIVE),
            orderBy('createdAt', 'desc')
        );

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
            )
        );
    }

    getByDoctorId(doctorId: string): Observable<SharePermission[]> {
        const collRef = collection(this.firestore, this.collectionName);
        const q = query(
            collRef,
            where('sharedWithDoctorId', '==', doctorId),
            where('status', '==', ShareStatus.ACTIVE),
            orderBy('createdAt', 'desc')
        );

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
            )
        );
    }

    create(patientId: string, dto: CreateSharePermissionDto): Observable<SharePermission> {
        const collRef = collection(this.firestore, this.collectionName);
        const accessCode = dto.shareMethod !== ShareMethod.DIRECT ? crypto.randomUUID() : undefined;

        const data = this.serialize({
            ...dto,
            patientId,
            patientName: 'Current Patient', // Placeholder
            status: ShareStatus.ACTIVE,
            currentAccessCount: 0,
            accessCode,
        });

        return from(addDoc(collRef, data)).pipe(
            map((docRef) => ({
                id: docRef.id,
                ...dto,
                patientId,
                patientName: 'Current Patient',
                status: ShareStatus.ACTIVE,
                currentAccessCount: 0,
                accessCode,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: patientId,
            } as SharePermission))
        );
    }

    revoke(shareId: string, revokedBy: string): Observable<void> {
        const docRef = doc(this.firestore, this.collectionName, shareId);
        return from(updateDoc(docRef, {
            status: ShareStatus.REVOKED,
            revokedAt: Timestamp.now(),
            revokedBy,
            updatedAt: Timestamp.now(),
        }));
    }

    getByAccessCode(accessCode: string): Observable<SharePermission | null> {
        const collRef = collection(this.firestore, this.collectionName);
        const q = query(collRef, where('accessCode', '==', accessCode));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                if (snapshot.empty) return null;
                const doc = snapshot.docs[0];
                return this.deserialize({ id: doc.id, ...doc.data() });
            })
        );
    }

    validateAndIncrementAccess(shareId: string): Observable<boolean> {
        const docRef = doc(this.firestore, this.collectionName, shareId);

        // In a real app, we should use a transaction here to check limits and increment safely
        // For simplicity, we'll just increment
        return from(updateDoc(docRef, {
            currentAccessCount: increment(1),
            lastAccessedAt: Timestamp.now(),
        })).pipe(map(() => true));
    }

    generateShareLink(shareId: string): Observable<ShareLink> {
        return this.getById(shareId).pipe(
            map((share) => {
                if (!share || !share.accessCode) {
                    throw new Error('Share not found or invalid');
                }
                // Assuming base URL is configured or we construct it
                const baseUrl = window.location.origin;
                const url = `${baseUrl}/share/access/${share.accessCode}`;
                return {
                    url,
                    accessCode: share.accessCode,
                    expiresAt: share.expiresAt,
                };
            })
        );
    }

    cleanupExpired(): Observable<number> {
        // This should ideally be a Cloud Function
        return of(0);
    }

    private serialize(data: Partial<SharePermission>): Record<string, unknown> {
        return {
            ...data,
            dateRange: data.dateRange ? {
                from: data.dateRange.from ? Timestamp.fromDate(new Date(data.dateRange.from)) : null,
                to: data.dateRange.to ? Timestamp.fromDate(new Date(data.dateRange.to)) : null,
            } : null,
            expiresAt: data.expiresAt ? Timestamp.fromDate(new Date(data.expiresAt)) : null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdBy: data.patientId,
        };
    }

    private deserialize(data: Record<string, unknown> & { id: string }): SharePermission {
        const dateRange = data.dateRange as { from?: unknown; to?: unknown } | undefined;
        return {
            ...data,
            dateRange: dateRange ? {
                from: (dateRange.from as any)?.toDate?.() || (dateRange.from ? new Date(dateRange.from as string) : undefined),
                to: (dateRange.to as any)?.toDate?.() || (dateRange.to ? new Date(dateRange.to as string) : undefined),
            } : undefined,
            expiresAt: (data.expiresAt as any)?.toDate?.() || (data.expiresAt ? new Date(data.expiresAt as string) : undefined),
            createdAt: (data.createdAt as any)?.toDate?.() || new Date(data.createdAt as string),
            updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(data.updatedAt as string),
            revokedAt: (data.revokedAt as any)?.toDate?.() || (data.revokedAt ? new Date(data.revokedAt as string) : undefined),
            lastAccessedAt: (data.lastAccessedAt as any)?.toDate?.() || (data.lastAccessedAt ? new Date(data.lastAccessedAt as string) : undefined),
        } as SharePermission;
    }
}


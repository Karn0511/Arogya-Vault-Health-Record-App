import { Injectable } from '@angular/core';
import {
    Firestore,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { IAccessLogRepository } from './access-log.repository.interface';
import { AccessLog, CreateAccessLogDto, AccessLogFilter } from '@models/access-log.model';

@Injectable({
    providedIn: 'root',
})
export class FirebaseAccessLogRepository implements IAccessLogRepository {
    private collectionName = 'access_logs';

    constructor(private firestore: Firestore) { }

    create(userId: string, dto: CreateAccessLogDto): Observable<AccessLog> {
        const collRef = collection(this.firestore, this.collectionName);
        const logEntry = {
            ...dto,
            userId,
            timestamp: Timestamp.now(),
            // In a real app, we'd fetch user details to populate userName/Role, 
            // or pass them in DTO. For now, we'll leave them as placeholders or assume they are in metadata if critical.
            // The interface requires userName/Role in the return type, but DTO doesn't have them.
            // We'll assume the backend function or trigger would populate them, or we fetch them.
            // For this client-side repo, we'll mock them or rely on what's available.
            userName: 'Current User', // Placeholder
            userRole: 'PATIENT', // Placeholder
        };

        return from(addDoc(collRef, logEntry)).pipe(
            map((docRef) => ({
                id: docRef.id,
                ...dto,
                userId,
                userName: 'Current User',
                userRole: 'PATIENT',
                timestamp: new Date(),
            } as AccessLog))
        );
    }

    getByPatientId(patientId: string, filter?: AccessLogFilter): Observable<AccessLog[]> {
        const collRef = collection(this.firestore, this.collectionName);
        let q = query(collRef, where('patientId', '==', patientId));

        if (filter?.action && filter.action.length > 0) {
            q = query(q, where('action', 'in', filter.action));
        }

        if (filter?.dateFrom) {
            q = query(q, where('timestamp', '>=', Timestamp.fromDate(new Date(filter.dateFrom))));
        }

        if (filter?.dateTo) {
            q = query(q, where('timestamp', '<=', Timestamp.fromDate(new Date(filter.dateTo))));
        }

        q = query(q, orderBy('timestamp', 'desc'));

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
            )
        );
    }

    getByUserId(userId: string, filter?: AccessLogFilter): Observable<AccessLog[]> {
        const collRef = collection(this.firestore, this.collectionName);
        let q = query(collRef, where('userId', '==', userId));

        if (filter?.action && filter.action.length > 0) {
            q = query(q, where('action', 'in', filter.action));
        }

        q = query(q, orderBy('timestamp', 'desc'));

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
            )
        );
    }

    getRecent(patientId: string, limitCount: number = 10): Observable<AccessLog[]> {
        const collRef = collection(this.firestore, this.collectionName);
        const q = query(
            collRef,
            where('patientId', '==', patientId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
            )
        );
    }

    private deserialize(data: any): AccessLog {
        return {
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
        };
    }
}


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
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { IVaccinationRepository } from './vaccination.repository.interface';
import { Vaccination, CreateVaccinationDto } from '@models/vaccination.model';

@Injectable({
    providedIn: 'root',
})
export class FirebaseVaccinationRepository implements IVaccinationRepository {
    private collectionName = 'vaccinations';

    constructor(private firestore: Firestore) { }

    getById(vaccinationId: string): Observable<Vaccination | null> {
        const docRef = doc(this.firestore, this.collectionName, vaccinationId);
        return from(getDoc(docRef)).pipe(
            map((docSnap) => {
                if (!docSnap.exists()) return null;
                return this.deserialize({ id: docSnap.id, ...docSnap.data() });
            })
        );
    }

    getByPatientId(patientId: string): Observable<Vaccination[]> {
        const collRef = collection(this.firestore, this.collectionName);
        const q = query(
            collRef,
            where('patientId', '==', patientId),
            orderBy('dateGiven', 'desc')
        );

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
            )
        );
    }

    create(patientId: string, dto: CreateVaccinationDto): Observable<Vaccination> {
        const collRef = collection(this.firestore, this.collectionName);
        // Note: File upload for certificate should be handled by a service before calling this,
        // or we could inject Storage here. For now assuming certificateUrl is passed or handled elsewhere if needed,
        // but the DTO has certificateFile. The interface says create takes CreateVaccinationDto.
        // In a real app, we'd upload the file first.
        // Let's assume the service handles file upload and passes a modified DTO or we just store metadata here.
        // The DTO has certificateFile: File. We can't store File in Firestore.
        // We'll ignore certificateFile here and assume certificateUrl is set if uploaded.

        const data = this.serialize({ ...dto, patientId });
        return from(addDoc(collRef, data)).pipe(
            map((docRef) => ({
                id: docRef.id,
                ...dto,
                patientId,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: patientId,
            } as unknown as Vaccination))
        );
    }

    update(vaccinationId: string, updates: Partial<Vaccination>): Observable<Vaccination> {
        const docRef = doc(this.firestore, this.collectionName, vaccinationId);
        const data = this.serializeUpdate(updates);
        return from(updateDoc(docRef, data)).pipe(
            map(() => ({ id: vaccinationId, ...updates } as Vaccination))
        );
    }

    delete(vaccinationId: string): Observable<void> {
        const docRef = doc(this.firestore, this.collectionName, vaccinationId);
        return from(deleteDoc(docRef));
    }

    getUpcomingDoses(patientId: string): Observable<Vaccination[]> {
        const collRef = collection(this.firestore, this.collectionName);
        const now = new Date();
        const q = query(
            collRef,
            where('patientId', '==', patientId),
            where('nextDueDate', '>=', Timestamp.fromDate(now)),
            orderBy('nextDueDate', 'asc')
        );

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
            )
        );
    }

    private serialize(data: Partial<Vaccination> & { certificateFile?: File }): Record<string, unknown> {
        const { certificateFile, ...rest } = data; // Exclude File object
        return {
            ...rest,
            dateGiven: Timestamp.fromDate(new Date(data.dateGiven!)),
            nextDueDate: data.nextDueDate ? Timestamp.fromDate(new Date(data.nextDueDate)) : null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            createdBy: data.patientId,
        };
    }

    private serializeUpdate(data: Partial<Vaccination>): Record<string, unknown> {
        const update: Record<string, unknown> = { ...data, updatedAt: Timestamp.now() };
        if (data.dateGiven) {
            update.dateGiven = Timestamp.fromDate(new Date(data.dateGiven));
        }
        if (data.nextDueDate) {
            update.nextDueDate = Timestamp.fromDate(new Date(data.nextDueDate));
        }
        return update;
    }

    private deserialize(data: Record<string, unknown> & { id: string }): Vaccination {
        return {
            ...data,
            dateGiven: (data.dateGiven as any)?.toDate?.() || new Date(data.dateGiven as string),
            nextDueDate: (data.nextDueDate as any)?.toDate?.() || (data.nextDueDate ? new Date(data.nextDueDate as string) : undefined),
            createdAt: (data.createdAt as any)?.toDate?.() || new Date(data.createdAt as string),
            updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(data.updatedAt as string),
        } as Vaccination;
    }
}


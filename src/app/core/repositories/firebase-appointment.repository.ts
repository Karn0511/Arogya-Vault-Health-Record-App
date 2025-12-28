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
    limit,
    serverTimestamp
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { IAppointmentRepository } from './appointment.repository.interface';
import {
    Appointment,
    CreateAppointmentDto,
    UpdateAppointmentDto,
    AppointmentFilter,
    AppointmentStatus,
} from '@models/appointment.model';

@Injectable({
    providedIn: 'root',
})
export class FirebaseAppointmentRepository implements IAppointmentRepository {
    private collectionName = 'appointments';

    constructor(private firestore: Firestore) { }

    getById(appointmentId: string): Observable<Appointment | null> {
        const docRef = doc(this.firestore, this.collectionName, appointmentId);
        return from(getDoc(docRef)).pipe(
            map((docSnap) => {
                if (!docSnap.exists()) return null;
                return this.deserialize({ id: docSnap.id, ...docSnap.data() });
            })
        );
    }

    getByPatientId(patientId: string, filter?: AppointmentFilter): Observable<Appointment[]> {
        const collRef = collection(this.firestore, this.collectionName);
        let q = query(collRef, where('patientId', '==', patientId));

        if (filter?.status && filter.status.length > 0) {
            q = query(q, where('status', 'in', filter.status));
        }

        if (filter?.dateFrom) {
            q = query(q, where('appointmentDateTime', '>=', new Date(filter.dateFrom)));
        }

        if (filter?.dateTo) {
            q = query(q, where('appointmentDateTime', '<=', new Date(filter.dateTo)));
        }

        q = query(q, orderBy('appointmentDateTime', 'desc'));

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((docSnapshot: any) => this.deserialize({ id: docSnapshot.id, ...docSnapshot.data() }))
            )
        );
    }

    getByDoctorId(doctorId: string, filter?: AppointmentFilter): Observable<Appointment[]> {
        const collRef = collection(this.firestore, this.collectionName);
        let q = query(collRef, where('doctorId', '==', doctorId));

        if (filter?.status && filter.status.length > 0) {
            q = query(q, where('status', 'in', filter.status));
        }

        if (filter?.dateFrom) {
            q = query(q, where('appointmentDateTime', '>=', new Date(filter.dateFrom)));
        }

        if (filter?.dateTo) {
            q = query(q, where('appointmentDateTime', '<=', new Date(filter.dateTo)));
        }

        q = query(q, orderBy('appointmentDateTime', 'asc'));

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((docSnapshot: any) => this.deserialize({ id: docSnapshot.id, ...docSnapshot.data() }))
            )
        );
    }

    create(patientId: string, dto: CreateAppointmentDto): Observable<Appointment> {
        const collRef = collection(this.firestore, this.collectionName);
        const data = this.serialize({ ...dto, patientId });
        return from(addDoc(collRef, data)).pipe(
            map((docRef) => ({
                id: docRef.id,
                ...dto,
                patientId,
                status: AppointmentStatus.SCHEDULED,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: patientId, // Assuming patient creates it for now
            } as Appointment))
        );
    }

    update(appointmentId: string, updates: UpdateAppointmentDto): Observable<Appointment> {
        const docRef = doc(this.firestore, this.collectionName, appointmentId);
        const data = this.serializeUpdate(updates) as any;
        return from(updateDoc(docRef, data)).pipe(
            map(() => ({ id: appointmentId, ...updates } as Appointment)) // Partial return, ideally we fetch fresh
        );
    }

    delete(appointmentId: string): Observable<void> {
        const docRef = doc(this.firestore, this.collectionName, appointmentId);
        return from(deleteDoc(docRef));
    }

    getUpcoming(patientId: string, limitCount: number = 5): Observable<Appointment[]> {
        const collRef = collection(this.firestore, this.collectionName);
        const now = new Date();
        const q = query(
            collRef,
            where('patientId', '==', patientId),
            where('appointmentDateTime', '>=', now),
            where('status', '==', AppointmentStatus.SCHEDULED),
            orderBy('appointmentDateTime', 'asc'),
            limit(limitCount)
        );

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map((docSnapshot: any) => this.deserialize({ id: docSnapshot.id, ...docSnapshot.data() }))
            )
        );
    }

    private serialize(data: Partial<Appointment>): Record<string, unknown> {
        return {
            ...data,
            appointmentDateTime: new Date(data.appointmentDateTime!),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: AppointmentStatus.SCHEDULED,
            createdBy: data.patientId,
        };
    }

    private serializeUpdate(data: Partial<Appointment>): Record<string, unknown> {
        const update: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
        if (data.appointmentDateTime) {
            update.appointmentDateTime = new Date(data.appointmentDateTime);
        }
        return update;
    }

    private deserialize(data: Record<string, unknown> & { id: string }): Appointment {
        return {
            ...data,
            appointmentDateTime: (data.appointmentDateTime as any)?.toDate?.() || new Date(data.appointmentDateTime as string),
            createdAt: (data.createdAt as any)?.toDate?.() || new Date(data.createdAt as string),
            updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(data.updatedAt as string),
            reminderDateTime: (data.reminderDateTime as any)?.toDate?.() || (data.reminderDateTime ? new Date(data.reminderDateTime as string) : undefined),
        } as Appointment;
    }
}



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

import { IUserRepository } from '@core/repositories/user.repository.interface';
import { User, CreateUserDto, UpdateUserDto, UserRole, VerificationStatus } from '@models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserRepository implements IUserRepository {
  private collectionName = 'users';

  constructor(private firestore: Firestore) {}

  getById(id: string): Observable<User | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (!docSnap.exists()) return null;
        return this.deserialize({ id: docSnap.id, ...docSnap.data() });
      })
    );
  }

  getByEmail(email: string): Observable<User | null> {
    const collRef = collection(this.firestore, this.collectionName);
    const q = query(collRef, where('email', '==', email));

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return this.deserialize({ id: doc.id, ...doc.data() });
      })
    );
  }

  create(dto: CreateUserDto): Observable<string> {
    const collRef = collection(this.firestore, this.collectionName);
    const data = this.serialize(dto);
    return from(addDoc(collRef, data)).pipe(map((docRef) => docRef.id));
  }

  update(id: string, dto: UpdateUserDto): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const data = this.serializeUpdate(dto);
    return from(updateDoc(docRef, data));
  }

  delete(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }

  getDoctors(): Observable<User[]> {
    const collRef = collection(this.firestore, this.collectionName);
    const q = query(collRef, where('role', '==', UserRole.DOCTOR));

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
      )
    );
  }

  getAll(): Observable<User[]> {
    const collRef = collection(this.firestore, this.collectionName);
    return from(getDocs(collRef)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
      )
    );
  }

  updateDoctorVerificationStatus(
    doctorId: string,
    status: VerificationStatus
  ): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, doctorId);
    return from(
      updateDoc(docRef, {
        'doctorDetails.verificationStatus': status,
        updatedAt: Timestamp.now(),
      })
    );
  }

  private serialize(dto: CreateUserDto): Record<string, unknown> {
    const data: Record<string, unknown> = {
      ...dto,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    if (dto.dateOfBirth) {
      data.dateOfBirth = Timestamp.fromDate(new Date(dto.dateOfBirth));
    }
    return data;
  }

  private serializeUpdate(dto: UpdateUserDto): Record<string, unknown> {
    const data: Record<string, unknown> = { ...dto, updatedAt: Timestamp.now() };
    if (dto.dateOfBirth) {
      data.dateOfBirth = Timestamp.fromDate(new Date(dto.dateOfBirth));
    }
    return data;
  }

  private deserialize(data: Record<string, unknown>): User {
    return {
      ...data,
      dateOfBirth: data.dateOfBirth?.toDate?.()?.toISOString() || data.dateOfBirth,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as User;
  }
}


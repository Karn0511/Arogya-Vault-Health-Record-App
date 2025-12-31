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
  Timestamp,
} from '@angular/fire/firestore';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { Observable, from, map, switchMap } from 'rxjs';

import { IMedicalRecordRepository } from '@core/repositories/medical-record.repository.interface';
import {
  MedicalRecord,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  RecordFilter,
} from '@models/medical-record.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseMedicalRecordRepository implements IMedicalRecordRepository {
  private collectionName = 'medical_records';

  constructor(
    private firestore: Firestore,
    private storage: Storage
  ) {}

  getById(id: string): Observable<MedicalRecord | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (!docSnap.exists()) return null;
        return this.deserialize({ id: docSnap.id, ...docSnap.data() });
      })
    );
  }

  getByPatientId(
    patientId: string,
    filter?: RecordFilter
  ): Observable<MedicalRecord[]> {
    const collRef = collection(this.firestore, this.collectionName);
    let q = query(collRef, where('patientId', '==', patientId));

    if (filter?.type) {
      q = query(q, where('type', '==', filter.type));
    }

    if (filter?.startDate && filter?.endDate) {
      q = query(
        q,
        where('recordDate', '>=', Timestamp.fromDate(new Date(filter.startDate))),
        where('recordDate', '<=', Timestamp.fromDate(new Date(filter.endDate)))
      );
    }

    q = query(q, orderBy('recordDate', 'desc'));

    if (filter?.limit) {
      q = query(q, limit(filter.limit));
    }

    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => this.deserialize({ id: doc.id, ...doc.data() }))
      )
    );
  }

  create(dto: CreateMedicalRecordDto): Observable<string> {
    const collRef = collection(this.firestore, this.collectionName);
    const data = this.serialize(dto);
    return from(addDoc(collRef, data)).pipe(map((docRef) => docRef.id));
  }

  update(id: string, dto: UpdateMedicalRecordDto): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const data = this.serializeUpdate(dto);
    return from(updateDoc(docRef, data));
  }

  delete(id: string): Observable<void> {
    const docRef = doc(this.firestore, this.collectionName, id);
    return from(deleteDoc(docRef));
  }

  uploadFile(patientId: string, file: File): Observable<string> {
    const timestamp = Date.now();
    const filePath = `medical-records/${patientId}/${timestamp}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    return from(uploadBytes(storageRef, file)).pipe(
      switchMap(() => from(getDownloadURL(storageRef)))
    );
  }

  deleteFile(fileUrl: string): Observable<void> {
    const storageRef = ref(this.storage, fileUrl);
    return from(deleteObject(storageRef));
  }

  search(patientId: string, searchTerm: string): Observable<MedicalRecord[]> {
    // Firestore doesn't support full-text search natively
    // This is a simple implementation - consider using Algolia or similar for production
    const collRef = collection(this.firestore, this.collectionName);
    const q = query(
      collRef,
      where('patientId', '==', patientId),
      orderBy('recordDate', 'desc')
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const records = snapshot.docs.map((doc) =>
          this.deserialize({ id: doc.id, ...doc.data() })
        );
        const term = searchTerm.toLowerCase();
        return records.filter(
          (record) =>
            record.fileName.toLowerCase().includes(term) ||
            record.description?.toLowerCase().includes(term) ||
            record.tags?.some((tag) => tag.toLowerCase().includes(term))
        );
      })
    );
  }

  private serialize(dto: CreateMedicalRecordDto): Record<string, unknown> {
    return {
      ...dto,
      recordDate: Timestamp.fromDate(new Date(dto.recordDate)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  private serializeUpdate(dto: UpdateMedicalRecordDto): Record<string, unknown> {
    const data: Record<string, unknown> = { ...dto, updatedAt: Timestamp.now() };
    if (dto.recordDate) {
      data.recordDate = Timestamp.fromDate(new Date(dto.recordDate));
    }
    return data;
  }

  private deserialize(data: Record<string, unknown>): MedicalRecord {
    return {
      ...data,
      recordDate: (data.recordDate as any)?.toDate?.()?.toISOString() || data.recordDate,
      createdAt: (data.createdAt as any)?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: (data.updatedAt as any)?.toDate?.()?.toISOString() || data.updatedAt,
    } as MedicalRecord;
  }
}


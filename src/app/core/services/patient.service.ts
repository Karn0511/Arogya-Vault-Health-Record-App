import { Injectable } from '@angular/core';
import { CreateMedicalRecordDto, MedicalRecord, RecordFilter } from '@models/medical-record.model';
import { User } from '@models/user.model';
import { Observable } from 'rxjs';
import { FirebaseMedicalRecordRepository } from '../repositories/firebase-medical-record.repository';
import { FirebaseUserRepository } from '../repositories/firebase-user.repository';

@Injectable({
    providedIn: 'root',
})
export class PatientService {
    constructor(
        // In a real app, we'd inject the interface tokens, but for simplicity/direct usage we inject the implementations
        // or rely on 'providedIn: root' of the implementations if they implement the interface.
        // However, since the repositories are provided in root, we can inject the concrete classes or use tokens if setup.
        // Let's assume we can inject the concrete classes for now or the interfaces if provided.
        // Based on the repository files, they are @Injectable({ providedIn: 'root' }).
        private userRepo: FirebaseUserRepository,
        private medicalRecordRepo: FirebaseMedicalRecordRepository
    ) { }

    /**
     * Get patient profile by ID
     */
    getProfile(patientId: string): Observable<User | null> {
        return this.userRepo.getById(patientId);
    }

    /**
     * Get all medical records for a patient
     */
    getMedicalRecords(patientId: string, filter?: RecordFilter): Observable<MedicalRecord[]> {
        return this.medicalRecordRepo.getByPatientId(patientId, filter);
    }

    /**
     * Get a specific medical record
     */
    getMedicalRecord(recordId: string): Observable<MedicalRecord | null> {
        return this.medicalRecordRepo.getById(recordId);
    }

    /**
     * Add a new medical record
     */
    addMedicalRecord(dto: CreateMedicalRecordDto): Observable<string> {
        return this.medicalRecordRepo.create(dto);
    }

    /**
     * Upload a file for a medical record
     */
    uploadRecordFile(patientId: string, file: File): Observable<string> {
        return this.medicalRecordRepo.uploadFile(patientId, file);
    }

    /**
     * Search medical records
     */
    searchRecords(patientId: string, query: string): Observable<MedicalRecord[]> {
        return this.medicalRecordRepo.search(patientId, query);
    }

    /**
     * Delete a medical record
     */
    deleteRecord(recordId: string): Observable<void> {
        return this.medicalRecordRepo.delete(recordId);
    }
}

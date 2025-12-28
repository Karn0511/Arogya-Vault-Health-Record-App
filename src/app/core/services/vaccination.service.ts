import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseVaccinationRepository } from '../repositories/firebase-vaccination.repository';
import { Vaccination, CreateVaccinationDto } from '@models/vaccination.model';

@Injectable({
    providedIn: 'root',
})
export class VaccinationService {
    constructor(private vaccinationRepo: FirebaseVaccinationRepository) { }

    getVaccination(id: string): Observable<Vaccination | null> {
        return this.vaccinationRepo.getById(id);
    }

    getPatientVaccinations(patientId: string): Observable<Vaccination[]> {
        return this.vaccinationRepo.getByPatientId(patientId);
    }

    addVaccination(patientId: string, dto: CreateVaccinationDto): Observable<Vaccination> {
        return this.vaccinationRepo.create(patientId, dto);
    }

    updateVaccination(id: string, updates: Partial<Vaccination>): Observable<Vaccination> {
        return this.vaccinationRepo.update(id, updates);
    }

    deleteVaccination(id: string): Observable<void> {
        return this.vaccinationRepo.delete(id);
    }

    getUpcomingDoses(patientId: string): Observable<Vaccination[]> {
        return this.vaccinationRepo.getUpcomingDoses(patientId);
    }
}

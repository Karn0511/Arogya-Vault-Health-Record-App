import { Observable } from 'rxjs';
import { Vaccination, CreateVaccinationDto } from '@models/vaccination.model';

export interface IVaccinationRepository {
  getById(vaccinationId: string): Observable<Vaccination | null>;
  getByPatientId(patientId: string): Observable<Vaccination[]>;
  create(patientId: string, dto: CreateVaccinationDto): Observable<Vaccination>;
  update(vaccinationId: string, updates: Partial<Vaccination>): Observable<Vaccination>;
  delete(vaccinationId: string): Observable<void>;
  getUpcomingDoses(patientId: string): Observable<Vaccination[]>;
}


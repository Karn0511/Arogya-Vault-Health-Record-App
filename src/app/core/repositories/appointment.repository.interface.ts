import { Observable } from 'rxjs';
import {
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentFilter,
} from '@models/appointment.model';

export interface IAppointmentRepository {
  getById(appointmentId: string): Observable<Appointment | null>;
  getByPatientId(patientId: string, filter?: AppointmentFilter): Observable<Appointment[]>;
  getByDoctorId(doctorId: string, filter?: AppointmentFilter): Observable<Appointment[]>;
  create(patientId: string, dto: CreateAppointmentDto): Observable<Appointment>;
  update(appointmentId: string, updates: UpdateAppointmentDto): Observable<Appointment>;
  delete(appointmentId: string): Observable<void>;
  getUpcoming(patientId: string, limit?: number): Observable<Appointment[]>;
}


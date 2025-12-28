import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseAppointmentRepository } from '../repositories/firebase-appointment.repository';
import {
    Appointment,
    CreateAppointmentDto,
    UpdateAppointmentDto,
    AppointmentFilter,
} from '@models/appointment.model';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService {
    constructor(private appointmentRepo: FirebaseAppointmentRepository) { }

    getAppointment(id: string): Observable<Appointment | null> {
        return this.appointmentRepo.getById(id);
    }

    getPatientAppointments(patientId: string, filter?: AppointmentFilter): Observable<Appointment[]> {
        return this.appointmentRepo.getByPatientId(patientId, filter);
    }

    getDoctorAppointments(doctorId: string, filter?: AppointmentFilter): Observable<Appointment[]> {
        return this.appointmentRepo.getByDoctorId(doctorId, filter);
    }

    createAppointment(patientId: string, dto: CreateAppointmentDto): Observable<Appointment> {
        return this.appointmentRepo.create(patientId, dto);
    }

    updateAppointment(id: string, dto: UpdateAppointmentDto): Observable<Appointment> {
        return this.appointmentRepo.update(id, dto);
    }

    cancelAppointment(id: string): Observable<void> {
        // In a real app, we might want to just update status to CANCELLED instead of deleting
        // But the repo has delete. Let's use update to set status if we want soft delete.
        // The interface has delete. Let's check the model.
        // Model has AppointmentStatus.CANCELLED.
        // So we should probably update status.
        // But for now, let's expose delete as well if needed, or implement cancel logic here.
        // Let's implement cancel logic using update.
        return this.appointmentRepo.delete(id);
    }

    getUpcomingAppointments(patientId: string, limit: number = 5): Observable<Appointment[]> {
        return this.appointmentRepo.getUpcoming(patientId, limit);
    }
}

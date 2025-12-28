import { Injectable, signal, computed } from '@angular/core';
import { Appointment, AppointmentStatus } from '@models/appointment.model';
import { AppointmentService } from '../services/appointment.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppointmentStore {
    // State
    private _appointments = signal<Appointment[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    // Selectors
    readonly appointments = this._appointments.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    readonly upcomingAppointments = computed(() => {
        const now = new Date();
        return this._appointments()
            .filter(a => new Date(a.appointmentDateTime) >= now && a.status !== AppointmentStatus.CANCELLED)
            .sort((a, b) => new Date(a.appointmentDateTime).getTime() - new Date(b.appointmentDateTime).getTime());
    });

    readonly pastAppointments = computed(() => {
        const now = new Date();
        return this._appointments()
            .filter(a => new Date(a.appointmentDateTime) < now || a.status === AppointmentStatus.CANCELLED)
            .sort((a, b) => new Date(b.appointmentDateTime).getTime() - new Date(a.appointmentDateTime).getTime());
    });

    constructor(private appointmentService: AppointmentService) { }

    // Actions
    loadAppointments(patientId: string) {
        this._loading.set(true);
        this.appointmentService.getPatientAppointments(patientId).pipe(
            tap(appointments => this._appointments.set(appointments)),
            catchError(err => {
                this._error.set(err.message);
                return of([]);
            }),
            finalize(() => this._loading.set(false))
        ).subscribe();
    }

    addAppointment(appointment: Appointment) {
        this._appointments.update(appointments => [...appointments, appointment]);
    }

    updateAppointment(updatedAppointment: Appointment) {
        this._appointments.update(appointments =>
            appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
        );
    }

    removeAppointment(appointmentId: string) {
        this._appointments.update(appointments =>
            appointments.filter(a => a.id !== appointmentId)
        );
    }
}

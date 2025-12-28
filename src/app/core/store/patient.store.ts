import { Injectable, signal, computed } from '@angular/core';
import { MedicalRecord } from '@models/medical-record.model';
import { User } from '@models/user.model';
import { PatientService } from '../services/patient.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PatientStore {
    // State
    private _profile = signal<User | null>(null);
    private _records = signal<MedicalRecord[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    // Selectors
    readonly profile = this._profile.asReadonly();
    readonly records = this._records.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    readonly recentRecords = computed(() => {
        return this._records().slice(0, 5);
    });

    constructor(private patientService: PatientService) { }

    // Actions
    loadProfile(patientId: string) {
        this._loading.set(true);
        this.patientService.getProfile(patientId).pipe(
            tap(profile => this._profile.set(profile)),
            catchError(err => {
                this._error.set(err.message);
                return of(null);
            }),
            finalize(() => this._loading.set(false))
        ).subscribe();
    }

    loadRecords(patientId: string) {
        this._loading.set(true);
        this.patientService.getMedicalRecords(patientId).pipe(
            tap(records => this._records.set(records)),
            catchError(err => {
                this._error.set(err.message);
                return of([]);
            }),
            finalize(() => this._loading.set(false))
        ).subscribe();
    }

    addRecord(record: MedicalRecord) {
        this._records.update(records => [record, ...records]);
    }
}

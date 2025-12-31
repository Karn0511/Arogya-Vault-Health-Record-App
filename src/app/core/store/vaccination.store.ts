import { Injectable, signal, computed } from '@angular/core';
import { Vaccination } from '@models/vaccination.model';
import { VaccinationService } from '../services/vaccination.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VaccinationStore {
    // State
    private _vaccinations = signal<Vaccination[]>([]);
    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    // Selectors
    readonly vaccinations = this._vaccinations.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    readonly upcomingDoses = computed(() => {
        const now = new Date();
        return this._vaccinations()
            .filter(v => v.nextDueDate && new Date(v.nextDueDate) >= now)
            .sort((a, b) => {
                const dateA = a.nextDueDate ? new Date(a.nextDueDate).getTime() : 0;
                const dateB = b.nextDueDate ? new Date(b.nextDueDate).getTime() : 0;
                return dateA - dateB;
            });
    });

    constructor(private vaccinationService: VaccinationService) { }

    // Actions
    loadVaccinations(patientId: string) {
        this._loading.set(true);
        this.vaccinationService.getPatientVaccinations(patientId).pipe(
            tap(vaccinations => this._vaccinations.set(vaccinations)),
            catchError(err => {
                this._error.set(err.message);
                return of([]);
            }),
            finalize(() => this._loading.set(false))
        ).subscribe();
    }

    addVaccination(vaccination: Vaccination) {
        this._vaccinations.update(vaccinations => [...vaccinations, vaccination]);
    }

    updateVaccination(updatedVaccination: Vaccination) {
        this._vaccinations.update(vaccinations =>
            vaccinations.map(v => v.id === updatedVaccination.id ? updatedVaccination : v)
        );
    }

    removeVaccination(vaccinationId: string) {
        this._vaccinations.update(vaccinations =>
            vaccinations.filter(v => v.id !== vaccinationId)
        );
    }
}

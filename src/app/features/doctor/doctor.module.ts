import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { DoctorRoutingModule } from './doctor-routing.module';

import { DoctorDashboardComponent } from './components/dashboard/doctor-dashboard.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { AddPrescriptionComponent } from './components/add-prescription/add-prescription.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        DoctorRoutingModule,
        DoctorDashboardComponent,
        PatientListComponent,
        PatientDetailComponent,
        AddPrescriptionComponent
    ]
})
export class DoctorModule { }

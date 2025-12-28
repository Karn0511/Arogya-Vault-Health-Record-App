import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { PatientRoutingModule } from './patient-routing.module';

import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RecordsComponent } from './components/records/records.component';
import { HealthProfileComponent } from './components/health-profile/health-profile.component';
import { MedicationsComponent } from './components/medications/medications.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { PatientSettingsComponent } from './components/settings/patient-settings.component';

@NgModule({
  declarations: [
    PatientLayoutComponent,
    DashboardComponent,
    RecordsComponent,
    HealthProfileComponent,
    MedicationsComponent,
    AppointmentsComponent,
    PatientSettingsComponent,
  ],
  imports: [CommonModule, SharedModule, PatientRoutingModule],
})
export class PatientModule {}

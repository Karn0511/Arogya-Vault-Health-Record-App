import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SymptomCheckerComponent } from '../../shared/components/symptom-checker/symptom-checker.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HealthProfileComponent } from './components/health-profile/health-profile.component';
import { MedicationsComponent } from './components/medications/medications.component';
import { RecordsComponent } from './components/records/records.component';
import { PatientLayoutComponent } from './patient-layout/patient-layout.component';
import { PatientSettingsComponent } from './components/settings/patient-settings.component';

const routes: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'records', component: RecordsComponent },
      { path: 'health-profile', component: HealthProfileComponent },
      { path: 'medications', component: MedicationsComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'settings', component: PatientSettingsComponent },
      { path: 'analytics', loadComponent: () => import('../../shared/components/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'image-analysis', loadComponent: () => import('../../shared/components/image-analysis/image-analysis.component').then(m => m.ImageAnalysisComponent) },
      { path: 'symptom-checker', component: SymptomCheckerComponent },
    ],
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PatientRoutingModule { }

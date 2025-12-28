import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DoctorDashboardComponent } from './components/dashboard/doctor-dashboard.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { AddPrescriptionComponent } from './components/add-prescription/add-prescription.component';

const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DoctorDashboardComponent },
    { path: 'patients', component: PatientListComponent },
    { path: 'patients/:id', component: PatientDetailComponent },
    { path: 'prescriptions/add', component: AddPrescriptionComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DoctorRoutingModule { }

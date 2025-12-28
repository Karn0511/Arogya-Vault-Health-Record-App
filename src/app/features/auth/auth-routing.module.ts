import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { RoleSelectionComponent } from './components/role-selection/role-selection.component';
import { PatientLoginComponent } from './components/patient-login/patient-login.component';
import { DoctorLoginComponent } from './components/doctor-login/doctor-login.component';
import { ConfirmSignupComponent } from './components/confirm-signup/confirm-signup.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: RoleSelectionComponent,
  },
  {
    path: 'login/patient',
    component: PatientLoginComponent,
  },
  {
    path: 'login/doctor',
    component: DoctorLoginComponent,
  },
  {
    path: 'login/admin',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'confirm-signup',
    component: ConfirmSignupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule { }

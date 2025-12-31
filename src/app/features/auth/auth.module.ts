import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { RoleSelectionComponent } from './components/role-selection/role-selection.component';
import { PatientLoginComponent } from './components/patient-login/patient-login.component';
import { DoctorLoginComponent } from './components/doctor-login/doctor-login.component';
import { GoogleSigninButtonComponent } from '@shared/components/google-signin-button/google-signin-button.component';
import { ConfirmSignupComponent } from './components/confirm-signup/confirm-signup.component';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    RoleSelectionComponent,
    PatientLoginComponent,
    DoctorLoginComponent,
    ConfirmSignupComponent
  ],
  imports: [
    SharedModule,
    AuthRoutingModule,
    GoogleSigninButtonComponent  // Standalone component
  ],
})
export class AuthModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { UserRole } from '@models/user.model';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule),
    canActivate: [guestGuard],
  },
  {
    path: 'patient',
    loadChildren: () => import('./features/patient/patient.module').then((m) => m.PatientModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.PATIENT] },
  },
  {
    path: 'doctor',
    loadChildren: () => import('./features/doctor/doctor.module').then((m) => m.DoctorModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.DOCTOR] },
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [authGuard, roleGuard],
    data: { roles: [UserRole.ADMIN] },
  },
  {
    path: 'unauthorized',
    loadChildren: () => import('./features/error/error.module').then((m) => m.ErrorModule),
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

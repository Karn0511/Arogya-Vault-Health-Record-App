import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { DoctorManagementComponent } from './components/doctor-management/doctor-management.component';
import { MedicineManagementComponent } from './components/medicine-management/medicine-management.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';
import { DoctorVerificationComponent } from './components/doctor-verification/doctor-verification.component';
import { SystemConfigComponent } from './components/system-config/system-config.component';

const routes: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'users', component: UserManagementComponent },
            { path: 'doctors', component: DoctorManagementComponent },
            { path: 'medicines', component: MedicineManagementComponent },
            { path: 'analytics', component: AnalyticsComponent },
            { path: 'audit-logs', component: AuditLogsComponent },
            { path: 'verification', component: DoctorVerificationComponent },
            { path: 'settings', component: SystemConfigComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }

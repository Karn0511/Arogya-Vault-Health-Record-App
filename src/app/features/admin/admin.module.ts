import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';

// Layout
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

// Components
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { DoctorManagementComponent } from './components/doctor-management/doctor-management.component';
import { MedicineManagementComponent } from './components/medicine-management/medicine-management.component';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { AuditLogsComponent } from './components/audit-logs/audit-logs.component';
import { DoctorVerificationComponent } from './components/doctor-verification/doctor-verification.component';
import { SystemConfigComponent } from './components/system-config/system-config.component';

@NgModule({
    declarations: [
        AdminLayoutComponent,
        AdminDashboardComponent,
        UserManagementComponent,
        DoctorManagementComponent,
        MedicineManagementComponent,
        AnalyticsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        AdminRoutingModule,
        AuditLogsComponent,
        DoctorVerificationComponent,
        SystemConfigComponent
    ]
})
export class AdminModule { }

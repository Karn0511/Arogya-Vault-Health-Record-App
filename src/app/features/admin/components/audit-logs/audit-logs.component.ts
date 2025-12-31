import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AuditLog } from '@core/services/admin.service';

@Component({
    selector: 'app-audit-logs',
    templateUrl: './audit-logs.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class AuditLogsComponent implements OnInit {
    private adminService = inject(AdminService);

    logs: AuditLog[] = [];
    loading = true;
    currentPage = 1;
    totalPages = 1;
    totalLogs = 0;
    JSON = JSON; // Expose to template

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(page: number = 1): void {
        this.loading = true;
        this.adminService.getAuditLogs(page).subscribe({
            next: (response) => {
                this.logs = response.logs || [];
                this.currentPage = response.page;
                this.totalPages = response.pages;
                this.totalLogs = response.total;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load audit logs', err);
                this.loading = false;
                // Ideally show a toast notification here
            }
        });
    }

    changePage(newPage: number): void {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.loadLogs(newPage);
        }
    }

    formatDetails(details: any): string {
        if (!details) return '-';
        try {
            if (typeof details === 'string') return details;
            return Object.keys(details).length > 0 ? JSON.stringify(details) : '-';
        } catch (e) {
            return '-';
        }
    }

    getActionClass(action: string): string {
        switch (action) {
            case 'LOGIN':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'LOGOUT':
                return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600';
            case 'VIEW':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            case 'CREATE':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'UPDATE':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'DELETE':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    }
}

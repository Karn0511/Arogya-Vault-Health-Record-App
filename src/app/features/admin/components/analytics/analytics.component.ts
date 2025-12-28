import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  loading = false;
  error: string | null = null;

  userGrowth: { total?: number; newThisMonth?: number; growth?: unknown[] } | null = null;
  appointmentStats: { total?: number; completed?: number; stats?: unknown[] } | null = null;
  revenueStats: { total?: number; thisMonth?: number; revenue?: unknown[] } | null = null;

  selectedFilter = 'all';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getUserGrowth().subscribe({
      next: (data) => this.userGrowth = data,
      error: () => this.error = 'Failed to load user growth data'
    });

    this.adminService.getAppointmentStats().subscribe({
      next: (data) => this.appointmentStats = data,
      error: () => this.error = 'Failed to load appointment stats'
    });

    this.adminService.getRevenueStats().subscribe({
      next: (data) => {
        this.revenueStats = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load revenue stats';
        this.loading = false;
      }
    });
  }

  applyFilter(filter: string): void {
    this.selectedFilter = filter;
    this.loadAnalytics();
  }
}

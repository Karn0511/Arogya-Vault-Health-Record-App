import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.scss'],
})
export class PatientLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isSidebarOpen = false;
  isSidebarCollapsed = false;
  isMenuOpen = false;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService
  ) { }

  ngOnInit(): void { }

  toggleSidebar(): void {
    // Replaced sidebar with glass menu for mobile
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onLogout(): void {
    // Header now handles logout directly
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

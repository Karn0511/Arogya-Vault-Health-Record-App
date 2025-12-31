import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.scss'],
})
export class PatientLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isSidebarOpen = false;
  isSidebarCollapsed = false;

  constructor(
    public themeService: ThemeService,
    public authService: AuthService
  ) { }

  ngOnInit(): void { }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

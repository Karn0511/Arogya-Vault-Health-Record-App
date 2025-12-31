import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '@models/user.model';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isCollapsed = false;
  isOpen = false;
  currentUser: User | null = null;

  navItems = [
    { icon: 'home', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'users', label: 'Users', route: '/admin/users' },
    { icon: 'doctor', label: 'Doctors', route: '/admin/doctors' },
    { icon: 'pill', label: 'Medicines', route: '/admin/medicines' },
    { icon: 'chart', label: 'Analytics', route: '/admin/analytics' },
    { icon: 'settings', label: 'Settings', route: '/admin/settings' },
    { icon: 'clipboard', label: 'Audit Logs', route: '/admin/audit-logs' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobileSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  closeSidebar(): void {
    this.isOpen = false;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}

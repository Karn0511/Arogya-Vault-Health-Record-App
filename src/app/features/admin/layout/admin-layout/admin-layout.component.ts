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
  menuOpen = true;
  currentUser: User | null = null;

  navItems = [
    { icon: '📊', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: '👥', label: 'Users', route: '/admin/users' },
    { icon: '👨‍⚕️', label: 'Doctors', route: '/admin/doctors' },
    { icon: '💊', label: 'Medicines', route: '/admin/medicines' },
    { icon: '📈', label: 'Analytics', route: '/admin/analytics' },
    { icon: '⚙️', label: 'Settings', route: '/admin/settings' },
    { icon: '📋', label: 'Audit Logs', route: '/admin/audit-logs' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
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

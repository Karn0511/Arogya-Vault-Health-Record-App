import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  currentUser = this.authService.currentUserValue;

  @Input() title = 'ArogyaVault';
  @Input() subtitle = 'Health Records';
  @Input() navItems: NavItem[] = [];

  private readonly defaultNavItems: NavItem[] = [
    { icon: 'home', label: 'Dashboard', route: '/patient/dashboard' },
    { icon: 'folder', label: 'My Records', route: '/patient/records' },
    { icon: 'user', label: 'Health Profile', route: '/patient/health-profile' },
    { icon: 'pill', label: 'Medications', route: '/patient/medications' },
    { icon: 'calendar', label: 'Appointments', route: '/patient/appointments' },
    { icon: 'chart', label: 'Analytics', route: '/patient/analytics' },
    { icon: 'image', label: 'Image Analysis', route: '/patient/image-analysis' },
    { icon: 'symptom', label: 'Symptom Checker', route: '/patient/symptom-checker' },
    { icon: 'bell', label: 'Notifications', route: '/patient/notifications', badge: 3 },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (!this.navItems || this.navItems.length === 0) {
      this.navItems = this.defaultNavItems;
    }
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.closeSidebar.emit();
  }
}

import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from '@models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() menuClick = new EventEmitter<void>();

  private authServiceInject = inject(AuthService);
  currentUser: User | null = null;
  searchQuery = '';
  showNotifications = false;
  showUserMenu = false;

  notifications = [
    {
      id: '1',
      message: 'Lab results are ready',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      message: 'Appointment reminder for tomorrow',
      time: '5 hours ago',
      read: false,
    },
  ];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  onSearch(): void {
    // Search functionality to be implemented
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.authService.signOut().subscribe();
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }
}

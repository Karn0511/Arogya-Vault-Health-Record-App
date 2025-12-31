import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { User } from '@models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }))
      ])
    ])
  ]
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

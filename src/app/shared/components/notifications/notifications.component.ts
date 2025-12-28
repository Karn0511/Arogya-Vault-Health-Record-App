import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  title: string;
  description: string;
  date: Date;
  read: boolean;
  type?: 'appointment' | 'report' | 'medication' | 'system';
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  isOpen = false;
  unreadCount = 0;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    // Mock notifications - replace with actual data service
    this.notifications = [
      {
        id: '1',
        title: 'New Lab Report',
        description: 'Your blood test results are ready',
        date: new Date(2025, 10, 20),
        read: false,
        type: 'report'
      },
      {
        id: '2',
        title: 'Appointment Reminder',
        description: 'Checkup scheduled for tomorrow at 2 PM',
        date: new Date(2025, 10, 19),
        read: false,
        type: 'appointment'
      },
      {
        id: '3',
        title: 'Medication Refill',
        description: 'Time to refill your prescription',
        date: new Date(2025, 10, 15),
        read: true,
        type: 'medication'
      }
    ];
    this.updateUnreadCount();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.updateUnreadCount();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();
    this.isOpen = false;
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  getNotificationIcon(type?: string): string {
    switch (type) {
      case 'appointment': return '📅';
      case 'report': return '📋';
      case 'medication': return '💊';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}

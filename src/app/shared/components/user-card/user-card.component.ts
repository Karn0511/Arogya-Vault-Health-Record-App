import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from '@models/user.model';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class UserCardComponent {
  @Input() user: User | null = null;
  @Input() healthScore: number = 0;
  @Input() healthId: string = '';
  @Input() lastCheckup: string = '';

  getInitials(user: User | null): string {
    if (!user?.fullName) return 'U';
    const parts = user.fullName.trim().split(' ').filter(Boolean);
    const first = parts[0]?.charAt(0) ?? 'U';
    const second = parts[1]?.charAt(0) ?? '';
    return `${first}${second}`;
  }
}

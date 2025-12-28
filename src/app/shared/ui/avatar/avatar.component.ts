import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="avatarClasses">
      <img *ngIf="src" [src]="src" [alt]="alt" class="aspect-square h-full w-full object-cover" />
      <span *ngIf="!src && initials" class="flex h-full w-full items-center justify-center bg-muted text-sm font-medium">
        {{ initials }}
      </span>
    </div>
  `
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() alt = 'Avatar';
  @Input() initials?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() class = '';

  get avatarClasses(): string {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12'
    };
    return `relative flex ${sizes[this.size]} shrink-0 overflow-hidden rounded-full ring-2 ring-background transition-all hover:ring-4 hover:ring-primary/20 ${this.class}`;
  }
}

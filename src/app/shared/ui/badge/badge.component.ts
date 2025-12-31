import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="badgeClasses">
      <ng-content></ng-content>
    </div>
  `
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() class = '';

  get badgeClasses(): string {
    const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    
    const variants = {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm',
      outline: 'text-foreground',
      success: 'border-transparent bg-green-500 text-white hover:bg-green-600 shadow-sm'
    };

    return `${base} ${variants[this.variant]} ${this.class}`;
  }
}

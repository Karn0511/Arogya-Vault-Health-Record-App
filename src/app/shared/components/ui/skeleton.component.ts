import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../core/utils/cn';

@Component({
    selector: 'ui-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="skeletonClasses"></div>
  `,
    styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `],
})
export class SkeletonComponent {
    @Input() class: string = '';

    get skeletonClasses(): string {
        return cn('animate-pulse rounded-md bg-muted', this.class);
    }
}

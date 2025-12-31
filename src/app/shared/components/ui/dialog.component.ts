import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { cn } from '../../../core/utils/cn';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Overlay -->
      <div
        @overlayAnimation
        class="fixed inset-0 bg-background/80 backdrop-blur-sm"
        (click)="onOverlayClick()"
      ></div>

      <!-- Dialog Content -->
      <div
        @dialogAnimation
        [class]="dialogClasses"
        role="dialog"
        aria-modal="true"
      >
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class DialogComponent {
  @Input() open: boolean = false;
  @Input() class: string = '';
  @Output() openChange = new EventEmitter<boolean>();

  get dialogClasses(): string {
    return cn(
      'relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
      this.class
    );
  }

  onOverlayClick(): void {
    this.open = false;
    this.openChange.emit(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) {
      this.open = false;
      this.openChange.emit(false);
    }
  }
}

@Component({
  selector: 'ui-dialog-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="headerClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class DialogHeaderComponent {
  @Input() class: string = '';

  get headerClasses(): string {
    return cn('flex flex-col space-y-1.5 text-center sm:text-left', this.class);
  }
}

@Component({
  selector: 'ui-dialog-title',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 [class]="titleClasses">
      <ng-content></ng-content>
    </h2>
  `,
})
export class DialogTitleComponent {
  @Input() class: string = '';

  get titleClasses(): string {
    return cn('text-lg font-semibold leading-none tracking-tight', this.class);
  }
}

@Component({
  selector: 'ui-dialog-description',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p [class]="descriptionClasses">
      <ng-content></ng-content>
    </p>
  `,
})
export class DialogDescriptionComponent {
  @Input() class: string = '';

  get descriptionClasses(): string {
    return cn('text-sm text-muted-foreground', this.class);
  }
}

@Component({
  selector: 'ui-dialog-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="footerClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class DialogFooterComponent {
  @Input() class: string = '';

  get footerClasses(): string {
    return cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', this.class);
  }
}

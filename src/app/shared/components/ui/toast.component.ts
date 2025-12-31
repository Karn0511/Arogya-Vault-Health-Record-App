import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../core/utils/cn';
import { ToastService } from './toast.service';
import type { Toast } from './toast.service';

const toastVariants = cva(
    'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
    {
        variants: {
            variant: {
                default: 'border bg-background text-foreground',
                destructive:
                    'destructive group border-destructive bg-destructive text-destructive-foreground',
                success:
                    'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export type ToastVariants = VariantProps<typeof toastVariants>;

@Component({
    selector: 'ui-toast',
    standalone: true,
    imports: [CommonModule],
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(100%)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' })),
            ]),
        ]),
    ],
    template: `
    <div
      @toastAnimation
      [class]="toastClasses"
      role="alert"
    >
      <div class="grid gap-1">
        <div *ngIf="title" class="text-sm font-semibold">{{ title }}</div>
        <div *ngIf="description" class="text-sm opacity-90">{{ description }}</div>
      </div>
      <button
        (click)="onClose()"
        class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
})
export class ToastComponent {
    @Input() title?: string;
    @Input() description?: string;
    @Input() variant: ToastVariants['variant'] = 'default';
    @Input() class: string = '';
    @Output() close = new EventEmitter<void>();

    get toastClasses(): string {
        return cn(toastVariants({ variant: this.variant }), this.class);
    }

    onClose(): void {
        this.close.emit();
    }
}

@Component({
    selector: 'ui-toaster',
    standalone: true,
    imports: [CommonModule, ToastComponent],
    template: `
    <div class="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]">
      <ui-toast
        *ngFor="let toast of toasts$ | async"
        [title]="toast.title"
        [description]="toast.description"
        [variant]="toast.variant || 'default'"
        (close)="dismissToast(toast.id)"
      ></ui-toast>
    </div>
  `,
})
export class ToasterComponent {
    toasts$ = this.toastService.toasts$;

    constructor(private toastService: ToastService) { }

    dismissToast(id: string): void {
        this.toastService.dismiss(id);
    }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../core/utils/cn';

const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    {
        variants: {
            variant: {
                default: 'bg-background text-foreground',
                destructive:
                    'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
                success:
                    'border-green-500/50 text-green-900 dark:text-green-100 bg-green-50 dark:bg-green-900/20 [&>svg]:text-green-600',
                warning:
                    'border-yellow-500/50 text-yellow-900 dark:text-yellow-100 bg-yellow-50 dark:bg-yellow-900/20 [&>svg]:text-yellow-600',
                info:
                    'border-blue-500/50 text-blue-900 dark:text-blue-100 bg-blue-50 dark:bg-blue-900/20 [&>svg]:text-blue-600',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export type AlertVariants = VariantProps<typeof alertVariants>;

@Component({
    selector: 'ui-alert',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="alertClasses" role="alert">
      <ng-content></ng-content>
    </div>
  `,
})
export class AlertComponent {
    @Input() variant: AlertVariants['variant'] = 'default';
    @Input() class: string = '';

    get alertClasses(): string {
        return cn(alertVariants({ variant: this.variant }), this.class);
    }
}

@Component({
    selector: 'ui-alert-title',
    standalone: true,
    imports: [CommonModule],
    template: `
    <h5 [class]="titleClasses">
      <ng-content></ng-content>
    </h5>
  `,
})
export class AlertTitleComponent {
    @Input() class: string = '';

    get titleClasses(): string {
        return cn('mb-1 font-medium leading-none tracking-tight', this.class);
    }
}

@Component({
    selector: 'ui-alert-description',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="descriptionClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class AlertDescriptionComponent {
    @Input() class: string = '';

    get descriptionClasses(): string {
        return cn('text-sm [&_p]:leading-relaxed', this.class);
    }
}

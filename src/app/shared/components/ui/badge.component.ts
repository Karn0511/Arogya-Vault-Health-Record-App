import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../core/utils/cn';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20',
                secondary:
                    'border-transparent bg-slate-800 text-slate-300 hover:bg-slate-700',
                destructive:
                    'border-transparent bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20',
                outline: 'text-slate-400 border-slate-700',
                info: 'border-transparent bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20',
                warning: 'border-transparent bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20',
                glow: 'border-transparent bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse'
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

@Component({
    selector: 'ui-badge',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div [class]="badgeClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class BadgeComponent {
    @Input() variant: BadgeVariants['variant'] = 'default';
    @Input() class: string = '';

    get badgeClasses(): string {
        return cn(badgeVariants({ variant: this.variant }), this.class);
    }
}

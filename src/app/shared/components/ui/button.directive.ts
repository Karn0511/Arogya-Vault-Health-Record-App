import { Directive, HostBinding, Input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../../core/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border border-white/10',
        destructive:
          'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/10',
        outline:
          'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200',
        secondary:
          'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
        ghost: 'hover:bg-slate-800/50 text-slate-400 hover:text-white',
        link: 'text-blue-400 underline-offset-4 hover:underline',
        glow: 'bg-blue-500/10 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:bg-blue-500/20',
        glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 shadow-xl'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-lg px-3',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Directive({
  selector: '[uiButton]',
  standalone: true,
})
export class ButtonDirective {
  @Input() variant: ButtonVariants['variant'] = 'default';
  @Input() size: ButtonVariants['size'] = 'default';
  @Input() class: string = '';

  @HostBinding('class')
  get classes(): string {
    return cn(buttonVariants({ variant: this.variant, size: this.size }), this.class);
  }

  @HostBinding('attr.type')
  @Input()
  type: 'button' | 'submit' | 'reset' = 'button';
}

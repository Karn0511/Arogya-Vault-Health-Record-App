import { Directive, HostBinding, Input } from '@angular/core';
import { cn } from '../../../core/utils/cn';

@Directive({
    selector: '[uiInput]',
    standalone: true,
})
export class InputDirective {
    @Input() class: string = '';

    @HostBinding('class')
    get classes(): string {
        return cn(
            'flex h-11 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-100 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-blue-500/50 focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            this.class
        );
    }
}

@Directive({
    selector: '[uiLabel]',
    standalone: true,
})
export class LabelDirective {
    @Input() class: string = '';

    @HostBinding('class')
    get classes(): string {
        return cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300',
            this.class
        );
    }
}

@Directive({
    selector: '[uiTextarea]',
    standalone: true,
})
export class TextareaDirective {
    @Input() class: string = '';

    @HostBinding('class')
    get classes(): string {
        return cn(
            'flex min-h-[100px] w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-blue-500/50 focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
            this.class
        );
    }
}

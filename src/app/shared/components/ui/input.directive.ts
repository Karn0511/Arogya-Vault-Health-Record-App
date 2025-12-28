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
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
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
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            this.class
        );
    }
}

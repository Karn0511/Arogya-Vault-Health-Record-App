import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../core/utils/cn';

@Component({
    selector: 'ui-separator',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      [class]="separatorClasses"
      role="separator"
      [attr.aria-orientation]="orientation"
    ></div>
  `,
})
export class SeparatorComponent {
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() decorative: boolean = true;
    @Input() class: string = '';

    get separatorClasses(): string {
        return cn(
            'shrink-0 bg-border',
            this.orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
            this.class
        );
    }
}

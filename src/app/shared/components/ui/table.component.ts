import { Directive, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../core/utils/cn';

@Component({
    selector: 'ui-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative w-full overflow-auto">
      <table [class]="tableClasses">
        <ng-content></ng-content>
      </table>
    </div>
  `,
})
export class TableComponent {
    @Input() class: string = '';

    get tableClasses(): string {
        return cn('w-full caption-bottom text-sm', this.class);
    }
}

@Directive({
    selector: '[uiTableHeader]',
    standalone: true,
})
export class TableHeaderDirective {
    @Input() class: string = '';

    get classes(): string {
        return cn('[&_tr]:border-b', this.class);
    }
}

@Directive({
    selector: '[uiTableBody]',
    standalone: true,
})
export class TableBodyDirective {
    @Input() class: string = '';

    get classes(): string {
        return cn('[&_tr:last-child]:border-0', this.class);
    }
}

@Directive({
    selector: '[uiTableFooter]',
    standalone: true,
})
export class TableFooterDirective {
    @Input() class: string = '';

    get classes(): string {
        return cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', this.class);
    }
}

@Directive({
    selector: '[uiTableRow]',
    standalone: true,
})
export class TableRowDirective {
    @Input() class: string = '';

    get classes(): string {
        return cn(
            'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
            this.class
        );
    }
}

@Directive({
    selector: '[uiTableHead]',
    standalone: true,
})
export class TableHeadDirective {
    @Input() class: string = '';

    get classes(): string {
        return cn(
            'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
            this.class
        );
    }
}

@Directive({
    selector: '[uiTableCell]',
    standalone: true,
})
export class TableCellDirective {
    @Input() class: string = '';

    get classes(): string {
        return cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', this.class);
    }
}

@Component({
    selector: 'ui-table-caption',
    standalone: true,
    imports: [CommonModule],
    template: `
    <caption [class]="captionClasses">
      <ng-content></ng-content>
    </caption>
  `,
})
export class TableCaptionComponent {
    @Input() class: string = '';

    get captionClasses(): string {
        return cn('mt-4 text-sm text-muted-foreground', this.class);
    }
}

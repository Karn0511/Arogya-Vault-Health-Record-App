import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../core/utils/cn';

@Component({
    selector: 'ui-tab',
    standalone: true,
    template: `<ng-content></ng-content>`,
})
export class TabComponent {
    @Input() label!: string;
    @Input() value!: string;
    @Input() disabled: boolean = false;
}

@Component({
    selector: 'ui-tabs',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div [class]="tabsClasses">
      <!-- Tab List -->
      <div [class]="tabListClasses">
        <button
          *ngFor="let tab of tabs"
          type="button"
          [class]="getTabTriggerClasses(tab.value)"
          [disabled]="tab.disabled"
          (click)="selectTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="mt-2">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class TabsComponent implements AfterContentInit {
    @Input() defaultValue?: string;
    @Input() value?: string;
    @Input() class: string = '';
    @Output() valueChange = new EventEmitter<string>();

    @ContentChildren(TabComponent) tabComponents!: QueryList<TabComponent>;

    tabs: TabComponent[] = [];
    activeTab?: string;

    ngAfterContentInit(): void {
        this.tabs = this.tabComponents.toArray();
        this.activeTab = this.value || this.defaultValue || this.tabs[0]?.value;
    }

    get tabsClasses(): string {
        return cn('w-full', this.class);
    }

    get tabListClasses(): string {
        return cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground'
        );
    }

    getTabTriggerClasses(value: string): string {
        const isActive = this.activeTab === value;
        return cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'hover:bg-background/50'
        );
    }

    selectTab(value: string): void {
        this.activeTab = value;
        this.value = value;
        this.valueChange.emit(value);
    }
}

@Component({
    selector: 'ui-tab-content',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isActive" [class]="contentClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class TabContentComponent {
    @Input() value!: string;
    @Input() class: string = '';
    @Input() activeTab?: string;

    get isActive(): boolean {
        return this.value === this.activeTab;
    }

    get contentClasses(): string {
        return cn(
            'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            this.class
        );
    }
}

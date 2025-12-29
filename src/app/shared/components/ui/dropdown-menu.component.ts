import {
  Component,
  Directive,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  ContentChild,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { cn } from '../../../core/utils/cn';

@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative inline-block text-left">
      <ng-content></ng-content>
    </div>
  `,
})
export class DropdownMenuComponent {
  open = false;

  @Output() openChange = new EventEmitter<boolean>();

  toggle() {
    this.open = !this.open;
    this.openChange.emit(this.open);
    this.cdr.markForCheck();
  }

  close() {
    if (this.open) {
      this.open = false;
      this.openChange.emit(this.open);
      this.cdr.markForCheck();
    }
  }

  constructor(private elementRef: ElementRef, private cdr: ChangeDetectorRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}

@Directive({
  selector: '[uiDropdownTrigger]',
  standalone: true,
  host: {
    '[attr.aria-haspopup]': '"true"',
    '[attr.aria-expanded]': 'menu.open',
    '(click)': 'toggle($event)',
  },
})
export class DropdownMenuTriggerDirective {
  constructor(public menu: DropdownMenuComponent) {}

  toggle(event: MouseEvent) {
    // Prevent the click from bubbling up to the document and closing the menu immediately
    // or interfering with other handlers.
    // However, since onDocumentClick checks for containment, bubbling is fine IF the trigger is inside the menu component.
    // If the trigger is projected inside the menu component (which it is), the click target IS contained.
    // So onDocumentClick won't close it.
    // We just need to toggle.
    this.menu.toggle();
  }
}

@Component({
  selector: 'ui-dropdown-menu-content',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('75ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
  template: `
    <div
      *ngIf="menu.open"
      @dropdownAnimation
      [class]="classes"
      role="menu"
      [attr.aria-orientation]="'vertical'"
      [attr.aria-labelledby]="'options-menu'"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class DropdownMenuContentComponent {
  @Input() class: string = '';
  @Input() align: 'start' | 'end' | 'center' = 'end';

  constructor(public menu: DropdownMenuComponent, private cdr: ChangeDetectorRef) {}

  ngDoCheck() {
    this.cdr.markForCheck();
  }

  get classes(): string {
    return cn(
      'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
      {
        'left-0': this.align === 'start',
        'right-0': this.align === 'end',
        'left-1/2 -translate-x-1/2': this.align === 'center',
      },
      'mt-2', // Add some margin from the trigger
      this.class
    );
  }
}

@Component({
  selector: 'ui-dropdown-menu-item',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes" role="menuitem" (click)="onClick($event)">
      <ng-content></ng-content>
    </div>
  `,
})
export class DropdownMenuItemComponent {
  @Input() class: string = '';
  @Input() disabled: boolean = false;

  constructor(private menu: DropdownMenuComponent) {}

  get classes(): string {
    return cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      this.disabled && 'pointer-events-none opacity-50',
      this.class
    );
  }

  onClick(event: MouseEvent) {
    if (this.disabled) {
      event.stopPropagation();
      return;
    }
    this.menu.close();
  }
}

@Component({
  selector: 'ui-dropdown-menu-label',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes">
      <ng-content></ng-content>
    </div>
  `,
})
export class DropdownMenuLabelComponent {
  @Input() class: string = '';

  get classes(): string {
    return cn('px-2 py-1.5 text-sm font-semibold', this.class);
  }
}

@Component({
  selector: 'ui-dropdown-menu-separator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="classes"></div>
  `,
})
export class DropdownMenuSeparatorComponent {
  @Input() class: string = '';

  get classes(): string {
    return cn('-mx-1 my-1 h-px bg-muted', this.class);
  }
}

@Component({
  selector: 'ui-dropdown-menu-shortcut',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes">
      <ng-content></ng-content>
    </span>
  `,
})
export class DropdownMenuShortcutComponent {
  @Input() class: string = '';

  get classes(): string {
    return cn('ml-auto text-xs tracking-widest opacity-60', this.class);
  }
}

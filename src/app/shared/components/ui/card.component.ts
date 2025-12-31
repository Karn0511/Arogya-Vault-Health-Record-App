import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../core/utils/cn';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() class: string = '';

  get cardClasses(): string {
    return cn(
      'rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm text-slate-100 shadow-xl overflow-hidden transition-all duration-300',
      this.class
    );
  }
}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="headerClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardHeaderComponent {
  @Input() class: string = '';

  get headerClasses(): string {
    return cn('flex flex-col space-y-2 p-6', this.class);
  }
}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h3 [class]="titleClasses">
      <ng-content></ng-content>
    </h3>
  `,
})
export class CardTitleComponent {
  @Input() class: string = '';

  get titleClasses(): string {
    return cn('text-xl font-bold leading-none tracking-tight text-white', this.class);
  }
}

@Component({
  selector: 'ui-card-description',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p [class]="descriptionClasses">
      <ng-content></ng-content>
    </p>
  `,
})
export class CardDescriptionComponent {
  @Input() class: string = '';

  get descriptionClasses(): string {
    return cn('text-sm text-slate-400', this.class);
  }
}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="contentClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardContentComponent {
  @Input() class: string = '';

  get contentClasses(): string {
    return cn('p-6 pt-0', this.class);
  }
}

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="footerClasses">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardFooterComponent {
  @Input() class: string = '';

  get footerClasses(): string {
    return cn('flex items-center p-6 pt-0', this.class);
  }
}

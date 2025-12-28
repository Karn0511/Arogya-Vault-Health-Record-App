import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  @Input() class = '';
  @Input() hoverable = true;
  @Input() glowing = false;

  get cardClasses(): string {
    const base = 'rounded-lg border bg-card text-card-foreground shadow-sm';
    const hover = this.hoverable ? 'transition-all hover:shadow-lg hover:-translate-y-1' : '';
    const glow = this.glowing ? 'relative before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-primary/20 before:to-secondary/20 before:blur-xl before:-z-10' : '';
    return `${base} ${hover} ${glow} ${this.class}`;
  }
}

@Component({
  selector: 'app-ui-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col space-y-1.5 p-6">
      <ng-content></ng-content>
    </div>
  `
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-ui-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="text-2xl font-semibold leading-none tracking-tight">
      <ng-content></ng-content>
    </h3>
  `
})
export class CardTitleComponent {}

@Component({
  selector: 'app-ui-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p class="text-sm text-muted-foreground">
      <ng-content></ng-content>
    </p>
  `
})
export class CardDescriptionComponent {}

@Component({
  selector: 'app-ui-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 pt-0">
      <ng-content></ng-content>
    </div>
  `
})
export class CardContentComponent {}

@Component({
  selector: 'app-ui-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center p-6 pt-0">
      <ng-content></ng-content>
    </div>
  `
})
export class CardFooterComponent {}

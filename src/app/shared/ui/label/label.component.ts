import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-label',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label [class]="labelClasses">
      <ng-content></ng-content>
    </label>
  `
})
export class LabelComponent {
  @Input() class = '';

  get labelClasses(): string {
    return `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${this.class}`;
  }
}

import { Component, Input, forwardRef, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  value: number | string;
  label: string;
}

@Component({
  selector: 'app-animated-dropdown',
  templateUrl: './animated-dropdown.component.html',
  styleUrls: ['./animated-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AnimatedDropdownComponent),
      multi: true,
    },
  ],
})
export class AnimatedDropdownComponent implements ControlValueAccessor, OnDestroy {
  @Input() label = '';
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select...';

  open = false;
  value: number | string | null = null;
  touched = false;

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLElement>) {}

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    // Not used currently
  }

  toggle(): void {
    this.open = !this.open;
    if (this.open) {
      // mark touched when user interacts
      this.markTouched();
    }
  }

  select(opt: DropdownOption): void {
    this.value = opt.value;
    this.onChange(this.value);
    this.open = false;
    this.markTouched();
  }

  displayedLabel(): string {
    const found = this.options.find(o => o.value === this.value);
    return found ? found.label : this.placeholder;
  }

  markTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(ev: MouseEvent) {
    if (!this.el.nativeElement.contains(ev.target as Node)) {
      this.open = false;
    }
  }

  ngOnDestroy(): void {}
}

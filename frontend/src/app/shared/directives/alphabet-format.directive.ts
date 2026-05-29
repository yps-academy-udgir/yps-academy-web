import {
  Directive,
  ElementRef,
  HostListener,
  Input
} from '@angular/core';
import { NgControl } from '@angular/forms';



@Directive({
  selector: '[appAlphabetOnly]'
})
export class AlphabetOnlyDirective {

  @Input() textType:
    | 'UPPERCASE'
    | 'LOWERCASE'
    | 'CAPITALIZE_FIRST'
    | 'TITLE_CASE' = 'TITLE_CASE';

  constructor(private el: ElementRef, private ngControl: NgControl) {}

  // Restrict numbers and special characters
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {

    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Shift',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      ' '
    ];

    // Allow control keys
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow alphabets only
    const regex = /^[a-zA-Z]$/;

    if (!regex.test(event.key)) {
      event.preventDefault();

      this.ngControl.control?.markAsTouched();

      this.ngControl.control?.setErrors({
        alphabetOnly: {
          message: 'Only alphabets are allowed'
        }
      });
    }
  }

  // Apply text transformation
  @HostListener('input')
  onInput(): void {

    const input = this.el.nativeElement as HTMLInputElement;

    let value = input.value;

    switch (this.textType) {

      case 'UPPERCASE':
        value = value.toUpperCase();
        break;

      case 'LOWERCASE':
        value = value.toLowerCase();
        break;

      case 'CAPITALIZE_FIRST':
        value =
          value.charAt(0).toUpperCase() +
          value.slice(1).toLowerCase();
        break;

      case 'TITLE_CASE':
        value = value
          .toLowerCase()
          .replace(/\b\w/g, char => char.toUpperCase());
        break;
    }

    input.value = value;
  }
}

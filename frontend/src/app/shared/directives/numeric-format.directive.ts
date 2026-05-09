import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * appNumericFormat
 *
 * Formats a numeric input with auto-inserted delimiters while exposing
 * the raw (delimiter-free) value to ngModel / Reactive Forms.
 *
 * Inputs:
 *   [length]        number[]  Segment pattern e.g. [4,4,4] (Aadhaar), [5,5] (Mobile), [4,4,4,4] (Account)
 *   [delimiterType] string    Delimiter char e.g. '-' or ' '  (default: '-')
 *   [numericOnly]   boolean   Block non-digit keystrokes       (default: true)
 *
 *  issue regarding merge
 * Usage examples:
 *   <input appNumericFormat [length]="[4,4,4]"   delimiterType="-" />   → XXXX-XXXX-XXXX  (Aadhaar)
 *   <input appNumericFormat [length]="[5,5]"     delimiterType="-" />   → XXXXX-XXXXX     (Mobile)
 *   <input appNumericFormat [length]="[4,4,4,4]" delimiterType=" " />   → XXXX XXXX XXXX XXXX (Account)
 */
@Directive({
  selector: '[appNumericFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumericFormatDirective),
      multi: true
    }
  ]
})
export class NumericFormatDirective implements ControlValueAccessor {

  /** Segment lengths — defines where delimiters are inserted. e.g. [4,4,4] */
  @Input() length: number[] = [];

  /** Delimiter character inserted between segments. Default: '-' */
  @Input() delimiterType: string = '-';

  /** When true (default), blocks any non-digit keystroke */
  @Input() numericOnly: boolean = true;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  // ─── ControlValueAccessor ───────────────────────────────────────────────

  writeValue(value: string): void {
    const raw = this.stripDelimiters(value ?? '');
    this.el.nativeElement.value = this.formatValue(raw);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  // ─── Host Listeners ─────────────────────────────────────────────────────

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.numericOnly) return;

    const passthroughKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Allow control shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X)
    if (passthroughKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    // Block non-digit characters
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Block input beyond total allowed length (only when nothing is selected)
    const totalLength = this.totalLength;
    if (totalLength > 0) {
      const input = this.el.nativeElement;
      const selectionLen = (input.selectionEnd ?? 0) - (input.selectionStart ?? 0);
      const raw = this.stripDelimiters(input.value);
      if (raw.length >= totalLength && selectionLen === 0) {
        event.preventDefault();
      }
    }
  }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    const selectionStart = input.selectionStart ?? input.value.length;

    // Count raw digits before the current cursor position
    const rawDigitsBefore = this.stripDelimiters(
      input.value.substring(0, selectionStart)
    ).length;

    const raw = this.stripDelimiters(input.value);

    // Enforce max length
    const trimmed = this.totalLength > 0 ? raw.substring(0, this.totalLength) : raw;

    const formatted = this.formatValue(trimmed);
    input.value = formatted;

    // Restore cursor to the correct position after re-formatting
    const newPos = this.getCursorPosition(formatted, rawDigitsBefore);
    input.setSelectionRange(newPos, newPos);

    // Emit raw value (no delimiters) to the form control
    this.onChange(trimmed);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private get totalLength(): number {
    return this.length.reduce((sum, seg) => sum + seg, 0);
  }

  /** Remove all occurrences of the delimiter (and non-digits when numericOnly) */
  private stripDelimiters(value: string): string {
    // Escape special regex characters in the delimiter
    const escaped = this.delimiterType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let result = value.replace(new RegExp(escaped, 'g'), '');
    if (this.numericOnly) {
      result = result.replace(/\D/g, '');
    }
    return result;
  }

  /** Insert delimiters between segments according to the [length] pattern */
  private formatValue(raw: string): string {
    if (!this.length.length) return raw;

    const parts: string[] = [];
    let index = 0;

    for (const segLen of this.length) {
      if (index >= raw.length) break;
      parts.push(raw.substring(index, index + segLen));
      index += segLen;
    }

    return parts.join(this.delimiterType);
  }

  /**
   * Maps rawDigitsBefore (count of digits before cursor in raw string) back
   * to the correct character index in the formatted string, skipping delimiters.
   */
  private getCursorPosition(formatted: string, rawDigitsBefore: number): number {
    let rawCount = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (rawCount === rawDigitsBefore) return i;
      if (formatted[i] !== this.delimiterType) rawCount++;
    }
    return formatted.length;
  }
}

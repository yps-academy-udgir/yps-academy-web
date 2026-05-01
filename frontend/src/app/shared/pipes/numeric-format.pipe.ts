import { Pipe, PipeTransform } from '@angular/core';

/**
 * numericFormat pipe
 *
 * Formats a raw digit string into a delimited display string.
 * Mirrors the segment logic used by the appNumericFormat directive.
 *
 * Usage:
 *   {{ emp.mobile  | numericFormat:[5,5]:'−'  }}   →  XXXXX-XXXXX
 *   {{ emp.aadhaar | numericFormat:[4,4,4]:'-' }}   →  XXXX-XXXX-XXXX
 *   {{ emp.account | numericFormat:[4,4,4,4]:' ' }} →  XXXX XXXX XXXX XXXX
 */
@Pipe({ name: 'numericFormat' })
export class NumericFormatPipe implements PipeTransform {
  transform(value: string, length: number[], delimiter: string = '-'): string {
    if (!value || !length?.length) return value ?? '';

    const raw = value.replace(/\D/g, '');
    const parts: string[] = [];
    let index = 0;

    for (const segLen of length) {
      if (index >= raw.length) break;
      parts.push(raw.substring(index, index + segLen));
      index += segLen;
    }

    return parts.join(delimiter);
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FacultyPaymentReceiptData } from '../../models/faculty-payment-receipt.model';
import { ResultExportService } from '../../services/result-export.service';

@Component({
  selector: 'app-faculty-payment-receipt',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './faculty-payment-receipt.component.html',
  styleUrl: './faculty-payment-receipt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyPaymentReceiptComponent {
  readonly receipt = input.required<FacultyPaymentReceiptData>();

  @ViewChild('receiptContainer')
  private receiptContainer?: ElementRef<HTMLElement>;

  private exportService = inject(ResultExportService);

  async downloadPdf(): Promise<void> {
    await this.doExport('pdf');
  }

  async downloadPng(): Promise<void> {
    await this.doExport('png');
  }

  private async doExport(format: 'pdf' | 'png'): Promise<void> {
    const el = this.receiptContainer?.nativeElement;
    if (!el) return;
    const r = this.receipt();

    try {
      if ((document as any).fonts && (document as any).fonts.ready) await (document as any).fonts.ready;
    } catch {
      // ignore
    }
    await new Promise((res) => setTimeout(res, 60));

    await this.exportService.export(el, {
      format,
      fileBaseName: `faculty-payment-receipt-${r.facultyId}-${r.receiptNo}`,
      metadata: {
        academyName: r.header.academyName,
        reportTitle: r.header.reportTitle,
        studentName: r.facultyName,
      },
    });
  }
}

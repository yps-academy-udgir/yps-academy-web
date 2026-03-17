import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FeeReceiptData } from '../../models/fee-receipt.model';
import { ResultExportService } from '../../services/result-export.service';

@Component({
  selector: 'app-fee-receipt',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './fee-receipt.component.html',
  styleUrl: './fee-receipt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeeReceiptComponent {
  readonly receipt = input.required<FeeReceiptData>();

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
    // Ensure fonts and layout are settled before capture
    try {
      if ((document as any).fonts && (document as any).fonts.ready) await (document as any).fonts.ready;
    } catch {
      // ignore
    }
    await new Promise((res) => setTimeout(res, 60));

    await this.exportService.export(el, {
      format,
      fileBaseName: `fee-receipt-${r.studentId}-${r.receiptNo}`,
      metadata: {
        academyName: r.header.academyName,
        reportTitle: r.header.reportTitle,
        studentName: r.studentName,
      },
    });
  }
}

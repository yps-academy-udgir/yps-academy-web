import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type ResultExportFormat = 'pdf' | 'png' | 'jpg';

export interface ResultExportMetadata {
  academyName: string;
  reportTitle: string;
  classLabel?: string;
  sectionLabel?: string;
  examLabel?: string;
  periodLabel?: string;
  generatedOn?: string;
  studentName?: string;
}

export interface ResultExportOptions {
  fileBaseName: string;
  format: ResultExportFormat;
  metadata: ResultExportMetadata;
  backgroundColor?: string;
  scale?: number;
}

@Injectable({ providedIn: 'root' })
export class ResultExportService {
  async export(element: HTMLElement, options: ResultExportOptions): Promise<void> {
    const canvas = await this.capture(element, options);

    if (options.format === 'pdf') {
      this.exportPdf(canvas, options.fileBaseName);
      return;
    }

    const mimeType = options.format === 'png' ? 'image/png' : 'image/jpeg';
    const quality = options.format === 'png' ? undefined : 0.95;
    const dataUrl = canvas.toDataURL(mimeType, quality);
    this.downloadDataUrl(dataUrl, `${options.fileBaseName}.${options.format}`);
  }

  private async capture(element: HTMLElement, options: ResultExportOptions): Promise<HTMLCanvasElement> {
    const deviceScale = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    return html2canvas(element, {
      backgroundColor: options.backgroundColor ?? '#ffffff',
      scale: options.scale ?? Math.max(deviceScale, 3),
      useCORS: true,
      foreignObjectRendering: true,
      removeContainer: true,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });
  }

  private exportPdf(canvas: HTMLCanvasElement, fileBaseName: string): void {
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usablePageHeight = pageHeight - margin * 2;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imageData, 'PNG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');

    let heightLeft = imgHeight - usablePageHeight;
    while (heightLeft > 0) {
      const offsetY = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', margin, offsetY, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= usablePageHeight;
    }

    pdf.save(`${fileBaseName}.pdf`);
  }

  private downloadDataUrl(dataUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  }
}
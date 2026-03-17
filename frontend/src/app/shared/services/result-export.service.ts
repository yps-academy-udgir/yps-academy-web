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

    // Wait for web fonts to be ready so text renders correctly in the canvas
    try {
      if (typeof document !== 'undefined' && (document as any).fonts && (document as any).fonts.ready) {
        await (document as any).fonts.ready;
      }
    } catch {
      // ignore
    }

    // Clamp scale to avoid extremely large canvases while keeping crisp output
    const scale = options.scale ?? Math.min(Math.max(deviceScale, 1), 2);

    return html2canvas(element, {
      backgroundColor: options.backgroundColor ?? '#ffffff',
      scale,
      useCORS: true,
      // foreignObjectRendering can cause inconsistent results in some browsers; keep false for better fidelity
      foreignObjectRendering: false,
      removeContainer: true,
      logging: false,
      // prefer visible element sizes to capture the rendered layout
      windowWidth: element.offsetWidth || element.scrollWidth,
      windowHeight: element.offsetHeight || element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });
  }

  private exportPdf(canvas: HTMLCanvasElement, fileBaseName: string): void {
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const usablePageWidth = pageWidth - margin * 2;
    const usablePageHeight = pageHeight - margin * 2;

    // Calculate mm per px scaling so we can slice the canvas into page-height chunks
    const mmPerPx = usablePageWidth / canvas.width;
    const fullImgHeightMM = canvas.height * mmPerPx;
    const totalPages = Math.ceil(fullImgHeightMM / usablePageHeight);

    const slicePxHeight = Math.floor(usablePageHeight / mmPerPx) || canvas.height;

    for (let page = 0; page < totalPages; page++) {
      const srcY = page * slicePxHeight;
      const thisSliceHeight = Math.min(slicePxHeight, canvas.height - srcY);

      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = canvas.width;
      tmpCanvas.height = thisSliceHeight;
      const ctx = tmpCanvas.getContext('2d');
      if (!ctx) continue;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);
      ctx.drawImage(canvas, 0, srcY, canvas.width, thisSliceHeight, 0, 0, canvas.width, thisSliceHeight);

      const imgData = tmpCanvas.toDataURL('image/png');
      const imgHeightMM = thisSliceHeight * mmPerPx;

      if (page > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin, usablePageWidth, imgHeightMM, undefined, 'FAST');
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
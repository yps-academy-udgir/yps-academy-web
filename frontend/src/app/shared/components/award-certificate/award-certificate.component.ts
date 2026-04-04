import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResultExportService } from '../../services/result-export.service';
import { environment } from '../../../../environments/environment';

export interface AwardCertificateData {
  rank: number;
  studentName: string;
  studentImage?: string | null;
  percentage: number;
  totalMarksObtained: number;
  totalOutOf: number;
  class: string;
  examType: string;
  monthLabel: string;
  year: number;
  /** Dynamic title — e.g. "Certificate of Excellence", "Annual Award" */
  certificateTitle: string;
  /** Dynamic congratulatory message body */
  message: string;
  academyName: string;
}

@Component({
  selector: 'app-award-certificate',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './award-certificate.component.html',
  styleUrl: './award-certificate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwardCertificateComponent {
  readonly data = input.required<AwardCertificateData>();
  readonly showActions = input(true);

  @ViewChild('certContainer')
  certContainer?: ElementRef<HTMLElement>;

  private exportService = inject(ResultExportService);

  getImageUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;

    const normalized = path.replace(/\\/g, '/');
    const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
    return environment.apiUrl.replace('/api', '') + withSlash;
  }

  /** Medal emoji for ranks 1-3, ribbon for others */
  getMedal(): string {
    switch (this.data().rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🎖️';
    }
  }

  getRankSuffix(): string {
    const r = this.data().rank;
    if (r === 1) return 'st';
    if (r === 2) return 'nd';
    if (r === 3) return 'rd';
    return 'th';
  }

  getRankClass(): string {
    switch (this.data().rank) {
      case 1: return 'rank-gold';
      case 2: return 'rank-silver';
      case 3: return 'rank-bronze';
      default: return 'rank-other';
    }
  }

  initials(): string {
    return this.data()
      .studentName.split(' ')
      .slice(0, 2)
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase();
  }

  async downloadPdf(): Promise<void> {
    await this.doExport('pdf');
  }

  async downloadPng(): Promise<void> {
    await this.doExport('png');
  }

  async downloadJpg(): Promise<void> {
    await this.doExport('jpg');
  }

  private async doExport(format: 'pdf' | 'png' | 'jpg'): Promise<void> {
    const el = this.certContainer?.nativeElement;
    if (!el) return;
    const d = this.data();
    await this.exportService.export(el, {
      format,
      fileBaseName: `certificate-rank${d.rank}-${d.studentName.replace(/\s+/g, '-').toLowerCase()}`,
      metadata: {
        academyName: d.academyName,
        reportTitle: d.certificateTitle,
        studentName: d.studentName,
        classLabel: d.class,
        examLabel: d.examType,
        periodLabel: `${d.monthLabel} ${d.year}`,
      },
      backgroundColor: '#ffffff',
      scale: 2,
    });
  }
}

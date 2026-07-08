import { ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { Student } from '../../../../shared/models/student.model';
import { RoleService } from '../../../../shared/services/role.service';
import { SharedMaterialModule } from "../../../../shared/shared-material.module";
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../../shared/services/student.service';
import { IdCardData } from '../../../../shared/models/idCard.model';
import { ResultExportService } from '../../../../shared/services/result-export.service';

@Component({
  selector: 'app-id-card.component',
  imports: [SharedMaterialModule],
  templateUrl: './id-card.component.html',
  styleUrl: './id-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdCardComponent implements OnInit {
idCard = signal<IdCardData | null>(null);

  @ViewChild('idCardContainer')
idCardContainer?: ElementRef<HTMLElement>;

  private exportService = inject(ResultExportService);

 private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);
  private roleService = inject(RoleService);


  student = signal<Student | null>(null);


    ngOnInit(): void {
      const studentId = this.route.snapshot.paramMap.get('id');

  if (!studentId) return;

  this.studentService.getStudentById(studentId).subscribe({
    next: (response) => {
      if (!response.data) return;

      const student = response.data;

      this.student.set(student);

      this.idCard.set({
        header: {
          academyName: 'YPS Academy',
          academySubtitle: 'Academy Udgir',
          address: '',
          contact: '',
          email: '',
          reportType: 'CLASS_MARKS',
          reportTitle: ''
        },
        studentName: `${student.firstName} ${student.lastName}`,
        studentId: student._id ?? '',
        rollNumber: student.rollNumber,
        class: student.academicDetails?.class ?? '',
        contact: student.contact
      });
    }
  });
      
    }
  onBack(): void {
    if (this.roleService.isStudent()) {
      this.router.navigate(['/my-fees']);
      return;
    }
    const student = this.student();
    if (student?._id) {
      this.router.navigate(['/students', 'management', student._id]);
      return;
    }
    this.router.navigate(['/students', 'management', 'list']);
  }
    
async downloadPdf(): Promise<void> {
    await this.doExport('pdf');
  }
async downloadPng(): Promise<void> {
    await this.doExport('png');
  }


 private async doExport(format: 'pdf' | 'png'): Promise<void> {
  const el = this.idCardContainer?.nativeElement;
  if (!el) return;

  const card = this.idCard();

  // Ensure fonts and layout are settled before capture
  try {
    if ((document as any).fonts?.ready) {
      await (document as any).fonts.ready;
    }
  } catch {
    // ignore
  }

  await new Promise((res) => setTimeout(res, 60));

  

if (!card) {
  console.error('ID Card data not available');
  return;
}
  await this.exportService.export(el, {
    format,
    fileBaseName: `student-id-card-${card.studentId}`,
    metadata: {
      academyName: card.header.academyName,
      studentName: card.studentName,
      class: `${card.class}${card.section ? '-' + card.section : ''}`,
    } as any,
  });
}

}


import { Injectable } from '@angular/core';
import {
  ClassMarksHeaderParams,
  ClassMarksReportHeader,
  ReportMeta,
  StudentMarksHeaderParams,
  StudentMarksReportHeader,
} from '../models/report-header.model';

/** Shared academy details — single source of truth for all printable reports. */
const ACADEMY: Pick<ReportMeta, 'academyName' | 'academySubtitle' | 'address' | 'contact' | 'email'> = {
  academyName: 'YPS Academy',
  academySubtitle: 'Coaching Institute',
  address: 'YPS Academy, Main Street, City',
  contact: '+91 00000 00000',
  email: 'info@ypsacademy.in',
};

/**
 * ReportHeaderService
 *
 * Central service that builds typed header objects for every printable report
 * in the application (class marks report, individual student marks report,
 * and fee receipts).  Components inject this service instead of hard-coding
 * academy details or repeating header-construction logic.
 */
@Injectable({ providedIn: 'root' })
export class ReportHeaderService {
  /** Base academy meta — reuse in any custom report. */
  getAcademyMeta(): Pick<ReportMeta, 'academyName' | 'academySubtitle' | 'address' | 'contact' | 'email'> {
    return { ...ACADEMY };
  }

  /**
   * Build the full header for a class-level marks report.
   * Used by the Results List component and its PDF/image export.
   */
  buildClassMarksHeader(params: ClassMarksHeaderParams): ClassMarksReportHeader {
    return {
      ...ACADEMY,
      reportType: 'CLASS_MARKS',
      reportTitle: 'Class Marks Report',
      class: params.class,
      section: params.section,
      examType: params.examType,
      month: params.month,
      year: params.year,
      totalStudents: params.totalStudents,
      generatedOn: params.generatedOn ?? new Date().toLocaleString(),
    };
  }

  /**
   * Build the full header for an individual-student marks report.
   * Used when printing / exporting a single student’s result card.
   */
  buildStudentMarksHeader(params: StudentMarksHeaderParams): StudentMarksReportHeader {
    return {
      ...ACADEMY,
      reportType: 'STUDENT_MARKS',
      reportTitle: 'Student Marks Report',
      studentName: params.studentName,
      studentId: params.studentId,
      rollNo: params.rollNo,
      class: params.class,
      section: params.section,
      examType: params.examType,
      month: params.month,
      year: params.year,
      generatedOn: params.generatedOn ?? new Date().toLocaleString(),
    };
  }

  /**
   * Build the base ReportMeta used in the fee receipt header block.
   */
  buildFeeReceiptMeta(): ReportMeta {
    return {
      ...ACADEMY,
      reportType: 'FEE_RECEIPT',
      reportTitle: 'Fee Receipt',
    };
  }
}

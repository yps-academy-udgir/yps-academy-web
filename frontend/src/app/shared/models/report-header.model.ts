/**
 * ReportMeta — common institute header used across all printable reports.
 */
export interface ReportMeta {
  academyName: string;
  academySubtitle: string;
  address: string;
  contact: string;
  email: string;
  reportType: 'CLASS_MARKS' | 'STUDENT_MARKS' | 'FEE_RECEIPT' | 'FACULTY_PAYMENT_RECEIPT' | 'CUSTOM';
  reportTitle: string;
}

/** Parameters to build a class-level marks report header. */
export interface ClassMarksHeaderParams {
  class: string;
  section: string;
  examType: string;
  month: string;
  year: number;
  totalStudents?: number;
  generatedOn?: string;
}

/** Full header object for a class-level marks report. */
export interface ClassMarksReportHeader extends ReportMeta {
  class: string;
  section: string;
  examType: string;
  month: string;
  year: number;
  totalStudents?: number;
  generatedOn: string;
}

/** Parameters to build an individual student marks report header. */
export interface StudentMarksHeaderParams {
  studentName: string;
  studentId?: string;
  rollNo?: string;
  class: string;
  section?: string;
  examType: string;
  month: string;
  year: number;
  generatedOn?: string;
}

/** Full header object for an individual-student marks report. */
export interface StudentMarksReportHeader extends ReportMeta {
  studentName: string;
  studentId?: string;
  rollNo?: string;
  class: string;
  section?: string;
  examType: string;
  month: string;
  year: number;
  generatedOn: string;
}

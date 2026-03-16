import { ExamResult } from './student.model';
import { StudentMarksReportHeader } from './report-header.model';

export interface StudentMarksReportData {
  header: StudentMarksReportHeader;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  contact?: string;
  classLabel: string;
  sectionLabel?: string;
  examResultId: string;
  monthLabel: string;
  result: ExamResult;
  gradeLabel: string;
  statusLabel: 'Pass' | 'Needs Improvement';
}
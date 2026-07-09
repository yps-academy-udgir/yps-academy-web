import { ReportMeta } from "./report-header.model";

export interface IdCardData {
  header: ReportMeta;

  // Student info
  studentName: string;
  studentId: string;
  rollNumber?: string;
  class: string;
  section?: string;
  contact?: string;

  email?: string;
  image?: string;
  gender?: string;
  principalSignature?: string;

  
}
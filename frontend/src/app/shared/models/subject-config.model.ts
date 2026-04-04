export interface SubjectEntry {
  name: string;
  fee: number;
  isActive: boolean;
}

export interface ClassSubjectEntry {
  className: string;
  subjects: SubjectEntry[];
}

export interface SubjectConfig {
  _id?: string;
  classSubjects: ClassSubjectEntry[];
  selfStudyFee: number;
  updatedAt?: string;
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FacultyAssignmentPayload {
  facultyId: string;
  subject: string;
  isPrimary?: boolean;
}

@Injectable({ providedIn: 'root' })
export class FacultyAssignmentService {
    private API_URL = `${environment.apiUrl}/classrooms`;
  

  constructor(private http: HttpClient) {}

  assignFaculty(classroomId: string, assignment: FacultyAssignmentPayload): Observable<any> {
    return this.http.post(`${this.API_URL}/${classroomId}/faculty`, assignment);
  }

  removeFaculty(classroomId: string, facultyId: string, subject?: string): Observable<any> {
    const url = `${this.API_URL}/${classroomId}/faculty/${facultyId}`;
    const params = subject ? new HttpParams().set('subject', subject) : undefined;
    return this.http.delete(url, params ? { params } : {});
  }
}

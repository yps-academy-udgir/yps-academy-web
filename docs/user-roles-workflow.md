# User Roles Workflow

## Purpose
This document explains how role-based access, login behavior, user ID generation, roll number generation, classroom assignment, and report visibility work in the YPS Academy Web application.

It is intended for developers who need to understand the full request-to-UI flow.

## Scope of Implemented Changes
The current implementation includes:

1. Role-based login and dashboard navigation for admin, faculty, and student.
2. Clear login message when selected role does not match the account role.
3. Human-readable user ID format:
   - Student: YY-YPS-STUD-NAME-ROLL
   - Faculty: YY-YPS-FAC-NAME-ROLL
4. Roll number support:
   - Student: class-wise sequential roll number
   - Faculty: globally sequential roll number
5. Automatic classroom enrollment on student creation when class is provided.
6. Roll number visibility in student UI and report pages.

## Roles and Access
Supported roles:

1. Admin
2. Faculty
3. Student

High-level behavior:

1. Admin and faculty access management modules.
2. Student gets a personalized portal (My Profile, My Fees, My Marks, Change Password).
3. Sensitive actions such as reset password are guarded to admin where required.

## Sign-in Flow
## Request
Frontend sends login payload:

1. userId
2. password
3. role (selected from login screen)

## Backend validation flow

1. Find auth account by userId.
2. If no account exists, return Invalid userId or password.
3. Compare selected role with stored account role.
4. If mismatch, return:
   - Selected role does not match this account. Please choose your correct role.
5. If role matches, validate password.
6. On success, return token + user context.

## Frontend post-login navigation

1. Faculty -> faculty routes
2. Student -> my-profile
3. Admin -> dashboard

## First Login / Change Password

1. First login users must set a new password.
2. Change Password screen includes Cancel button for normal flow.
3. Cancel is hidden for first-login mandatory reset flow.

## User ID Format
Current format:

1. Student: YY-YPS-STUD-NAME-ROLL
2. Faculty: YY-YPS-FAC-NAME-ROLL

Example:

1. 26-YPS-STUD-JOHN-001
2. 26-YPS-FAC-RAM-001

Rules:

1. YY is last 2 digits of current year.
2. NAME is normalized uppercase alphabetic first name (max 12 chars).
3. ROLL is externally generated sequential roll number (usually 3 digits).

## Roll Number Generation
## Student roll number

1. Generated with class-wise sequence.
2. Example:
   - Class 10th: 001, 002, 003
   - Class 9th: 001, 002, 003
3. If class is not provided, sequence key uses unassigned.

## Faculty roll number

1. Generated from a single global sequence.
2. Example: 001, 002, 003 across all faculty.

## Concurrency safety

1. Sequences are generated through atomic findOneAndUpdate with $inc.
2. This avoids duplicate roll numbers under concurrent create requests.

## Student Creation Workflow (End-to-End)
When creating a student:

1. Validate uniqueness by email.
2. Compute fee details.
3. Generate class-wise roll number.
4. Generate userId using role + name + roll number.
5. Create student record with rollNumber and userId.
6. If class is provided:
   - Find first available classroom for that class.
   - Attempt enrollment automatically.
7. Create auth user credentials.
8. Return student + login credentials.

## Auto-assignment classroom selection rule

1. Match by class.
2. Only classrooms with available seats are considered.
3. Priority order:
   - Latest academicYear first
   - Then section ascending
   - Then createdAt ascending

## Failure handling and rollback

1. If no classroom seat is available for provided class:
   - Student creation is rolled back.
   - API returns clear message to create/free classroom first.
2. If enrollment fails after student record creation:
   - Student record is rolled back.
3. If auth-user creation fails after enrollment:
   - Student enrollment is removed.
   - Student record is rolled back.

## Where Roll Number Is Displayed
Roll number is now visible in:

1. Student list table
2. Student detail page
3. My Profile page
4. Classroom detail student tab
5. Student enrollment list
6. Attendance marking student rows
7. Student marks report page and report template
8. Fee receipt page and receipt template

## Reports Flow
## Marks report

1. Page loads student + selected result.
2. Shared report data object is built.
3. Roll number is included in report data and rendered in report profile section.
4. Export (PDF/PNG) captures the same rendered content.

## Fee receipt

1. Page loads student details.
2. Receipt data builder includes roll number.
3. Receipt template renders roll number in student information section.
4. Export (PDF/PNG) captures the same rendered content.

## Key File Map
## Backend

1. User ID generator:
   - backend/src/utils/generate-user-id.util.ts
2. Roll number generator:
   - backend/src/utils/generate-roll-number.util.ts
3. Atomic sequence model:
   - backend/src/models/sequence-counter.model.ts
4. Student service create flow + rollback + auto enrollment:
   - backend/src/modules/student/student.service.ts
5. Faculty service roll number and user ID creation:
   - backend/src/modules/faculty/faculty.service.ts
6. Classroom repository enrollment population and classroom selection:
   - backend/src/modules/classroom/classroom.repository.ts
7. Student model roll number and class-roll uniqueness:
   - backend/src/models/student.model.ts
8. Faculty model roll number:
   - backend/src/models/faculty.model.ts
9. Auth role-mismatch login message:
   - backend/src/modules/auth/auth.service.ts

## Frontend

1. Login role-based error handling:
   - frontend/src/app/features/auth/components/login/login.component.ts
2. Change password cancel behavior:
   - frontend/src/app/features/auth/components/change-password/change-password.component.ts
   - frontend/src/app/features/auth/components/change-password/change-password.component.html
3. Student list/detail/profile roll number display:
   - frontend/src/app/features/student/components/student-list/student-list.component.ts
   - frontend/src/app/features/student/components/student-list/student-list.component.html
   - frontend/src/app/features/student/components/student-detail/student-detail.component.html
   - frontend/src/app/features/student/components/my-profile/my-profile.component.html
4. Classroom student views roll number display:
   - frontend/src/app/features/classroom/components/classroom-detail/classroom-detail.component.ts
   - frontend/src/app/features/classroom/components/classroom-detail/classroom-detail.component.html
   - frontend/src/app/features/classroom/components/student-enrollment/student-enrollment.component.html
   - frontend/src/app/features/classroom/components/mark-attendance/mark-attendance.component.ts
   - frontend/src/app/features/classroom/components/mark-attendance/mark-attendance.component.html
   - frontend/src/app/features/classroom/models/classroom.model.ts
5. Marks report roll number support:
   - frontend/src/app/shared/models/student-marks-report.model.ts
   - frontend/src/app/shared/services/student-marks-report.service.ts
   - frontend/src/app/shared/components/student-marks-report/student-marks-report.component.html
   - frontend/src/app/features/student/components/student-marks-report-page/student-marks-report-page.component.html
6. Fee receipt roll number support:
   - frontend/src/app/shared/models/fee-receipt.model.ts
   - frontend/src/app/shared/services/fee-receipt.service.ts
   - frontend/src/app/shared/components/fee-receipt/fee-receipt.component.html
   - frontend/src/app/features/student/components/fee-receipt-page/fee-receipt-page.component.html

## Troubleshooting Checklist
If student is not auto-enrolled:

1. Verify academicDetails.class is sent in create payload.
2. Verify at least one classroom exists with matching class.
3. Verify classroom has available capacity.

If roll number is missing in UI:

1. Verify backend response includes rollNumber.
2. Verify populated enrolledStudents includes rollNumber in classroom repository.
3. Verify frontend model has rollNumber in the relevant interface.

If login fails with role message:

1. Confirm selected role matches account role.
2. Retry with correct role selection from sign-in dropdown.

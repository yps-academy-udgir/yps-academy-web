# Image Upload Integration Guide

> **Status: Fully Implemented** — Last updated 2026-04-05

## 1. Overview

Profile photo upload is supported for both **students** and **faculty**. The image field is entirely **optional** — if not uploaded, the UI falls back to the `account_circle` Material icon.

---

## 2. API Endpoints

| Entity | Create | Update |
|--------|--------|--------|
| Student | `POST /api/students` | `PUT /api/students/:id` |
| Faculty | `POST /api/faculty` | `PUT /api/faculty/:id` |

All four endpoints accept `multipart/form-data`. The image field name is **`image`**.

---

## 3. Backend

| File | What it does |
|------|-------------|
| `backend/src/middleware/upload.middleware.ts` | Multer config — diskStorage → `uploads/`, 2 MB limit, images only |
| `backend/src/modules/student/student.routes.ts` | `upload.single('image')` wired on POST + PUT |
| `backend/src/modules/faculty/faculty.routes.ts` | `upload.single('image')` wired on POST + PUT |
| `backend/src/modules/student/student.service.ts` | `imagePath = imageFile ? /uploads/${filename} : undefined` stored on student doc |
| `backend/src/modules/faculty/faculty.service.ts` | Same pattern for faculty |
| `backend/src/modules/student/dto/student.dto.ts` | `parseJson()` helper so nested objects (academicDetails, feeDetails) survive multipart encoding |
| `backend/src/modules/faculty/dto/faculty.dto.ts` | Same — `parseJson()` for pastExperience, salaryPayments + `z.coerce.number()` for numeric fields |

Static serving: images are available at `http://<host>/uploads/<filename>`.

---

## 4. Frontend

### 4.1 Models
- `Student` interface — added `image?: string`
- `Faculty` interface — added `image?: string`

### 4.2 Services
`StudentService.createStudent(body: FormData)` and `updateStudent(id, body: FormData)` — Angular `HttpClient` auto-sets the correct `Content-Type: multipart/form-data` boundary. **Do not set Content-Type manually.**

Same change applied to `FacultyService.createFaculty` / `updateFaculty`.

### 4.3 Forms (student-form / faculty-form)

**Signals added:**
```typescript
selectedFile    = signal<File | null>(null);
imagePreviewUrl = signal<string | null>(null);  // blob URL for new selection
existingImageUrl = signal<string | null>(null); // full URL for edit mode
```

**File handler:**
```typescript
onFileSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  this.selectedFile.set(file);
  if (file) {
    const reader = new FileReader();
    reader.onload = () => this.imagePreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }
}
```

**FormData builder** (`buildSubmitPayload()`):
```typescript
const fd = new FormData();
fd.append('firstName', ...);
// ...all other scalar fields...
fd.append('academicDetails', JSON.stringify(data.academicDetails)); // nested → JSON string
if (this.selectedFile()) fd.append('image', this.selectedFile()!);  // only if selected
return fd;
```

**UI**: A dashed card below the personal-info fields shows:
- Current/preview photo (circular, `object-fit: cover`) — or `account_circle` icon if none
- Upload button (label wrapping hidden `<input type="file">`)
- Hint: *Optional · JPG, PNG, WEBP · Max 2 MB*

### 4.4 Display (detail / profile pages)

All four pages — `student-detail`, `my-profile`, `faculty-detail`, `my-faculty-profile` — use:

```typescript
getImageUrl(path: string | undefined): string | null {
  if (!path) return null;
  return environment.apiUrl.replace('/api', '') + path;
}
```

Template pattern:
```html
<div class="avatar">
  @if (getImageUrl(student()!.image); as imgUrl) {
    <img [src]="imgUrl" [alt]="student()!.firstName" class="avatar-img" />
  } @else {
    <mat-icon>account_circle</mat-icon>
  }
</div>
```

---

## 5. Faculty — Conditional Past Experience Validation

Past experience entries are **optional when `yearsOfExperience = 0`** and **required when `yearsOfExperience > 0`**.

- A reactive `valueChanges` subscription on `yearsOfExperience` calls `reapplyPastExpValidators(hasExp)`, which sets/clears `Validators.required` on all existing rows.
- Newly added rows via `addPastExperience()` also respect the current state.
- `onSubmit()` guards: if `yearsOfExp > 0` and array is empty, shows a warning toast.
- Template shows a red **Required** badge or greyed **(optional)** label dynamically.

---

## 6. Build Status

| | Result |
|---|---|
| Frontend (`ng build --configuration development`) | ✅ No errors (pre-existing PromoteYear NG8011 warning only) |
| Backend (`tsc --noEmit`) | ✅ No errors |

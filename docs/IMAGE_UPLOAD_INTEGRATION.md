# Image Upload Integration Guide

## 1. API Endpoints for Image Upload
- **Student Create:** `POST /api/students`
- **Student Update:** `PUT /api/students/:id`
- **Faculty Create:** `POST /api/faculty`
- **Faculty Update:** `PUT /api/faculty/:id`
- All endpoints expect `multipart/form-data` with the image field named `image`.

## 2. How to Send Data
- Use a file input in the form for image selection.
- On submit, create a `FormData` object.
- Append all form fields and the image file (key: `image`) to FormData.
- Example:
  ```typescript
  const formData = new FormData();
  formData.append('firstName', form.firstName);
  // ...other fields
  if (file) formData.append('image', file);
  ```
- Send FormData using Angular’s HttpClient (do not set Content-Type manually).

## 3. How Images Are Handled
- The backend saves the image file in the `/uploads` folder on the server.
- The database stores only the image path (e.g., `/uploads/filename.jpg`).
- The backend serves images statically at `/uploads`, so you can display them using the returned path.

## 4. How to Display Images
- Use the `image` field from the API response as the `src` for `<img>`.
- Example: `<img [src]="student.image">` (if using Angular).

## 5. No Need to Change Backend
- All backend logic for image upload and serving is already implemented.

---

**Share this file with your frontend team for smooth image upload integration!**

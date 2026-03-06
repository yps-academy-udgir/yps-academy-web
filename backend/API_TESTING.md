# API Testing Guide

Quick reference for testing YPS Academy Backend API endpoints.

## 🚀 Starting the Backend

```bash
cd backend
npm install
npm run dev
```

Server will start on: `http://localhost:4000`

## 📋 Test Endpoints with cURL

### 1. Health Check
```bash
curl http://localhost:4000/api/health
```

### 2. Create a Student (POST)
```bash
curl -X POST http://localhost:4000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "contact": "+1234567890",
    "gender": "male"
  }'
```

### 3. Get All Students (GET)
```bash
# Basic request
curl http://localhost:4000/api/students

# With pagination
curl "http://localhost:4000/api/students?page=1&limit=10"

# With filtering by gender
curl "http://localhost:4000/api/students?gender=female"

# With search
curl "http://localhost:4000/api/students?search=john"
```

### 4. Get Single Student (GET)
```bash
# Replace {id} with actual MongoDB ObjectId
curl http://localhost:4000/api/students/{id}
```

### 5. Update Student (PUT)
```bash
curl -X PUT http://localhost:4000/api/students/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "gender": "female"
  }'
```

### 6. Delete Student (DELETE)
```bash
curl -X DELETE http://localhost:4000/api/students/{id}
```

### 7. Get Statistics (GET)
```bash
curl http://localhost:4000/api/students/stats/overview
```

## 🧪 Test Data

### Sample Students for Testing
```json
[
  {
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@example.com",
    "contact": "+1234567891",
    "gender": "female"
  },
  {
    "firstName": "Bob",
    "lastName": "Smith",
    "email": "bob.smith@example.com",
    "contact": "+1234567892",
    "gender": "male"
  },
  {
    "firstName": "Charlie",
    "lastName": "Brown",
    "email": "charlie.brown@example.com",
    "contact": "+1234567893",
    "gender": "other"
  }
]
```

## ✅ Expected Responses

### Success Response
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "contact": "+1234567890",
    "gender": "male",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Student with this email already exists"
}
```

## 🔍 Testing with Postman

### Import Collection
Create a new Postman collection with these requests:

1. **Health Check**
   - Method: GET
   - URL: `http://localhost:4000/api/health`

2. **Create Student**
   - Method: POST
   - URL: `http://localhost:4000/api/students`
   - Headers: `Content-Type: application/json`
   - Body: (raw JSON)

3. **Get All Students**
   - Method: GET
   - URL: `http://localhost:4000/api/students`
   - Params: page, limit, gender, search

4. **Get One Student**
   - Method: GET
   - URL: `http://localhost:4000/api/students/:id`

5. **Update Student**
   - Method: PUT
   - URL: `http://localhost:4000/api/students/:id`
   - Headers: `Content-Type: application/json`
   - Body: (raw JSON)

6. **Delete Student**
   - Method: DELETE
   - URL: `http://localhost:4000/api/students/:id`

7. **Get Statistics**
   - Method: GET
   - URL: `http://localhost:4000/api/students/stats/overview`

## 🐛 Common Issues

### Issue: Cannot connect to MongoDB
**Solution:** Make sure MongoDB is running
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB (Windows)
net start MongoDB

# Or run MongoDB manually
mongod
```

### Issue: Port 4000 already in use
**Solution:** Change PORT in `.env` file or kill process using port 4000
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Issue: Validation errors
**Solution:** Check all required fields match the schema:
- firstName: min 2, max 50 characters
- lastName: min 2, max 50 characters
- email: valid email format
- contact: 10-15 digits (can include +, space, -)
- gender: must be 'male', 'female', or 'other'

## 🔗 Integration with Frontend

Once backend is running, start the Angular frontend:

```bash
cd frontend
npm install
ng serve
```

Frontend will connect to `http://localhost:4000/api` automatically.

## 📊 Test Scenario

### Complete Flow Test
1. Start backend server
2. Create 3 students with different genders
3. Get all students (verify pagination)
4. Filter by gender = 'female'
5. Search for 'john'
6. Get statistics (verify counts)
7. Update one student
8. Delete one student
9. Verify total count decreased

This workflow tests all CRUD operations and special endpoints.

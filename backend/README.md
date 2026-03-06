# YPS Academy Backend API

Industry-standard RESTful API for YPS Academy student management system.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.config.ts
│   ├── controllers/     # Request handlers
│   │   └── student.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/          # Mongoose schemas
│   │   └── student.model.ts
│   ├── routes/          # Route definitions
│   │   ├── index.ts
│   │   └── student.routes.ts
│   ├── utils/           # Utility functions
│   │   └── response.util.ts
│   ├── modules/         # Future feature modules
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── .env                 # Environment variables (not in git)
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Base URL
`http://localhost:4000/api`

### Health Check
```
GET /health
```
Returns API status and timestamp.

### Students

#### Get All Students
```
GET /students
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - gender: 'male' | 'female' | 'other'
  - search: string (searches firstName, lastName, email, contact)

Response:
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Get Student by ID
```
GET /students/:id

Response:
{
  "success": true,
  "message": "Student retrieved successfully",
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "contact": "+1234567890",
    "gender": "male",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Student
```
POST /students
Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "contact": "+1234567890",
  "gender": "male"
}

Response:
{
  "success": true,
  "message": "Student created successfully",
  "data": {...}
}
```

#### Update Student
```
PUT /students/:id
Content-Type: application/json

Body: (all fields optional)
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "contact": "+1234567890",
  "gender": "male"
}

Response:
{
  "success": true,
  "message": "Student updated successfully",
  "data": {...}
}
```

#### Delete Student
```
DELETE /students/:id

Response:
{
  "success": true,
  "message": "Student deleted successfully",
  "data": null
}
```

#### Get Statistics
```
GET /students/stats/overview

Response:
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 150,
    "byGender": {
      "male": 80,
      "female": 65,
      "other": 5
    }
  }
}
```

## 🔧 Data Model

### Student Schema
```typescript
{
  firstName: string (required, 2-50 chars)
  lastName: string (required, 2-50 chars)
  email: string (required, unique, valid email)
  contact: string (required, 10-15 digits)
  gender: 'male' | 'female' | 'other' (required)
  createdAt: Date (auto-generated)
  updatedAt: Date (auto-generated)
}
```

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 4000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/yps-academy |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:4200 |

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Code Structure Guidelines
- **Controllers**: Handle request/response logic
- **Models**: Define database schemas
- **Routes**: Define API endpoints
- **Middleware**: Process requests before controllers
- **Utils**: Reusable helper functions
- **Config**: Application configuration

## 🔐 Security Features
- Input validation on all endpoints
- Email uniqueness enforcement
- MongoDB ObjectId validation
- CORS configuration
- Request body size limits
- Error message sanitization

## 🚧 Future Enhancements
- [ ] Authentication & Authorization
- [ ] JWT token management
- [ ] File upload for student photos
- [ ] Advanced filtering and sorting
- [ ] Export to CSV/PDF
- [ ] Email notifications
- [ ] Rate limiting
- [ ] API documentation (Swagger)

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details (if available)"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

## 🐛 Error Codes
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## 📞 Support
For issues or questions, please contact the development team.

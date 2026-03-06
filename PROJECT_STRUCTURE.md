# YPS Academy - Complete Project Structure

## 📁 Backend Architecture (Industry Standard)

```
backend/
├── src/
│   ├── config/                    # Configuration files
│   │   └── database.config.ts     # MongoDB connection setup
│   │
│   ├── controllers/               # Business logic handlers
│   │   └── student.controller.ts  # Student CRUD operations
│   │
│   ├── middleware/                # Express middleware
│   │   ├── error.middleware.ts    # Global error handling
│   │   └── validation.middleware.ts # Input validation
│   │
│   ├── models/                    # Database schemas
│   │   └── student.model.ts       # Student Mongoose schema
│   │
│   ├── routes/                    # API route definitions
│   │   ├── index.ts               # Main router
│   │   └── student.routes.ts      # Student endpoints
│   │
│   ├── utils/                     # Helper functions
│   │   └── response.util.ts       # Standard response format
│   │
│   ├── modules/                   # Future feature modules
│   │   └── README.md              # Module structure guide
│   │
│   ├── app.ts                     # Express app configuration
│   └── server.ts                  # Server entry point
│
├── dist/                          # Compiled JavaScript (auto-generated)
├── .env                           # Environment variables (not in git)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # Main documentation
└── API_TESTING.md                 # API testing guide
```

## 📁 Frontend Architecture (Industry Standard)

```
frontend/src/app/
├── core/                          # Core application features
│   ├── interceptors/
│   │   └── http.interceptor.ts    # HTTP request/response handling
│   ├── layout/
│   │   ├── header/                # App header component
│   │   ├── sidebar/               # Navigation sidebar
│   │   └── main-layout/           # Main layout wrapper
│   └── services/
│       ├── notification.service.ts # Toast notifications
│       └── theme.service.ts        # Light/dark theme management
│
├── features/                      # Feature modules
│   └── student/
│       └── components/
│           ├── dashboard/         # Statistics dashboard
│           ├── student-list/      # Student table view
│           ├── student-form/      # Add/Edit form
│           └── student-detail/    # Student details view
│
├── shared/                        # Shared resources
│   ├── components/
│   │   ├── confirm-dialog/        # Confirmation dialog
│   │   ├── empty-state/           # Empty state component
│   │   ├── error-message/         # Error display
│   │   └── loading/               # Loading spinner
│   ├── models/
│   │   └── student.model.ts       # Student TypeScript interface
│   ├── modules/
│   │   └── material.module.ts     # Angular Material imports
│   └── services/
│       └── student.service.ts     # Student HTTP service
│
├── environments/                  # Environment configs
│   ├── environment.ts             # Development config
│   └── environment.prod.ts        # Production config
│
└── styles/                        # Global styles
    ├── _variables.scss            # Design tokens
    ├── _theme.scss                # Material theme config
    └── styles.scss                # Global utilities
```

## 🔄 Data Flow

### Frontend → Backend (Create Student)
```
1. User fills form in StudentFormComponent
2. StudentFormComponent calls StudentService.createStudent()
3. StudentService makes HTTP POST to /api/students
4. HTTP Interceptor adds headers
5. Backend validation.middleware validates input
6. student.controller.createStudent() processes request
7. student.model creates MongoDB document
8. Response utility formats success response
9. Frontend receives data and shows notification
10. Router navigates to student list
```

### Backend → Frontend (Get Students)
```
1. Frontend loads StudentListComponent
2. StudentListComponent calls StudentService.getAllStudents()
3. HTTP GET request to /api/students?page=1&limit=10
4. student.controller.getAllStudents() queries MongoDB
5. Student.find() with pagination
6. paginatedResponse() formats data
7. Frontend updates students signal
8. Template renders table with @for loop
```

## 🎯 Key Features Implemented

### Backend Features
- ✅ RESTful API design (GET, POST, PUT, DELETE)
- ✅ MongoDB integration with Mongoose
- ✅ Input validation middleware
- ✅ Error handling middleware
- ✅ Standardized response format
- ✅ Pagination support
- ✅ Advanced filtering (gender, search)
- ✅ Email uniqueness validation
- ✅ Statistics endpoint for dashboard
- ✅ CORS configuration
- ✅ Environment-based configuration
- ✅ TypeScript strict mode
- ✅ Industry-standard folder structure

### Frontend Features
- ✅ Angular 20 standalone components
- ✅ Signals for reactive state
- ✅ Material Design UI
- ✅ Light/dark theme toggle
- ✅ Responsive layouts
- ✅ Form validation
- ✅ Pagination
- ✅ Search functionality
- ✅ Confirmation dialogs
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Dashboard with statistics

## 🗄️ Database Schema

### Student Collection
```javascript
{
  _id: ObjectId("..."),
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  contact: "+1234567890",
  gender: "male",             // enum: ['male', 'female', 'other']
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Indexes
- `email`: Unique index for fast lookup
- `firstName, lastName`: Compound index for name searches
- `gender`: Index for filtering
- `createdAt`: Index for sorting

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/students` | Get all students (paginated) |
| GET | `/api/students/:id` | Get single student |
| POST | `/api/students` | Create new student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/students/stats/overview` | Get statistics |

## 🚀 Running the Project

### Backend
```bash
cd backend
npm install
npm run dev      # Development server
npm run build    # Build for production
npm start        # Run production build
```

### Frontend
```bash
cd frontend
npm install
ng serve         # Development server
ng build         # Build for production
```

### Full Stack
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && ng serve
```

Access application at: `http://localhost:4200`  
API available at: `http://localhost:4000/api`

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yps-academy
FRONTEND_URL=http://localhost:4200
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api',
  apiTimeout: 30000,
  enableLogging: true,
};
```

## 📊 Future Enhancements

### Phase 2 - Authentication
- User registration and login
- JWT token authentication
- Role-based access control (Admin, Teacher, Student)
- Password reset functionality

### Phase 3 - Advanced Features
- Course management
- Teacher management
- Attendance tracking
- Grade management
- File uploads (student photos, documents)
- Export to CSV/PDF
- Email notifications

### Phase 4 - Analytics
- Student performance analytics
- Attendance reports
- Custom dashboards
- Data visualization with charts

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 6+
- **ODM**: Mongoose
- **Language**: TypeScript 5+
- **Validation**: Custom middleware
- **CORS**: cors package

### Frontend
- **Framework**: Angular 20
- **UI Library**: Angular Material
- **State Management**: Signals
- **HTTP Client**: HttpClient
- **Forms**: Reactive Forms
- **Routing**: Angular Router
- **Styling**: SCSS with CSS Variables
- **Language**: TypeScript 5+

## 📝 Code Quality Standards

### Backend
- Controllers handle request/response only
- Business logic stays in controllers/services
- Models define schemas and validations
- Middleware handles cross-cutting concerns
- Utils provide reusable functions
- Error handling is centralized

### Frontend
- Components are presentation-focused
- Services handle HTTP and state
- Signals for reactive updates
- Standalone components (no NgModules)
- Consistent file naming
- SCSS follows theme system

## 🎨 Design Patterns Used

### Backend Patterns
- **MVC Architecture**: Model-View-Controller separation
- **Repository Pattern**: Data access abstraction (Mongoose)
- **Middleware Pattern**: Request processing pipeline
- **Factory Pattern**: Response utility functions
- **Singleton Pattern**: Database connection

### Frontend Patterns
- **Component Pattern**: Reusable UI components
- **Service Pattern**: Business logic separation
- **Observer Pattern**: Signals for reactivity
- **Strategy Pattern**: Theme switching
- **Facade Pattern**: HTTP service wrapper

## 📚 Documentation Files

- `backend/README.md` - Backend overview and API docs
- `backend/API_TESTING.md` - API testing guide
- `backend/src/modules/README.md` - Module structure guide
- `frontend/README.md` - Frontend documentation
- `PROJECT_STRUCTURE.md` - This file (complete architecture)

## ✅ Checklist for New Features

When adding a new feature:

1. **Backend**
   - [ ] Create model in `models/`
   - [ ] Create controller in `controllers/`
   - [ ] Create routes in `routes/`
   - [ ] Add validation middleware
   - [ ] Register routes in `routes/index.ts`
   - [ ] Add tests
   - [ ] Update API documentation

2. **Frontend**
   - [ ] Create component in `features/`
   - [ ] Create service in `shared/services/`
   - [ ] Update model in `shared/models/`
   - [ ] Add routes in `app.routes.ts`
   - [ ] Update sidebar menu
   - [ ] Add theme support
   - [ ] Test responsiveness

---

**Version**: 1.0.0  
**Last Updated**: March 6, 2026  
**Maintained By**: Development Team

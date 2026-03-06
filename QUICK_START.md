# Quick Start Guide

Get YPS Academy running in 5 minutes!

## 🎯 Prerequisites

Before starting, ensure you have:

- ✅ Node.js v18 or higher ([Download](https://nodejs.org/))
- ✅ MongoDB v6 or higher ([Download](https://www.mongodb.com/try/download/community))
- ✅ Git ([Download](https://git-scm.com/))
- ✅ VS Code (recommended) ([Download](https://code.visualstudio.com/))

## 📥 Installation

### Step 1: Verify Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check MongoDB version
mongod --version
# Should output: db version v6.x.x or higher
```

### Step 2: Start MongoDB

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or run manually
mongod
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or run manually
mongod --dbpath /path/to/data
```

Verify MongoDB is running:
```bash
# Should connect successfully
mongosh
```

### Step 3: Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
# (or 'cp .env.example .env' on macOS/Linux)

# Edit .env if needed (default values work for local development)
```

### Step 4: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✓ MongoDB connected successfully
✓ Database: yps-academy
=================================
🚀 Server running on http://localhost:4000
📝 Environment: development
📚 API Documentation: http://localhost:4000/api
=================================
```

### Terminal 2: Start Frontend

```bash
cd frontend
ng serve
```

You should see:
```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200 **
```

### Step 5: Open Application

Open your browser and navigate to:
```
http://localhost:4200
```

You should see the YPS Academy dashboard!

## ✅ Verify Installation

### Test Backend API

Open `http://localhost:4000/api/health` in your browser. You should see:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Test Frontend

1. Click "Add Student" in the sidebar
2. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Contact: +1234567890
   - Gender: Male
3. Click "Add Student"
4. You should see a success message and be redirected to the student list

## 🎨 Features to Try

### Dashboard
- View total students count
- See gender distribution
- Quick navigation to add students

### Student List
- Search students by name, email, or contact
- Sort table columns
- Pagination controls
- Edit or delete students

### Theme Toggle
- Click the theme button in the header
- Switch between light and dark mode
- Theme preference is saved

## 🔧 Common Issues & Solutions

### Issue 1: Port 4000 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

### Issue 2: MongoDB connection failed
**Solution:**
- Ensure MongoDB is running: `mongod`
- Check connection string in `backend/.env`
- Default: `mongodb://localhost:27017/yps-academy`

### Issue 3: Frontend build errors
**Solution:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: MongoDB not installed
**Solution:**
```bash
# Windows: Download installer from mongodb.com
# Or use Chocolatey:
choco install mongodb

# macOS: Use Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Ubuntu/Debian:
sudo apt-get install mongodb
```

## 📊 Sample Data

To test with sample data, use the backend API:

```bash
# Terminal 3: Create sample students
curl -X POST http://localhost:4000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@example.com",
    "contact": "+1234567891",
    "gender": "female"
  }'

curl -X POST http://localhost:4000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bob",
    "lastName": "Smith",
    "email": "bob@example.com",
    "contact": "+1234567892",
    "gender": "male"
  }'
```

## 🎓 Next Steps

Now that you have the application running:

1. **Explore the codebase:**
   - Backend: `backend/src/`
   - Frontend: `frontend/src/app/`

2. **Read the documentation:**
   - [Project Structure](PROJECT_STRUCTURE.md)
   - [Backend API](backend/README.md)
   - [API Testing](backend/API_TESTING.md)

3. **Customize the application:**
   - Add new fields to Student model
   - Create additional modules (courses, teachers)
   - Implement authentication

4. **Deploy to production:**
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database
   - [Heroku](https://www.heroku.com/) or [Railway](https://railway.app/) for backend
   - [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/) for frontend

## 📞 Need Help?

- Check [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for architecture details
- Review [backend/API_TESTING.md](backend/API_TESTING.md) for API examples
- Look at code comments for inline documentation

## 🎉 Congratulations!

You're all set! The YPS Academy application is now running locally.

Happy coding! 🚀

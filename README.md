# Full-Stack Application (Angular 20 + Node.js + MongoDB)

A modern full-stack web application with Angular 20 frontend framework and Node.js/Express backend API, using MongoDB for data persistence.

## Project Structure

```
project-root/
├── frontend/          # Angular 20 SPA
│   └── src/
│       ├── app/
│       ├── index.html
│       └── main.ts
└── backend/          # Node.js/Express API
    ├── src/
    │   └── server.ts
    ├── .env
    └── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- MongoDB 5.0+ (local or Atlas)

### Installation

Clone and install dependencies:

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### Configuration

Backend environment variables:

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/mydb
PORT=4000
NODE_ENV=development
```

## Development

### Start Backend
```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`

### Start Frontend
```bash
cd frontend
npm start
```

Frontend runs on `http://localhost:4200`

## Scripts

### Backend
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server
- `npm run build` - TypeScript compilation

### Frontend
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run unit tests
- `npm run lint` - ESLint check

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/items` | List all items |
| POST | `/api/items` | Create new item |
| DELETE | `/api/items/:id` | Delete item by ID |

## Tech Stack

### Frontend
- **Angular 20** - Framework
- **TypeScript** - Language
- **SCSS** - Styling
- **RxJS** - Reactive programming

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **TypeScript** - Language

### Database
- **MongoDB** - NoSQL database

## Project Features

- RESTful API architecture
- Component-based Angular frontend
- Mongoose Schema validation
- CORS enabled
- Environment-based configuration
- Hot-reload development
- TypeScript throughout

## Debugging

### VS Code Launch Configuration

Use included `.vscode/launch.json` for debugging both frontend and backend.

**Backend Debug:**
- Set breakpoints in `src/server.ts`
- Run debug session (F5)

**Frontend Debug:**
- Use Chrome DevTools (F12 in browser)
- Set breakpoints in VS Code Sources panel

## File Structure Details

### Backend
- `src/server.ts` - Express server entry point
- `.env.example` - Environment template
- `tsconfig.json` - TypeScript configuration

### Frontend
- `src/app/` - Angular components and services
- `src/main.ts` - Bootstrap entry point
- `angular.json` - Angular CLI configuration

## Next Steps

1. Create service for API communication
2. Add authentication/authorization
3. Implement error handling
4. Add form validation
5. Deploy to production

## Contributing

Follow these practices:
- Use TypeScript strict mode
- Write unit tests
- Follow Angular style guide
- Commit meaningful messages

## FAQ / Q&A

### General Questions

**Q: Do I need MongoDB installed locally?**
A: Yes, by default the backend connects to `mongodb://localhost:27017`. You can either:
- Install MongoDB locally
- Use MongoDB Atlas (cloud) - update `MONGODB_URI` in `.env`
- Use Docker: `docker run -d -p 27017:27017 mongo`

**Q: Why TypeScript?**
A: Provides type safety, better IDE support, and catches errors at compile time across both frontend and backend.

**Q: Can I use a different database?**
A: Yes, but you'll need to replace Mongoose with another ODM/driver. PostgreSQL + TypeORM or Firebase are good alternatives.

### Development Questions

**Q: How do I debug the backend?**
A: Use VS Code debugger:
1. Set breakpoint in `src/server.ts`
2. Press F5 to start debugging
3. Use `.vscode/launch.json` configuration

**Q: How do I debug the frontend?**
A: Open Chrome DevTools (F12) and use the Sources panel, or VS Code with Angular extension for better integration.

**Q: How do I reload the servers?**
A: 
- **Backend**: Auto-reloads with nodemon on file changes
- **Frontend**: Auto-reloads with ng serve on file changes

**Q: Can I run both servers in one terminal?**
A: Yes, use `npm-run-all` package:
```bash
npm install -D npm-run-all
```
Add to root package.json:
```json
"scripts": {
  "dev": "npm-run-all --parallel dev:frontend dev:backend"
}
```

### Deployment Questions

**Q: Where should I deploy?**
A: Popular options:
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, Railway
- **Database**: MongoDB Atlas (cloud), AWS DocumentDB

**Q: How do I build for production?**
A:
```bash
# Frontend
cd frontend && npm run build
# Output: dist/ folder

# Backend
cd backend && npm run build
# Then: npm start
```

**Q: Do I need environment-specific configs?**
A: Yes, create:
- `.env.development`
- `.env.production`
Update your deploy scripts to load the correct one.

### Architecture Questions

**Q: Why separate frontend and backend?**
A: Allows independent scaling, different tech stacks, and easier maintenance. Common SPA + API pattern.

**Q: Should I use the same database for multiple features?**
A: Yes, design schemas for each feature (User, Item, etc.) in the same MongoDB database.

**Q: How do I structure large projects?**
A: Use feature-based folder structure:
```
backend/src/
├── features/
│   ├── users/
│   │   ├── user.model.ts
│   │   ├── user.routes.ts
│   │   └── user.controller.ts
│   ├── auth/
│   ├── items/
│   └── common/
└── server.ts

frontend/src/app/
├── features/
│   ├── auth/
│   ├── items/
│   ├── dashboard/
│   └── shared/
└── app.routes.ts
```

### Troubleshooting

**Q: Port already in use?**
A: 
```bash
# Linux/Mac: Kill process using port 4000
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows: 
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Q: MongoDB connection fails?**
A: 
- Check MongoDB is running
- Verify connection string in `.env`
- Check firewall rules
- For Atlas: whitelist your IP

**Q: CORS errors in frontend?**
A: Backend CORS is already configured for `*`. If issues persist, specify origin in backend:
```typescript
app.use(cors({
  origin: 'http://localhost:4200'
}));
```

**Q: TypeScript compilation errors?**
A: Run `npm run build` to see full compilation errors with line numbers.

## License

MIT

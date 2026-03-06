# Modules Directory

This directory is reserved for future feature modules. Each module will contain its own:

- Controller
- Service/Business Logic
- Routes
- Model/Schema
- Validation
- Types/Interfaces

## Example Module Structure

```
modules/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.routes.ts
│   ├── auth.model.ts
│   └── auth.validation.ts
├── course/
│   ├── course.controller.ts
│   ├── course.service.ts
│   ├── course.routes.ts
│   ├── course.model.ts
│   └── course.validation.ts
└── teacher/
    ├── teacher.controller.ts
    ├── teacher.service.ts
    ├── teacher.routes.ts
    ├── teacher.model.ts
    └── teacher.validation.ts
```

## Naming Conventions

- Use singular names for modules (e.g., `auth`, not `auths`)
- Follow consistent file naming: `{module}.{type}.ts`
- Export a main router from each module
- Keep business logic in service files
- Controllers should be thin, delegating to services

## Integration

To add a new module:

1. Create module folder in `modules/`
2. Implement required files
3. Export router from `routes/index.ts`
4. Add types to shared interfaces if needed

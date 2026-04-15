/**
 * Swagger/OpenAPI Configuration
 * Generates API documentation for development environment only
 * Access at: http://localhost:4026/api/docs
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YPS Academy API',
      version: '1.0.0',
      description: 'YPS Academy Backend API Documentation',
      contact: {
        name: 'YPS Academy Team',
        email: 'support@ypsacademy.com',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: 'http://localhost:4026/api',
        description: 'Local Development Server',
      },
      {
        url: 'https://yps-backend-dev.onrender.com/api',
        description: 'Development Server (Render)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized. JWT token is missing or invalid.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Unauthorized' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Bad request. Validation failed.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation failed' },
                  errors: { type: 'object' },
                },
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Internal server error' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.swagger.ts', './src/modules/**/*.routes.ts', './src/routes/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * Development Environment Configuration (deployed on Render)
 */
export const environment = {
  production: false,
  // apiUrl: 'https://yps-backend-dev.onrender.com/api',
  apiUrl: 'http://localhost:4026/api',
  apiTimeout: 30000,
  enableLogging: false,
  features: {
    enableAnalytics: false,
    enableNotifications: true,
  },
};

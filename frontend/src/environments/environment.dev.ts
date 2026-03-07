/**
 * Development Environment Configuration (deployed on Render)
 */
export const environment = {
  production: false,
  apiUrl: 'https://yps-backend-dev.onrender.com/api',
  apiTimeout: 30000,
  enableLogging: true,
  features: {
    enableAnalytics: false,
    enableNotifications: true,
  },
};

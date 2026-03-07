/**
 * Production Environment Configuration
 * Contains all environment-specific settings for production
 */
export const environment = {
  production: true,
  apiUrl: 'https://yps-backend-prod.onrender.com/api',
  apiTimeout: 30000,
  enableLogging: false,
  features: {
    enableAnalytics: true,
    enableNotifications: true,
  },
};

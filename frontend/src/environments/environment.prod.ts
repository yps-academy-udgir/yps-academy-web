/**
 * Production Environment Configuration
 * Contains all environment-specific settings for production
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.yps-academy.com/api',
  apiTimeout: 30000,
  enableLogging: false,
  features: {
    enableAnalytics: true,
    enableNotifications: true,
  },
};

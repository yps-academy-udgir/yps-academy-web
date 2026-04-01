/**
 * Development Environment Configuration
 * Contains all environment-specific settings for development
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4026/api',
  apiTimeout: 30000,
  enableLogging: false,
  features: {
    enableAnalytics: false,
    enableNotifications: true,
  },
};

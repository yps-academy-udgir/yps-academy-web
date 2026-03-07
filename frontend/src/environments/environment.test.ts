/**
 * Test / Staging Environment Configuration
 * Contains all environment-specific settings for the test/staging environment
 */
export const environment = {
  production: false,
  apiUrl: 'https://api-test.yps-academy.com/api',
  apiTimeout: 30000,
  enableLogging: true,
  features: {
    enableAnalytics: false,
    enableNotifications: true,
  },
};

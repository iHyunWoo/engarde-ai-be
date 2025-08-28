import baseConfig from './jest.config';

export default {
  ...baseConfig,
  testMatch: ['**/test/e2e/**/*.spec.ts'],
};
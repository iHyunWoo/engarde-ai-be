import baseConfig from './jest.config';

export default {
  ...baseConfig,
  testMatch: ['**/test/unit/**/*.spec.ts'],
};
import type { Config } from 'jest';

const config: Config = {
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/e2e/_helpers/setup.helper.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  collectCoverage: true, // 커버리지 수집 활성화
  collectCoverageFrom: [
    'src/**/*.ts',             // 커버리지 대상 파일들
    '!api-sdk/',
    '!src/main.ts',            // 제외할 파일
    '!src/**/dto/**',          // DTO 제외 등
    '!src/test/',           // 테스트 파일 제외
    '!src/types/'
  ],
  coverageDirectory: 'coverage', // 커버리지 결과 저장 폴더
};

export default config;
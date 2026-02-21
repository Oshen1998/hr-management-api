module.exports = {
  preset: 'ts-jest',
  // Test environment
  testEnvironment: 'node',
  // Root directory
  roots: ['<rootDir>/src'],
  // Test match patterns
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  // Coverage thresholds
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70,
  //   },
  // },
  coverageDirectory: 'coverage',
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],
  // Module paths
  moduleFileExtensions: ['ts', 'js', 'json'],
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Clear mocks between tests
  clearMocks: true,
  // Verbose output
  verbose: true,
};

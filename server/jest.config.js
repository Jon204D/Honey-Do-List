module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/tests/globalSetup.js',
  setupFiles: ['<rootDir>/tests/setupMocks.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/testSetup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/setup.test.js',
    '/tests/testSetup.js',
    '/tests/setupMocks.js',
    '/tests/globalSetup.js',
    '/tests/testHelpers.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/setup.test.js',
    '!**/tests/testSetup.js',
    '!**/tests/setupMocks.js',
    '!**/tests/globalSetup.js',
    '!**/tests/testHelpers.js',
    '!jest.config.js',
    '!seedUsers.js',
    '!server.js'
  ],
  testTimeout: 30000,
  verbose: true
};

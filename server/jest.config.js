module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/testSetup.js'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/setup.test.js',
    '/tests/testSetup.js'
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
    '!jest.config.js',
    '!seedUsers.js',
    '!server.js'
  ],
  testTimeout: 30000,
  verbose: true
};

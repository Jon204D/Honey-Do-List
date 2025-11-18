// tests/setup.test.js - Test setup and configuration

require('dotenv').config();

// Global test configuration
beforeAll(() => {
  // Suppress console.log during testing unless explicitly needed
  if (process.env.NODE_ENV === 'test') {
    console.log = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Clean up any global resources if needed
});

// Global error handler for unhandled promise rejections during tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Set test environment variables if not already set
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = 'mongodb://localhost:27017/honey-do-list-test';
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Mock SendGrid API key for tests
if (!process.env.SendGridApiKey) {
  process.env.SendGridApiKey = 'test-sendgrid-api-key';
}

// Mock frontend URL for tests
if (!process.env.FRONTEND_BASE_URL) {
  process.env.FRONTEND_BASE_URL = 'http://localhost:3000';
}
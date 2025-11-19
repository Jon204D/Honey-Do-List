// tests/mockSendGrid.js - Mocks SendGrid early to prevent real API calls in tests
// This file is loaded via setupFiles before any test files are imported

// Mock the @sendgrid/mail module
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }])
}));

console.log('✓ SendGrid mocked globally');

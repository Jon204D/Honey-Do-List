// server/tests/setupMocks.js
// Early mocks that run before any module imports to prevent network calls in tests

// Mock SendGrid to prevent any network calls during tests
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([
    {
      headers: {
        'x-message-id': 'mock-message-id'
      }
    }
  ])
}));

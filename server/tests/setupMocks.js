// server/tests/setupMocks.js
// Early mocks that run before any module imports to prevent network calls in tests

// Mock SendGrid to prevent any network calls during tests
// This uses the manual mock from __mocks__/@sendgrid/mail.js
jest.mock('@sendgrid/mail');

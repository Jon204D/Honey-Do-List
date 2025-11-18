// tests/emailTemplate.test.js - Unit tests for email template functionality

require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const { sendVerification, sendRecoveryVerification } = require('../config/emailTemplate');

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn()
}));

describe('Email Template Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerification', () => {
    it('should send verification email successfully', async () => {
      // Mock successful email send
      sgMail.send.mockResolvedValue([
        {
          headers: {
            'x-message-id': 'mock-message-id-123'
          }
        }
      ]);

      const result = await sendVerification('test@example.com', 'testuser');

      expect(result).toEqual({
        status: 'success',
        messageId: 'mock-message-id-123',
        timestamp: expect.any(String)
      });

      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          from: expect.objectContaining({
            name: 'Honey Do List',
            email: 'jdameus2025@fau.edu'
          }),
          subject: 'Honey Do List Account Activation',
          html: expect.stringContaining('testuser')
        })
      );
    });

    it('should handle email send failure', async () => {
      const mockError = new Error('SendGrid API error');
      mockError.code = 'NETWORK_ERROR';
      sgMail.send.mockRejectedValue(mockError);

      const result = await sendVerification('test@example.com', 'testuser');

      expect(result).toEqual({
        status: 'failed',
        error: 'SendGrid API error',
        code: 'NETWORK_ERROR',
        timestamp: expect.any(String)
      });
    });

    it('should include correct verification link', async () => {
      sgMail.send.mockResolvedValue([{ headers: {} }]);

      await sendVerification('test@example.com', 'TestUser');

      const sentEmail = sgMail.send.mock.calls[0][0];
      expect(sentEmail.html).toContain('/AccountVerification/testuser');
    });
  });

  describe('sendRecoveryVerification', () => {
    it('should send recovery email successfully', async () => {
      sgMail.send.mockResolvedValue([
        {
          headers: {
            'x-message-id': 'recovery-message-id-456'
          }
        }
      ]);

      const result = await sendRecoveryVerification('test@example.com', 'testuser');

      expect(result).toEqual({
        status: 'success',
        messageId: 'recovery-message-id-456',
        timestamp: expect.any(String)
      });

      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Honey Do List Account Recovery',
          html: expect.stringContaining('testuser')
        })
      );
    });

    it('should include correct recovery link', async () => {
      sgMail.send.mockResolvedValue([{ headers: {} }]);

      await sendRecoveryVerification('test@example.com', 'TestUser');

      const sentEmail = sgMail.send.mock.calls[0][0];
      expect(sentEmail.html).toContain('/ForgotPasswordVerification/testuser');
    });

    it('should handle recovery email failure', async () => {
      const mockError = new Error('Email service unavailable');
      sgMail.send.mockRejectedValue(mockError);

      const result = await sendRecoveryVerification('test@example.com', 'testuser');

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Email service unavailable');
    });
  });

  describe('Email Content Validation', () => {
    beforeEach(() => {
      sgMail.send.mockResolvedValue([{ headers: {} }]);
    });

    it('should use correct sender information', async () => {
      await sendVerification('test@example.com', 'testuser');

      const sentEmail = sgMail.send.mock.calls[0][0];
      expect(sentEmail.from).toEqual({
        name: 'Honey Do List',
        email: 'jdameus2025@fau.edu'
      });
    });

    it('should properly format username in verification email', async () => {
      await sendVerification('test@example.com', 'CamelCaseUser');

      const sentEmail = sgMail.send.mock.calls[0][0];
      expect(sentEmail.html).toContain('camelcaseuser'); // should be lowercase
    });

    it('should include proper styling in emails', async () => {
      await sendVerification('test@example.com', 'testuser');

      const sentEmail = sgMail.send.mock.calls[0][0];
      expect(sentEmail.html).toContain('font-family: Montserrat');
      expect(sentEmail.html).toContain('font-size: 22px');
    });
  });
});
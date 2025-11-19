// tests/userController.test.js - Unit tests for user controller functionality

// Mock the email template BEFORE any imports that use it
jest.mock('../config/emailTemplate', () => ({
  sendVerification: jest.fn().mockResolvedValue({ status: 'success', messageId: 'mock-id' }),
  sendRecoveryVerification: jest.fn().mockResolvedValue({ status: 'success', messageId: 'mock-id' }),
  sendDeleteNotification: jest.fn().mockResolvedValue({ status: 'success', messageId: 'mock-id' }),
  sendUpdateNotification: jest.fn().mockResolvedValue({ status: 'success', messageId: 'mock-id' })
}));

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  registerUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  loginUser,
  forgotPassword
} = require('../controllers/userController');
const emailTemplate = require('../config/emailTemplate');
const { generateUniqueEmail } = require('./testUtils');

describe('User Controller Tests', () => {
  let testUser;
  let req, res;

  // Connection is handled by testSetup.js (setupFilesAfterEnv)

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});

    // Create a test user with unique email
    testUser = await User.create({
      email: generateUniqueEmail('test'),
      username: 'testuser',
      password: 'password123'
    });

    // Mock Express req and res objects
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const newEmail = generateUniqueEmail('newuser');
      req.body = {
        email: newEmail,
        username: 'newuser',
        password: 'password123'
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          email: newEmail,
          username: 'newuser'
        })
      );
      expect(emailTemplate.sendVerification).toHaveBeenCalledWith(newEmail, 'newuser');

      // Verify user was created in database
      const user = await User.findOne({ email: newEmail });
      expect(user).toBeTruthy();
      expect(user.username).toBe('newuser');
    });

    it('should reject registration with existing email', async () => {
      req.body = {
        email: testUser.email,
        username: 'differentuser',
        password: 'password123'
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email is already registered!"
      });
    });

    it('should handle registration errors', async () => {
      req.body = {
        email: 'invalid-email',
        username: 'testuser2'
        // missing password
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('loginUser', () => {
    it('should login with valid credentials', async () => {
      req.body = {
        email: testUser.email,
        password: 'password123'
      };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        user: {
          id: testUser._id,
          email: testUser.email,
          username: testUser.username
        }
      });
    });

    it('should reject login with invalid email', async () => {
      req.body = {
        email: generateUniqueEmail('nonexistent'),
        password: 'password123'
      };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email or password"
      });
    });

    it('should reject login with invalid password', async () => {
      req.body = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email or password"
      });
    });

    it('should require both email and password', async () => {
      req.body = {
        email: testUser.email
        // missing password
      };

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email and password are required"
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without passwords', async () => {
      // Create another test user
      const user2Email = generateUniqueEmail('user2');
      await User.create({
        email: user2Email,
        username: 'user2',
        password: 'password123'
      });

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            email: testUser.email,
            username: testUser.username
          }),
          expect.objectContaining({
            email: user2Email,
            username: 'user2'
          })
        ])
      );

      // Verify passwords are not included
      const call = res.json.mock.calls[0][0];
      call.forEach(user => {
        expect(user.password).toBeUndefined();
      });
    });
  });

  describe('getUser', () => {
    it('should return user by ID without password', async () => {
      req.params.id = testUser._id.toString();

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: testUser._id,
        email: testUser.email,
        username: testUser.username,
        createdAt: testUser.createdAt
      });
    });

    it('should return 404 for non-existent user', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString();

      await getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updatedEmail = generateUniqueEmail('updated');
      req.params.id = testUser._id.toString();
      req.body = {
        username: 'updateduser',
        email: updatedEmail
      };

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'updateduser',
          email: updatedEmail
        })
      );
    });

    it('should reject password updates', async () => {
      req.params.id = testUser._id.toString();
      req.body = {
        password: 'newpassword'
      };

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Use /password endpoint to change password"
      });
    });

    it('should return 404 for non-existent user update', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString();
      req.body = { username: 'newname' };

      await updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      req.params.id = testUser._id.toString();

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully"
      });

      // Verify user was deleted
      const user = await User.findById(testUser._id);
      expect(user).toBeNull();
    });

    it('should return 404 for non-existent user deletion', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString();

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });
  });

  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      req.params.id = testUser._id.toString();
      req.body = {
        currentPassword: 'password123',
        newPassword: 'newpassword456'
      };

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password updated successfully"
      });

      // Verify password was changed
      const updatedUser = await User.findById(testUser._id);
      const isNewPasswordValid = await bcrypt.compare('newpassword456', updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('should reject password change with incorrect current password', async () => {
      req.params.id = testUser._id.toString();
      req.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword456'
      };

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Current password is incorrect"
      });
    });

    it('should return 404 for non-existent user password change', async () => {
      req.params.id = new mongoose.Types.ObjectId().toString();
      req.body = {
        currentPassword: 'password123',
        newPassword: 'newpassword456'
      };

      await changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found"
      });
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password request for existing user', async () => {
      req.body = {
        email: testUser.email
      };

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password reset instructions sent to email (mock response)"
      });
      expect(emailTemplate.sendRecoveryVerification).toHaveBeenCalledWith(
        testUser.email,
        testUser.username
      );
    });

    it('should handle forgot password request for non-existent user', async () => {
      req.body = {
        email: generateUniqueEmail('nonexistent')
      };

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "If that email exists, password reset instructions have been sent"
      });
    });

    it('should require email field', async () => {
      req.body = {};

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email is required"
      });
    });
  });
});
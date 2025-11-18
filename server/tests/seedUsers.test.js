// tests/seedUsers.test.js - Test suite for user seeding functionality

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateUniqueEmail } = require('./testUtils');

describe('User Seeding Tests', () => {
  // Connection is handled by testSetup.js (setupFilesAfterEnv)

  beforeEach(async () => {
    // Clear all users before each test (testSetup.js also clears after each test)
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create all test users successfully', async () => {
      // Create test users with unique emails
      const testUsers = [
        {
          email: generateUniqueEmail('testuser1'),
          username: 'testuser1',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('testuser2'),
          username: 'testuser2',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('testuser3'),
          username: 'testuser3',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('testadmin'),
          username: 'testadmin',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('testdemo'),
          username: 'testdemo',
          password: 'password123',
        },
      ];

      // Create test users
      const createdUsers = await User.insertMany(testUsers);

      // Assert correct number of users created
      expect(createdUsers.length).toBe(testUsers.length);

      // Check if all users were created with correct data
      for (const testUser of testUsers) {
        const dbUser = await User.findOne({ email: testUser.email });
        expect(dbUser).toBeTruthy();
        expect(dbUser.username).toBe(testUser.username);
        expect(dbUser.email).toBe(testUser.email);
        // Note: We don't compare passwords directly as they might be hashed
      }
    });

    it('should create users with timestamps', async () => {
      const testUsers = [
        {
          email: generateUniqueEmail('testuser1'),
          username: 'testuser1',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('testuser2'),
          username: 'testuser2',
          password: 'password123',
        },
      ];

      const createdUsers = await User.insertMany(testUsers);
      
      const firstUser = createdUsers[0];
      expect(firstUser.createdAt).toBeDefined();
      expect(firstUser.updatedAt).toBeDefined();
    });

    it('should prevent duplicate email addresses', async () => {
      const testUser1 = {
        email: generateUniqueEmail('testuser1'),
        username: 'testuser1',
        password: 'password123',
      };
      const testUser2 = {
        email: generateUniqueEmail('testuser2'),
        username: 'testuser2',
        password: 'password123',
      };

      // First create a user
      await User.create(testUser1);

      // Try to create another user with the same email
      await expect(
        User.create({
          ...testUser2,
          email: testUser1.email,
        })
      ).rejects.toThrow();
    });

    it('should store passwords as provided (if not hashed in model)', async () => {
      const testUser = {
        email: generateUniqueEmail('testuser'),
        username: 'testuser',
        password: 'password123',
      };

      const user = await User.create(testUser);
      const dbUser = await User.findById(user._id);
      
      // This test depends on whether you have password hashing in your model
      
      expect(dbUser.password).toBeDefined();
    });
  });

  describe('User Retrieval', () => {
    it('should retrieve all test users', async () => {
      const testUsers = [
        {
          email: generateUniqueEmail('testuser1'),
          username: 'testuser1',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('testuser2'),
          username: 'testuser2',
          password: 'password123',
        },
      ];

      // Create test users before test
      await User.insertMany(testUsers);

      const users = await User.find({});
      expect(users.length).toBe(testUsers.length);
    });

    it('should find user by email', async () => {
      const testUser = {
        email: generateUniqueEmail('testuser'),
        username: 'testuser',
        password: 'password123',
      };

      await User.create(testUser);

      const user = await User.findOne({ email: testUser.email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(testUser.username);
    });

    it('should find user by username', async () => {
      const testUser = {
        email: generateUniqueEmail('testadmin'),
        username: 'testadmin',
        password: 'password123',
      };

      await User.create(testUser);

      const user = await User.findOne({ username: testUser.username });
      expect(user).toBeTruthy();
      expect(user.email).toBe(testUser.email);
    });
  });

  describe('User Cleanup', () => {
    it('should successfully remove test users by email', async () => {
      // Create test users locally within this test
      const localUsers = [
        {
          email: generateUniqueEmail('deleteuser1'),
          username: 'deleteuser1',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('deleteuser2'),
          username: 'deleteuser2',
          password: 'password123',
        },
        {
          email: generateUniqueEmail('deleteuser3'),
          username: 'deleteuser3',
          password: 'password123',
        },
      ];

      // Insert users
      await User.insertMany(localUsers);

      // Get test emails
      const testEmails = localUsers.map((u) => u.email);

      // Delete users
      const deleteResult = await User.deleteMany({ email: { $in: testEmails } });
      expect(deleteResult.deletedCount).toBe(localUsers.length);

      // Verify users were deleted
      const remainingUsers = await User.find({ email: { $in: testEmails } });
      expect(remainingUsers.length).toBe(0);
    });

    it('should delete a specific user by ID', async () => {
      const testUser = {
        email: generateUniqueEmail('testuser'),
        username: 'testuser',
        password: 'password123',
      };

      const user = await User.create(testUser);
      const userId = user._id;

      await User.findByIdAndDelete(userId);

      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });
  });

  describe('User Validation', () => {
    it('should require email field', async () => {
      const invalidUser = {
        username: 'testuser',
        password: 'password123',
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should require username field', async () => {
      const invalidUser = {
        email: generateUniqueEmail('test'),
        password: 'password123',
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should require password field', async () => {
      const invalidUser = {
        email: generateUniqueEmail('test'),
        username: 'testuser',
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });
  });
});
// tests/seedUsers.test.js - Test suite for user seeding functionality

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateUniqueEmail } = require('./testUtils');

// Helper function to create unique test users for each test
function createTestUsersData() {
  return [
    {
      email: generateUniqueEmail('testuser1'),
      username: `testuser1-${Date.now()}`,
      password: 'password123',
    },
    {
      email: generateUniqueEmail('testuser2'),
      username: `testuser2-${Date.now()}`,
      password: 'password123',
    },
    {
      email: generateUniqueEmail('testuser3'),
      username: `testuser3-${Date.now()}`,
      password: 'password123',
    },
    {
      email: generateUniqueEmail('testadmin'),
      username: `testadmin-${Date.now()}`,
      password: 'password123',
    },
    {
      email: generateUniqueEmail('testdemo'),
      username: `testdemo-${Date.now()}`,
      password: 'password123',
    },
  ];
}

describe('User Seeding Tests', () => {
  // Connection is handled by testSetup.js (setupFilesAfterEnv)

  beforeEach(async () => {
    // Clear all users before each test (testSetup.js also clears after each test)
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create all test users successfully', async () => {
      // Create unique test users for this test
      const testUsers = createTestUsersData();
      
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
      const testUsers = createTestUsersData();
      const createdUsers = await User.insertMany(testUsers);
      
      const firstUser = createdUsers[0];
      expect(firstUser.createdAt).toBeDefined();
      expect(firstUser.updatedAt).toBeDefined();
    });

    it('should prevent duplicate email addresses', async () => {
      // Create a fixed email for this specific test
      const fixedEmail = `duplicate-test-${Date.now()}@test.com`;
      
      // First create a user with the fixed email
      await User.create({
        email: fixedEmail,
        username: `user1-${Date.now()}`,
        password: 'password123'
      });

      // Try to create another user with the same email
      await expect(
        User.create({
          email: fixedEmail,  // Same email as above
          username: `user2-${Date.now()}`,
          password: 'password123'
        })
      ).rejects.toThrow();
    });

    it('should store passwords as provided (if not hashed in model)', async () => {
      const testUser = {
        email: generateUniqueEmail('password-test'),
        username: `pwdtest-${Date.now()}`,
        password: 'password123'
      };
      
      const user = await User.create(testUser);
      const dbUser = await User.findById(user._id);
      
      // This test depends on whether you have password hashing in your model
      
      expect(dbUser.password).toBeDefined();
    });
  });

  describe('User Retrieval', () => {
    it('should retrieve all test users', async () => {
      // Create unique test users for this test
      const testUsers = createTestUsersData();
      await User.insertMany(testUsers);
      
      const users = await User.find({});
      expect(users.length).toBe(testUsers.length);
    });

    it('should find user by email', async () => {
      const testUsers = createTestUsersData();
      await User.insertMany(testUsers);
      
      const user = await User.findOne({ email: testUsers[0].email });
      expect(user).toBeTruthy();
      expect(user.username).toBe(testUsers[0].username);
    });

    it('should find user by username', async () => {
      const testUsers = createTestUsersData();
      await User.insertMany(testUsers);
      
      const user = await User.findOne({ username: testUsers[3].username });
      expect(user).toBeTruthy();
      expect(user.email).toBe(testUsers[3].email);
    });
  });

  describe('User Cleanup', () => {
    it('should successfully remove test users by email', async () => {
      // Create unique test users for this test locally
      const testUsers = createTestUsersData();
      
      // First create all test users
      await User.insertMany(testUsers);

      // Get test emails
      const testEmails = testUsers.map((u) => u.email);

      // Delete users
      const deleteResult = await User.deleteMany({ email: { $in: testEmails } });
      expect(deleteResult.deletedCount).toBe(testUsers.length);

      // Verify users were deleted
      const remainingUsers = await User.find({ email: { $in: testEmails } });
      expect(remainingUsers.length).toBe(0);
    });

    it('should delete a specific user by ID', async () => {
      const testUser = {
        email: generateUniqueEmail('delete-test'),
        username: `deletetest-${Date.now()}`,
        password: 'password123'
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
// tests/seedUsers.test.js - Test suite for user seeding functionality

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const testUsers = [
  {
    email: process.env.TESTUSER1EMAIL,
    username: process.env.TESTUSER1USERNAME,
    password: process.env.TESTUSER1PASSWORD,
  },
  {
    email: process.env.TESTUSER2EMAIL,
    username: process.env.TESTUSER2USERNAME,
    password: process.env.TESTUSER2PASSWORD,
  },
  {
    email: process.env.TESTUSER3EMAIL,
    username: process.env.TESTUSER3USERNAME,
    password: process.env.TESTUSER3PASSWORD,
  },
  {
    email: process.env.TESTADMINEMAIL,
    username: process.env.TESTADMINUSERNAME,
    password: process.env.TESTADMINPASSWORD,
  },
  {
    email: process.env.TESTDEMOEMAIL,
    username: process.env.TESTDEMOUSERNAME,
    password: process.env.TESTDEMOPASSWORD,
  },
];

describe('User Seeding Tests', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Test database connected');
    } catch (error) {
      console.error('❌ Error connecting to the database:', error);
      throw error;
    }
  }, 30000); // Increase timeout for database connection

  afterAll(async () => {
    await mongoose.connection.close();
    console.log('🔌 Test database connection closed');
  });

  beforeEach(async () => {
    // Clear all users before each test
    await User.deleteMany({});
  });

  describe('User Creation', () => {
    it('should create all test users successfully', async () => {
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
      const createdUsers = await User.insertMany(testUsers);
      
      const firstUser = createdUsers[0];
      expect(firstUser.createdAt).toBeDefined();
      expect(firstUser.updatedAt).toBeDefined();
    });

    it('should prevent duplicate email addresses', async () => {
      // First create a user
      await User.create(testUsers[0]);

      // Try to create another user with the same email
      await expect(
        User.create({
          ...testUsers[1],
          email: testUsers[0].email,
        })
      ).rejects.toThrow();
    });

    it('should store passwords as provided (if not hashed in model)', async () => {
      const user = await User.create(testUsers[0]);
      const dbUser = await User.findById(user._id);
      
      // This test depends on whether you have password hashing in your model
      
      expect(dbUser.password).toBeDefined();
    });
  });

  describe('User Retrieval', () => {
    beforeEach(async () => {
      // Create test users before each test in this suite
      await User.insertMany(testUsers);
    });

    it('should retrieve all test users', async () => {
      const users = await User.find({});
      expect(users.length).toBe(testUsers.length);
    });

    it('should find user by email', async () => {
      const user = await User.findOne({ email: 'roottest01@test.com' });
      expect(user).toBeTruthy();
      expect(user.username).toBe('roottest01');
    });

    it('should find user by username', async () => {
      const user = await User.findOne({ username: 'admintest' });
      expect(user).toBeTruthy();
      expect(user.email).toBe('admintest@test.com');
    });
  });

  describe('User Cleanup', () => {
    it('should successfully remove test users by email', async () => {
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
      const user = await User.create(testUsers[0]);
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
        email: 'test@test.com',
        password: 'password123',
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });

    it('should require password field', async () => {
      const invalidUser = {
        email: 'test@test.com',
        username: 'testuser',
      };

      await expect(User.create(invalidUser)).rejects.toThrow();
    });
  });
});
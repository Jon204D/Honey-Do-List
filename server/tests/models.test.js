// tests/models.test.js - Unit tests for Mongoose models

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Task = require('../models/Task');
const { generateUniqueEmail } = require('./testUtils');

describe('Model Tests', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Test database connected for model tests');
    } catch (error) {
      console.error('❌ Error connecting to the database:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.close();
    console.log('🔌 Test database connection closed');
  });

  beforeEach(async () => {
    // Clear all data before each test
    await User.deleteMany({});
    await Task.deleteMany({});
  });

  describe('User Model', () => {
    describe('Password Hashing', () => {
      it('should hash password before saving', async () => {
        const plainPassword = 'testPassword123';
        const user = new User({
          email: generateUniqueEmail('test'),
          username: 'testuser',
          password: plainPassword
        });

        await user.save();

        // Password should be hashed, not plain text
        expect(user.password).not.toBe(plainPassword);
        expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash format
      });

      it('should not rehash password if not modified', async () => {
        const user = await User.create({
          email: generateUniqueEmail('test'),
          username: 'testuser',
          password: 'password123'
        });

        const originalHash = user.password;

        // Update a different field
        user.username = 'updateduser';
        await user.save();

        // Password hash should remain the same
        expect(user.password).toBe(originalHash);
      });

      it('should rehash password when password is modified', async () => {
        const user = await User.create({
          email: generateUniqueEmail('test'),
          username: 'testuser',
          password: 'password123'
        });

        const originalHash = user.password;

        // Update password
        user.password = 'newpassword456';
        await user.save();

        // Password hash should be different
        expect(user.password).not.toBe(originalHash);

        // Should be able to verify new password
        const isValid = await bcrypt.compare('newpassword456', user.password);
        expect(isValid).toBe(true);
      });
    });

    describe('Validation', () => {
      it('should require email', async () => {
        const user = new User({
          username: 'testuser',
          password: 'password123'
        });

        await expect(user.save()).rejects.toThrow();
      });

      it('should require username', async () => {
        const user = new User({
          email: generateUniqueEmail('test'),
          password: 'password123'
        });

        await expect(user.save()).rejects.toThrow();
      });

      it('should require password', async () => {
        const user = new User({
          email: generateUniqueEmail('test'),
          username: 'testuser'
        });

        await expect(user.save()).rejects.toThrow();
      });

      it('should enforce unique email', async () => {
        const uniqueEmail = generateUniqueEmail('test');
        await User.create({
          email: uniqueEmail,
          username: 'testuser1',
          password: 'password123'
        });

        const duplicateUser = new User({
          email: uniqueEmail, // Same email
          username: 'testuser2',
          password: 'password123'
        });

        await expect(duplicateUser.save()).rejects.toThrow();
      });
    });

    describe('Timestamps', () => {
      it('should add createdAt and updatedAt timestamps', async () => {
        const user = await User.create({
          email: generateUniqueEmail('test'),
          username: 'testuser',
          password: 'password123'
        });

        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.updatedAt).toBeInstanceOf(Date);
        expect(user.createdAt).toEqual(user.updatedAt);
      });

      it('should update updatedAt on modification', async () => {
        const user = await User.create({
          email: generateUniqueEmail('test'),
          username: 'testuser',
          password: 'password123'
        });

        const originalUpdatedAt = user.updatedAt;

        // Wait a bit to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 10));

        user.username = 'updateduser';
        await user.save();

        expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      });
    });
  });

  describe('Task Model', () => {
    let testUser1, testUser2;

    beforeEach(async () => {
      testUser1 = await User.create({
        email: generateUniqueEmail('user1'),
        username: 'user1',
        password: 'password123'
      });

      testUser2 = await User.create({
        email: generateUniqueEmail('user2'),
        username: 'user2',
        password: 'password123'
      });
    });

    describe('Basic Functionality', () => {
      it('should create task with required fields', async () => {
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task',
          assignedTo: testUser2._id
        });

        expect(task.title).toBe('Test Task');
        expect(task.owner).toEqual(testUser1._id);
        expect(task.assignedTo).toEqual(testUser2._id);
        expect(task.createdAt).toBeInstanceOf(Date);
        expect(task.updatedAt).toBeInstanceOf(Date);
      });

      it('should set default values correctly', async () => {
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task'
        });

        expect(task.priority).toBe('medium');
        expect(task.status).toBe('pending');
        expect(task.reactions).toEqual([]);
        expect(task.tags).toEqual([]);
        expect(task.comments).toEqual([]);
      });
    });

    describe('Validation', () => {
      it('should require title', async () => {
        const task = new Task({
          owner: testUser1._id
        });

        await expect(task.save()).rejects.toThrow(/required/);
      });

      it('should validate priority enum', async () => {
        const task = new Task({
          owner: testUser1._id,
          title: 'Test Task',
          priority: 'invalid-priority'
        });

        await expect(task.save()).rejects.toThrow();
      });

      it('should validate status enum', async () => {
        const task = new Task({
          owner: testUser1._id,
          title: 'Test Task',
          status: 'invalid-status'
        });

        await expect(task.save()).rejects.toThrow();
      });

      it('should accept valid priority values', async () => {
        const priorities = ['low', 'medium', 'high'];

        for (const priority of priorities) {
          const task = await Task.create({
            owner: testUser1._id,
            title: `Test Task ${priority}`,
            priority
          });

          expect(task.priority).toBe(priority);
        }
      });

      it('should accept valid status values', async () => {
        const statuses = ['pending', 'in-progress', 'completed'];

        for (const status of statuses) {
          const task = await Task.create({
            owner: testUser1._id,
            title: `Test Task ${status}`,
            status
          });

          expect(task.status).toBe(status);
        }
      });
    });

    describe('Relationships', () => {
      it('should populate owner reference', async () => {
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task'
        });

        const populatedTask = await Task.findById(task._id).populate('owner');

        expect(populatedTask.owner.email).toBe(testUser1.email);
        expect(populatedTask.owner.username).toBe(testUser1.username);
      });

      it('should populate assignedTo reference', async () => {
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task',
          assignedTo: testUser2._id
        });

        const populatedTask = await Task.findById(task._id).populate('assignedTo');

        expect(populatedTask.assignedTo.email).toBe(testUser2.email);
        expect(populatedTask.assignedTo.username).toBe(testUser2.username);
      });
    });

    describe('Arrays and Objects', () => {
      it('should handle tags array', async () => {
        const tags = ['urgent', 'home', 'family'];
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task',
          tags
        });

        expect(task.tags).toEqual(tags);
      });

      it('should handle reactions array', async () => {
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task'
        });

        task.reactions.push('👍', '❤️', '🎉');
        await task.save();

        expect(task.reactions).toEqual(['👍', '❤️', '🎉']);
      });

      it('should handle comments array with embedded schema', async () => {
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task'
        });

        task.comments.push({
          body: 'This is a test comment'
        });
        await task.save();

        expect(task.comments).toHaveLength(1);
        expect(task.comments[0].body).toBe('This is a test comment');
        expect(task.comments[0].createdAt).toBeInstanceOf(Date);
      });
    });

    describe('Dates', () => {
      it('should handle due date', async () => {
        const dueDate = new Date('2024-12-31T23:59:59.000Z');
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task',
          dueDate
        });

        expect(task.dueDate).toEqual(dueDate);
      });

      it('should allow null due date', async () => {
        const task = await Task.create({
          owner: testUser1._id,
          title: 'Test Task'
        });

        expect(task.dueDate).toBeUndefined();
      });
    });
  });
});
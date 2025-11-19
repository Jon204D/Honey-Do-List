// tests/testUtils.js - Utility functions for testing

const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

/**
 * Create a test user with default values
 */
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    password: 'password123'
  };

  return await User.create({ ...defaultUser, ...overrides });
};

/**
 * Create a test task with default values
 */
const createTestTask = async (overrides = {}) => {
  let owner = overrides.owner;
  let assignedTo = overrides.assignedTo;

  // Create users if not provided
  if (!owner) {
    const ownerUser = await createTestUser();
    owner = ownerUser._id;
  }

  if (!assignedTo) {
    const assigneeUser = await createTestUser();
    assignedTo = assigneeUser._id;
  }

  const defaultTask = {
    owner,
    title: `Test Task ${Date.now()}`,
    description: 'This is a test task',
    assignedTo,
    priority: 'medium',
    status: 'pending',
    tags: ['test'],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  };

  return await Task.create({ ...defaultTask, ...overrides });
};

/**
 * Clean up test database
 */
const cleanupTestData = async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
};

/**
 * Create multiple test users
 */
const createTestUsers = async (count = 2) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `testuser${i}@example.com`,
      username: `testuser${i}`
    });
    users.push(user);
  }
  return users;
};

/**
 * Create multiple test tasks
 */
const createTestTasks = async (count = 3, users = null) => {
  if (!users || users.length < 2) {
    users = await createTestUsers(2);
  }

  const tasks = [];
  for (let i = 0; i < count; i++) {
    const task = await createTestTask({
      owner: users[0]._id,
      assignedTo: users[1]._id,
      title: `Test Task ${i + 1}`,
      priority: ['low', 'medium', 'high'][i % 3],
      status: ['pending', 'in-progress', 'completed'][i % 3]
    });
    tasks.push(task);
  }
  return tasks;
};

/**
 * Generate valid ObjectId for testing
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId();
};

/**
 * Create mock Express req/res objects for controller testing
 */
const createMockReqRes = (reqOverrides = {}, resOverrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    ...reqOverrides
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    ...resOverrides
  };

  return { req, res };
};

/**
 * Wait for a specified number of milliseconds
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate test email addresses
 */
const generateTestEmail = (prefix = 'test') => {
  return `${prefix}${Date.now()}@example.com`;
};

/**
 * Generate unique email addresses for tests to avoid duplicate key errors
 */
const generateUniqueEmail = (base = 'test') => {
  return `${base}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
};

/**
 * Generate test usernames
 */
const generateTestUsername = (prefix = 'user') => {
  return `${prefix}${Date.now()}`;
};

/**
 * Validate that an object has the expected structure
 */
const validateObjectStructure = (obj, expectedKeys) => {
  const objKeys = Object.keys(obj);
  return expectedKeys.every(key => objKeys.includes(key));
};

/**
 * Create a user with hashed password (for testing login)
 */
const createUserWithHashedPassword = async (plainPassword = 'password123') => {
  const user = await createTestUser({ password: plainPassword });
  // The pre-save hook will hash the password
  return user;
};

/**
 * Helpers for mocking mongoose chainable queries like Model.find().populate(...).exec()
 * Creates a chainable mock that supports .populate().exec() and direct awaiting
 */
function mockFindPopulate(model, returnValue) {
  const mockChain = {
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(returnValue),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis()
  };
  
  // Make the chain also thenable so it can be awaited directly
  mockChain.then = function(resolve, reject) {
    return mockChain.exec().then(resolve, reject);
  };

  // spy on model.find and return the chainable object
  jest.spyOn(model, 'find').mockReturnValue(mockChain);

  return mockChain;
}

module.exports = {
  createTestUser,
  createTestTask,
  cleanupTestData,
  createTestUsers,
  createTestTasks,
  generateObjectId,
  createMockReqRes,
  sleep,
  generateTestEmail,
  generateTestUsername,
  generateUniqueEmail,
  validateObjectStructure,
  createUserWithHashedPassword,
  mockFindPopulate
};
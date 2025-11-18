// tests/task.test.js - Unit tests for task controller functionality

require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const {
  getAllTasksQuery,
  getTaskByIdQuery,
  createTaskQuery,
  updateTaskQuery,
  deleteTaskQuery,
  addReactionToTaskQuery,
  getUserTasksQuery,
  getTasksAssignedToUserQuery
} = require('../queries/taskQueries');

describe('Task Controller Tests', () => {
  let testUser1, testUser2;
  let testTask;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Test database connected for task tests');
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
    // Clear all tasks and users before each test
    await Task.deleteMany({});
    await User.deleteMany({});

    // Create test users
    testUser1 = await User.create({
      email: 'taskowner@test.com',
      username: 'taskowner',
      password: 'password123'
    });

    testUser2 = await User.create({
      email: 'taskassignee@test.com',
      username: 'taskassignee',
      password: 'password123'
    });

    // Create a test task
    testTask = await Task.create({
      owner: testUser1._id,
      title: 'Test Task',
      description: 'This is a test task',
      assignedTo: testUser2._id,
      priority: 'high',
      status: 'pending',
      tags: ['test', 'important'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
  });

  describe('Task Creation', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        owner: testUser1._id,
        title: 'New Task',
        description: 'A newly created task',
        assignedTo: testUser2._id,
        priority: 'medium',
        status: 'pending',
        tags: ['new'],
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };

      const newTask = await createTaskQuery(taskData);

      expect(newTask).toBeTruthy();
      expect(newTask.title).toBe(taskData.title);
      expect(newTask.description).toBe(taskData.description);
      expect(newTask.priority).toBe(taskData.priority);
      expect(newTask.status).toBe(taskData.status);
      expect(newTask.tags).toEqual(taskData.tags);
    });

    it('should require title field', async () => {
      const taskData = {
        owner: testUser1._id,
        description: 'Task without title'
      };

      await expect(createTaskQuery(taskData)).rejects.toThrow();
    });

    it('should set default values correctly', async () => {
      const taskData = {
        owner: testUser1._id,
        title: 'Simple Task'
      };

      const newTask = await createTaskQuery(taskData);

      expect(newTask.priority).toBe('medium'); // default
      expect(newTask.status).toBe('pending'); // default
      expect(newTask.reactions).toEqual([]); // default
    });
  });

  describe('Task Retrieval', () => {
    it('should get all tasks', async () => {
      const tasks = await getAllTasksQuery();
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe(testTask.title);
    });

    it('should get task by ID', async () => {
      const task = await getTaskByIdQuery(testTask._id);
      expect(task).toBeTruthy();
      expect(task.title).toBe(testTask.title);
    });

    it('should return null for non-existent task ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const task = await getTaskByIdQuery(fakeId);
      expect(task).toBeNull();
    });

    it('should get tasks by owner (user tasks)', async () => {
      const tasks = await getUserTasksQuery(testUser1._id);
      expect(tasks.length).toBe(1);
      expect(tasks[0].owner.toString()).toBe(testUser1._id.toString());
    });

    it('should get tasks assigned to user', async () => {
      const tasks = await getTasksAssignedToUserQuery(testUser2._id);
      expect(tasks.length).toBe(1);
      expect(tasks[0].assignedTo.toString()).toBe(testUser2._id.toString());
    });
  });

  describe('Task Updates', () => {
    it('should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task Title',
        status: 'in-progress',
        priority: 'low'
      };

      const updatedTask = await updateTaskQuery(testTask._id, updateData);

      expect(updatedTask).toBeTruthy();
      expect(updatedTask.title).toBe(updateData.title);
      expect(updatedTask.status).toBe(updateData.status);
      expect(updatedTask.priority).toBe(updateData.priority);
    });

    it('should return null for non-existent task update', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updatedTask = await updateTaskQuery(fakeId, { title: 'Updated' });
      expect(updatedTask).toBeNull();
    });

    it('should add reaction to task', async () => {
      const emoji = '👍';
      const updatedTask = await addReactionToTaskQuery(testTask._id, emoji);

      expect(updatedTask).toBeTruthy();
      expect(updatedTask.reactions).toContain(emoji);
    });

    it('should allow multiple reactions', async () => {
      await addReactionToTaskQuery(testTask._id, '👍');
      const updatedTask = await addReactionToTaskQuery(testTask._id, '❤️');

      expect(updatedTask.reactions).toContain('👍');
      expect(updatedTask.reactions).toContain('❤️');
      expect(updatedTask.reactions.length).toBe(2);
    });
  });

  describe('Task Deletion', () => {
    it('should delete task successfully', async () => {
      const deletedTask = await deleteTaskQuery(testTask._id);
      expect(deletedTask).toBeTruthy();
      expect(deletedTask._id.toString()).toBe(testTask._id.toString());

      // Verify task is actually deleted
      const task = await getTaskByIdQuery(testTask._id);
      expect(task).toBeNull();
    });

    it('should return null for non-existent task deletion', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const deletedTask = await deleteTaskQuery(fakeId);
      expect(deletedTask).toBeNull();
    });
  });

  describe('Task Validation', () => {
    it('should validate priority enum', async () => {
      const taskData = {
        owner: testUser1._id,
        title: 'Invalid Priority Task',
        priority: 'invalid-priority'
      };

      await expect(createTaskQuery(taskData)).rejects.toThrow();
    });

    it('should validate status enum', async () => {
      const taskData = {
        owner: testUser1._id,
        title: 'Invalid Status Task',
        status: 'invalid-status'
      };

      await expect(createTaskQuery(taskData)).rejects.toThrow();
    });

    it('should handle invalid ObjectId references gracefully', async () => {
      const taskData = {
        owner: 'invalid-id',
        title: 'Invalid Owner Task'
      };

      await expect(createTaskQuery(taskData)).rejects.toThrow();
    });
  });

  describe('Task Filtering and Queries', () => {
    beforeEach(async () => {
      // Create additional tasks for filtering tests
      await Task.create({
        owner: testUser1._id,
        title: 'High Priority Task',
        assignedTo: testUser2._id,
        priority: 'high',
        status: 'completed',
        tags: ['urgent']
      });

      await Task.create({
        owner: testUser2._id,
        title: 'Low Priority Task',
        assignedTo: testUser1._id,
        priority: 'low',
        status: 'pending',
        tags: ['optional']
      });
    });

    it('should filter tasks by owner', async () => {
      const user1Tasks = await getUserTasksQuery(testUser1._id);
      const user2Tasks = await getUserTasksQuery(testUser2._id);

      expect(user1Tasks.length).toBe(2); // original testTask + high priority task
      expect(user2Tasks.length).toBe(1); // low priority task
    });

    it('should filter tasks by assignee', async () => {
      const user1Assigned = await getTasksAssignedToUserQuery(testUser1._id);
      const user2Assigned = await getTasksAssignedToUserQuery(testUser2._id);

      expect(user1Assigned.length).toBe(1); // low priority task
      expect(user2Assigned.length).toBe(2); // original testTask + high priority task
    });
  });
});
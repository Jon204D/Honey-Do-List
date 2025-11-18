// tests/taskController.test.js - Unit tests for task controller

require('dotenv').config();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addReactionToTask,
  getUserTasks,
  getTasksAssignedToUser
} = require('../controllers/taskController');
const { createMockReqRes, createTestUser, createTestTask, cleanupTestData } = require('./testUtils');

describe('Task Controller Tests', () => {
  let testUser1, testUser2, testTask;

  beforeAll(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Test database connected for task controller tests');
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
    await cleanupTestData();
    
    // Create test users and task
    testUser1 = await createTestUser({ email: 'owner@test.com', username: 'owner' });
    testUser2 = await createTestUser({ email: 'assignee@test.com', username: 'assignee' });
    testTask = await createTestTask({
      owner: testUser1._id,
      assignedTo: testUser2._id,
      title: 'Controller Test Task'
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', async () => {
      const { req, res } = createMockReqRes();

      await getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: testTask.title,
            _id: testTask._id
          })
        ])
      );
    });

    it('should handle errors gracefully', async () => {
      const { req, res } = createMockReqRes();
      
      // Mock database error
      jest.spyOn(Task, 'find').mockRejectedValueOnce(new Error('Database error'));

      await getAllTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });

      // Restore original implementation
      Task.find.mockRestore();
    });
  });

  describe('getTaskById', () => {
    it('should return task by ID', async () => {
      const { req, res } = createMockReqRes({
        params: { id: testTask._id.toString() }
      });

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: testTask.title,
          _id: testTask._id
        })
      );
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res } = createMockReqRes({
        params: { id: fakeId.toString() }
      });

      await getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task not found'
      });
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        owner: testUser1._id,
        title: 'New Controller Task',
        description: 'Created via controller',
        assignedTo: testUser2._id,
        priority: 'high'
      };

      const { req, res } = createMockReqRes({
        body: taskData
      });

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority
        })
      );
    });

    it('should handle validation errors', async () => {
      const invalidTaskData = {
        owner: testUser1._id
        // missing required title
      };

      const { req, res } = createMockReqRes({
        body: invalidTaskData
      });

      await createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      const updateData = {
        title: 'Updated Task Title',
        status: 'in-progress'
      };

      const { req, res } = createMockReqRes({
        params: { id: testTask._id.toString() },
        body: updateData
      });

      await updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: updateData.title,
          status: updateData.status
        })
      );
    });

    it('should return 404 for non-existent task update', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const { req, res } = createMockReqRes({
        params: { id: fakeId.toString() },
        body: { title: 'Updated Title' }
      });

      await updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task not found'
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const { req, res } = createMockReqRes({
        params: { id: testTask._id.toString() }
      });

      await deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Task deleted',
        task: expect.objectContaining({
          _id: testTask._id
        })
      });

      // Verify task was deleted
      const deletedTask = await Task.findById(testTask._id);
      expect(deletedTask).toBeNull();
    });
  });

  describe('addReactionToTask', () => {
    it('should add reaction to task', async () => {
      const { req, res } = createMockReqRes({
        params: { id: testTask._id.toString() },
        body: { emoji: '👍' }
      });

      await addReactionToTask(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reaction added',
        task: expect.objectContaining({
          reactions: expect.arrayContaining(['👍'])
        })
      });
    });
  });

  describe('getUserTasks', () => {
    it('should get tasks by owner', async () => {
      const { req, res } = createMockReqRes({
        params: { userId: testUser1._id.toString() }
      });

      await getUserTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: testTask.title
          })
        ])
      );
    });

    it('should return 404 when user has no tasks', async () => {
      const userWithNoTasks = await createTestUser();
      const { req, res } = createMockReqRes({
        params: { userId: userWithNoTasks._id.toString() }
      });

      await getUserTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No tasks found for this user!'
      });
    });
  });

  describe('getTasksAssignedToUser', () => {
    it('should get tasks assigned to user', async () => {
      const { req, res } = createMockReqRes({
        params: { userId: testUser2._id.toString() }
      });

      await getTasksAssignedToUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            title: testTask.title
          })
        ])
      );
    });

    it('should return 404 when no tasks are assigned to user', async () => {
      const userWithNoAssignedTasks = await createTestUser();
      const { req, res } = createMockReqRes({
        params: { userId: userWithNoAssignedTasks._id.toString() }
      });

      await getTasksAssignedToUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'No tasks assigned to this user'
      });
    });
  });
});
// Our Routes 
const express = require('express');
const router = express.Router();

// Import task controller functions
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addReactionToTask,
  getUserTasks,
  getTasksAssignedToUser,
  getMyTasks,
} = require('../controllers/taskController');

// Routes
router.get('/', getAllTasks);                  // Get all tasks
router.get('/:id', getTaskById);               // Get a single task by ID
router.post('/', createTask);                  // Create a new task
router.put('/:id', updateTask);                // Update an existing task
router.delete('/:id', deleteTask);             // Delete a task
router.post('/:id/react', addReactionToTask);  // Add a reaction (emoji) to a task
router.get('/users/:userId', getUserTasks);     // Get tasks by user ID
router.get("/assigned/:userId", getTasksAssignedToUser);  // Get tasks by assigned to ID
router.get("/my/:userId", getMyTasks);          // overall dashboarding function!! :3

module.exports = router;
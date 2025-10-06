// server/controllers/taskController.js

// loading queries
// honestly if we have time i might do what i did over in the user controller by making the queries an array, but its wtv
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

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await getAllTasksQuery();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await getTaskByIdQuery(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const newTask = await createTaskQuery(req.body);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update an existing task
const updateTask = async (req, res) => {
  try {
    const updatedTask = await updateTaskQuery(req.params.id, req.body);
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const deletedTask = await deleteTaskQuery(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted', task: deletedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add emoji reaction to a task
const addReactionToTask = async (req, res) => {
  try {
    const updatedTask = await addReactionToTaskQuery(id, emoji);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Reaction added', task: updatedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// focuses on what the user assigns to others
const getUserTasks = async (req, res) => {
  const { userId } = req.params;

  try {
    const tasks = await getUserTasksQuery(userId);
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user!' });
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// focus on what the user has been assigned
const getTasksAssignedToUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const tasks = await getTasksAssignedToUserQuery(userId);
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks assigned to this user" });
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// this is the overall dashboarding function
const getMyTasks = async (req, res) => {
  const { userId } = req.params;
  const { status, priority, dueDate } = req.query; // passes the filters via query string

  try {
    const tasks = await getMyTasksQuery(userId, { status, priority, dueDate });
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addReactionToTask,
  getUserTasks,
  getTasksAssignedToUser,
  getMyTasks,
};
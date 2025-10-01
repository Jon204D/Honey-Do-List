// server/controllers/taskController.js

// Placeholder task list for now
let tasks = [];

// Get all tasks
const getAllTasks = (req, res) => {
  res.status(200).json(tasks);
};

// Get a single task by ID
const getTaskById = (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(200).json(task);
};

// Create a new task
const createTask = (req, res) => {
  const { title, description, assignedTo, priority, dueDate } = req.body;

  const newTask = {
    id: Date.now().toString(), // fake unique ID
    title,
    description,
    assignedTo,
    priority,
    dueDate,
    reactions: [],
    status: 'pending',
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
};

// Update an existing task
const updateTask = (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  tasks[index] = { ...tasks[index], ...req.body };
  res.status(200).json(tasks[index]);
};

// Delete a task
const deleteTask = (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const deletedTask = tasks.splice(index, 1);
  res.status(200).json({ message: 'Task deleted', task: deletedTask[0] });
};

// Add emoji reaction to a task
const addReactionToTask = (req, res) => {
  const { id } = req.params;
  const { emoji } = req.body;

  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  task.reactions.push(emoji);
  res.status(200).json({ message: 'Reaction added', task });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addReactionToTask,
};
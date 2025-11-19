// server/controllers/taskController.js
const {
  getAllTasksQuery,
  getTaskByIdQuery,
  createTaskQuery,
  updateTaskQuery,
  deleteTaskQuery,
  addReactionToTaskQuery,
  getUserTasksQuery,
  getTasksAssignedToUserQuery,
  getMyTasksQuery  // FIXED: Added missing import
} = require('../queries/taskQueries');

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await getAllTasksQuery();
    res.status(200).json(tasks);
  } catch (err) {
    console.error('❌ Error getting all tasks:', err);
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
    console.error('❌ Error getting task by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    console.log('📝 Creating task with data:', req.body);
    
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    
    const newTask = await createTaskQuery(req.body);
    console.log('✅ Task created successfully:', newTask._id);
    res.status(201).json(newTask);
  } catch (err) {
    console.error('❌ Error creating task:', err);
    res.status(400).json({ error: err.message });
  }
};

// Update an existing task
const updateTask = async (req, res) => {
  try {
    console.log('📝 Updating task:', req.params.id, 'with data:', req.body);
    const updatedTask = await updateTaskQuery(req.params.id, req.body);
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    console.log('✅ Task updated successfully');
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    console.log('🗑️  Deleting task:', req.params.id);
    const deletedTask = await deleteTaskQuery(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    console.log('✅ Task deleted successfully');
    res.status(200).json({ message: 'Task deleted', task: deletedTask });
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add emoji reaction to a task
const addReactionToTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    
    console.log('😀 Adding reaction to task:', id, 'emoji:', emoji);
    
    const updatedTask = await addReactionToTaskQuery(id, emoji);
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    console.log('✅ Reaction added successfully');
    res.status(200).json({ message: 'Reaction added', task: updatedTask });
  } catch (err) {
    console.error('❌ Error adding reaction:', err);
    res.status(500).json({ error: err.message });
  }
};

// focuses on what the user assigns to others
const getUserTasks = async (req, res) => {
  const { userId } = req.params;

  try {
    console.log('📋 Getting tasks for user:', userId);
    const tasks = await getUserTasksQuery(userId);
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user!' });
    }
    console.log(`✅ Found ${tasks.length} tasks for user`);
    res.status(200).json(tasks);
  } catch (err) {
    console.error('❌ Error getting user tasks:', err);
    res.status(500).json({ error: err.message });
  }
};

// focus on what the user has been assigned
const getTasksAssignedToUser = async (req, res) => {
  const { userId } = req.params;

  try {
    console.log('📋 Getting tasks assigned to user:', userId);
    const tasks = await getTasksAssignedToUserQuery(userId);
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks assigned to this user" });
    }
    console.log(`✅ Found ${tasks.length} assigned tasks`);
    res.status(200).json(tasks);
  } catch (err) {
    console.error('❌ Error getting assigned tasks:', err);
    res.status(500).json({ error: err.message });
  }
};

// this is the overall dashboarding function
const getMyTasks = async (req, res) => {
  const { userId } = req.params;
  const { status, priority, dueDate } = req.query; // passes the filters via query string

  try {
    console.log('📊 Getting all tasks for user:', userId, 'with filters:', { status, priority, dueDate });
    const tasks = await getMyTasksQuery(userId, { status, priority, dueDate });
    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }
    console.log(`✅ Found ${tasks.length} total tasks`);
    res.status(200).json(tasks);
  } catch (err) {
    console.error('❌ Error getting my tasks:', err);
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
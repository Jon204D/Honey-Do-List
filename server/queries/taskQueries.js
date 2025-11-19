// commonQueries/taskQueries.js

const Task = require("../models/Task"); 

const createTaskQuery = async(taskData) => {
    const newTask = new Task(taskData);
    return await newTask.save();
};

const getTaskByIdQuery = async (taskID) => {
    return await Task.findById(taskID).populate("owner", "email username");
};

const getAllTasksQuery = async () => {
    try {
        return await Task.find().populate("owner", "email username");
    } catch (error) {
        console.error('Error in getAllTasksQuery:', error);
        throw error;
    }
};

const getUserTasksQuery = async (userID) => {
    return await Task.find({ owner: userID });
};

const getTasksAssignedToUserQuery = async (userID) => {
    return await Task.find({ assignedTo: userID });
};

const updateTaskQuery = async (taskID, updateData) => {
    return await Task.findByIdAndUpdate(taskID, updateData, { new: true });
};

const deleteTaskQuery = async (taskID) => {
    return await Task.findByIdAndDelete(taskID);
};

const addReactionToTaskQuery = async (taskID, emoji) => {
    return await Task.findByIdAndUpdate(
        taskID,
        { $push: { reactions: emoji } },
        { new: true }
    );
};

const getMyTasksQuery = async (userID, filters = {}) => {
    const query = {
        $or: [
            { owner: userID },
            { assignedTo: userID }
        ]
    };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.dueDate) query.dueDate = { $lte: new Date(filters.dueDate) };

    return await Task.find(query).populate("owner assignedTo", "email username");
};

module.exports = {
    createTaskQuery,
    getTaskByIdQuery,
    getAllTasksQuery,
    getUserTasksQuery,
    getTasksAssignedToUserQuery,
    updateTaskQuery,
    deleteTaskQuery,
    addReactionToTaskQuery,
    getMyTasksQuery,
};
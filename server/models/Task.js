// server/models/Task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
    },
    description: {
      type: String,
    },
    assignedTo: {
      type: String, // You can use user IDs or names, up to the team
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    tags: {
      type: [String],
    },
    dueDate: {
      type: Date,
    },
    reactions: {
      type: [String], // Array of emojis
      default: [],
    },
    comments: [
      {
        body: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
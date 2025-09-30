// server/models/Task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    owner: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //references User
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
    },
    description: {
      type: String,
    },
    assignedTo: { // personally, i do not want to make this unique bc what if u want a to-do list for urself? :D
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //will reference User Schema
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
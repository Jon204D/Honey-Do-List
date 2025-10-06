// queries/userQueries.js

const User = require("../models/User");

const findUserByEmailQuery = async (email) => {
  return await User.findOne({ email });
};

const createUserQuery = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

const updateUserQuery = async (userID, updateData) => {
  return await User.findByIdAndUpdate(userID, updateData, { new: true });
};

const deleteUserQuery = async (userID) => {
  return await User.findByIdAndDelete(userID);
};

const getAllUsersQuery = async () => {
  return await User.find();
};

const getUserByIdQuery = async (userID) => {
  return await User.findById(userID);
};

const updatePasswordQuery = async (userID, newPass) => {
  return await User.findByIdAndUpdate(userID, { password: newPass }, { new: true });
};

module.exports = {
  findUserByEmailQuery,
  createUserQuery,
  updateUserQuery,
  deleteUserQuery,
  getAllUsersQuery,
  getUserByIdQuery,
  updatePasswordQuery,
};

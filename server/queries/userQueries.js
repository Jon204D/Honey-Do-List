// commonQueries/userQueries.js

const bcrypt = require("bcryptjs");
const User = require("../models/User");

const findUserByEmailQuery = async (email) => {
    return await User.findOne({ email });
};

// Alias for backwards compatibility
const findUserByEmail = findUserByEmailQuery;

const createUser = async (userData) => {
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

const getUserById = async (userID) => {
  return await User.findById(userID);
};

const updatePasswordQuery = async (userID, newPass) => {
    return await User.findByIdAndUpdate(userID, { password: newPass }, { new: true });
};

const comparePassword = async (inputPassword, hashedPassword) => {
    return await bcrypt.compare(inputPassword, hashedPassword);
};

module.exports = {
    findUserByEmailQuery,
    createUser,
    updateUserQuery,
    deleteUserQuery,
    getAllUsersQuery,
    getUserById,
    updatePasswordQuery,
    comparePassword,
};
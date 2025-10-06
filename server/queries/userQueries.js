// commonQueries/userQueries.js

const User = require("../models/User");

const findUserByEmail = async (email) => {
    return await User.findOne({ email });
};

const createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

const updateUser = async (userID, updateData) => {
    return await User.findByIDAndUpdate(userID, updateData, { new: true });
};

const deleteUser = async (userID) => {
    return await User.findByIDAndDelete(userID);
};

const getAllUsers = async () => {
  return await User.find();
};

const updatePassword = async (userID, newPass) => {
    return await User.findByIDAndUpdate(userID, {password: newPass}, {new: true});
};

module.exports = {
    findUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
    updatePassword,
};
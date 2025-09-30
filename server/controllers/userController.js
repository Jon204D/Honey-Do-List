// controllers/userController.js

const userQueries = require("../queries/userQueries");

const registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await userQueries.findUserByEmailQuery(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    const newUser = await userQueries.createUser({ email, username, password });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userQueries.getAllUsersQuery();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get singular user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userQueries.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// updating da user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userQueries.updateUserQuery(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// deleting da user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userQueries.deleteUserQuery(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const updatedUser = await userQueries.updatePasswordQuery(id, newPassword);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Password updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    registerUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    changePassword,
};
// controllers/userController.js

const bcrypt = require("bcryptjs");
const userQueries = require("../queries/userQueries");
const emailTemplate = require("../config/emailTemplate");

const registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await userQueries.findUserByEmailQuery(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    // FIXED: Remove manual hashing - let the User model's pre-save hook handle it
    const newUser = await userQueries.createUser({ email, username, password });

    // Send verification email
    if (emailTemplate.sendVerification(newUser.email, newUser.username)) {
      // Email sent successfully
      // Don't return the password in the response
      return res.status(201).json({
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userQueries.getAllUsersQuery();
    // Don't return passwords
    const safeUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    }));
    res.status(200).json(safeUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userQueries.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow password updates through this endpoint
    if (req.body.password) {
      return res.status(400).json({ message: "Use /password endpoint to change password" });
    }
    
    const updatedUser = await userQueries.updateUserQuery(id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      id: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Get the user
    const user = await userQueries.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update with new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userQueries.findUserByEmailQuery(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    
    const user = await userQueries.findUserByEmailQuery(email);
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({ 
        message: "If that email exists, password reset instructions have been sent" 
      });
    }

    // Send recovery email
    if (emailTemplate.sendRecoveryVerification(user.email, user.username)) {
      // TODO: Implement actual email sending with reset token
      return res.status(200).json({ 
        message: "Password reset instructions sent to email (mock response)" 
      });
    }
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
  loginUser,
  forgotPassword,
};
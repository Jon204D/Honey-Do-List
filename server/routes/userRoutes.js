// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  loginUser,
  forgotPassword,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.put("/:id/password", changePassword);
router.delete("/:id", deleteUser);

module.exports = router;
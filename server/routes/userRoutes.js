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
} = require("../controllers/userController");

router.post("/register", registerUser);
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.put("/:id/password", changePassword);
router.delete("/:id", deleteUser);


module.exports = router;
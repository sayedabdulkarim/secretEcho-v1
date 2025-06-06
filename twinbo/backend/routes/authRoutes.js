const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  register,
  login,
  logout,
  getProfile,
} = require("../controllers/authController");

// @route   POST /api/auth/register
router.post("/register", register);

// @route   POST /api/auth/login
router.post("/login", login);

// @route   POST /api/auth/logout
router.post("/logout", authenticate, logout);

// @route   GET /api/auth/profile
router.get("/profile", authenticate, getProfile);

module.exports = router;

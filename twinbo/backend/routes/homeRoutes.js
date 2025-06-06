const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

// @desc    Protected home route for testing
// @route   GET /api/home
// @access  Private
router.get("/", authenticate, (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the protected home route!",
    data: {
      user: req.user.username,
      timestamp: new Date().toISOString(),
      message: "This is a dummy response for testing authentication",
    },
  });
});

module.exports = router;

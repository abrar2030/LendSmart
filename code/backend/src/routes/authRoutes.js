const express = require("express");
const router = express.Router();
const { protect, optionalProtect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/security/rateLimiter");
const authController = require("../controllers/authController");

// Public routes
router.post("/register", authLimiter, (req, res) =>
  authController.register(req, res),
);
router.post("/login", authLimiter, (req, res) =>
  authController.login(req, res),
);
router.post("/logout", optionalProtect, (req, res) =>
  authController.logout(req, res),
);
// Canonical endpoint (matches docs/API.md and both web + mobile clients).
router.post("/refresh", (req, res) => authController.refreshToken(req, res));
// Kept for backward compatibility with existing tests/integrations.
router.post("/refresh-token", (req, res) =>
  authController.refreshToken(req, res),
);

// Protected routes
router.get("/me", protect, (req, res) => authController.getProfile(req, res));
router.put("/updatedetails", protect, (req, res) =>
  authController.updateDetails(req, res),
);
router.put("/updatepassword", protect, (req, res) =>
  authController.updatePassword(req, res),
);
router.post("/setup-mfa", protect, (req, res) =>
  authController.setupMFA(req, res),
);
router.post("/verify-mfa", protect, (req, res) =>
  authController.verifyMFA(req, res),
);

module.exports = router;

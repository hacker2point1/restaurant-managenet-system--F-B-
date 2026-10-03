const express = require('express')
const AdminAuth = require('../../middleware/adminAuth')
// const authController = require('../../controllers/user/authController')
const router = express.Router()
const Auth = require('../../middleware/auth')
const authorize = require('../../middleware/authorize')
const upload = require('../../middleware/upload')
const authController = require('../../controller/auth/auth.controller')

//register
router.post(
  "/register",
  upload.cleanupLocalFiles,
  upload.single("profileImage"),
  authController.register
);

// Email verification
router.post(
  "/verify-otp",
  authController.verifyOtp
);

// Login
router.post(
  "/login",
  authController.login
);

// Refresh access token
router.post(
  "/refresh-token",
  authController.refreshToken
);



// Logout
router.post(
  "/logout",
  Auth,
  authController.logout
);

// Get profile
router.get(
  "/profile",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  authController.getProfile
);

// Update profile
router.put(
  "/profile-update",
  Auth,
  authorize("admin", "manager", "staff", "customer"),
  upload.cleanupLocalFiles,
  upload.single("profileImage"),
  authController.updateProfile
);

module.exports = router
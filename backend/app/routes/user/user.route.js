const express = require("express");

const router = express.Router();

const Auth = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const userController = require("../../controller/user/user.controller");

//create user
router.post("/",
  Auth,
  authorize("admin","manager"), 
  userController.createUser);

// Get all users
router.get(
  "/",
  Auth,
  authorize("admin", "manager"),
  userController.getAllUsers
);

// Get single user
router.get(
  "/:id",
  Auth,
  authorize("admin", "manager"),
  userController.getUserById
);

// Update user
router.patch(
  "/:id",
  Auth,
  authorize("admin", "manager"),
  userController.updateUser
);

// Delete user
router.delete(
  "/:id",
  Auth,
  authorize("admin", "manager"),
  userController.deleteUser
);

// Activate user
router.patch(
  "/:id/activate",
  Auth,
  authorize("admin", "manager"),
  userController.activateUser
);

// Deactivate user
router.patch(
  "/:id/deactivate",
  Auth,
  authorize("admin", "manager"),
  userController.deactivateUser
);

// Change user role
router.patch(
  "/:id/role",
  Auth,
  authorize("admin"),
  userController.changeUserRole
);


module.exports = router;

const User = require("../../models/users.model");
const StatusCode = require("../../utils/statusCode");

class UserController {

  // ============================================================
  // GET ALL USERS
  
  // ============================================================

  async getAllUsers(req, res) {
    try {
      const users = await User.find()
        .select(
          "-password -refreshToken -passwordResetToken -passwordResetExpires"
        )
        .sort({ createdAt: -1 });

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Users fetched successfully",
        count: users.length,
        data: users,
      });

    } catch (error) {
      console.error("Get All Users Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // ============================================================
  // GET USER BY ID
  
  // ============================================================

  async getUserById(req, res) {
    try {
      const { id } = req.params;

      // Validate MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      const user = await User.findById(id).select(
        "-password -refreshToken -passwordResetToken -passwordResetExpires"
      );

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "User fetched successfully",
        data: user,
      });

    } catch (error) {
      console.error("Get User By ID Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // ============================================================
  // UPDATE USER

  // ============================================================

  async updateUser(req, res) {
    try {
      const { id } = req.params;

      // Validate MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      // Find user
      const user = await User.findById(id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      // Prevent admin from updating their own account
      if (req.user.id === id) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message:
            "You cannot update your own account through user management",
        });
      }

      const {
        name,
        email,
        phone,
      } = req.body;

      // ----------------------------------------------------------
      // Update Name
      // ----------------------------------------------------------

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Name cannot be empty",
          });
        }

        user.name = name.trim();
      }

      // ----------------------------------------------------------
      // Update Email
      // ----------------------------------------------------------

      if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();

        const existingEmail = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: id },
        });

        if (existingEmail) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Email already exists",
          });
        }

        user.email = normalizedEmail;

        // Email needs verification again
        user.isVerified = false;
      }

      // ----------------------------------------------------------
      // Update Phone
      // ----------------------------------------------------------

      if (phone !== undefined) {
        const normalizedPhone = phone.trim();

        if (normalizedPhone) {
          const existingPhone = await User.findOne({
            phone: normalizedPhone,
            _id: { $ne: id },
          });

          if (existingPhone) {
            return res.status(StatusCode.BAD_REQUEST).json({
              status: false,
              message: "Phone number already exists",
            });
          }

          user.phone = normalizedPhone;
        } else {
          user.phone = undefined;
        }
      }

      await user.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "User updated successfully",

        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });

    } catch (error) {
      console.error("Update User Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // ============================================================
  // DELETE USER
 
  // ============================================================

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Validate MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      // Prevent admin from deleting their own account
      if (req.user.id === id) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "You cannot delete your own account",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      await User.findByIdAndDelete(id);

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "User deleted successfully",
      });

    } catch (error) {
      console.error("Delete User Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // ============================================================
  // ACTIVATE USER

  // ============================================================

  async activateUser(req, res) {
    try {
      const { id } = req.params;

      // Validate MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      user.isActive = true;

      await user.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "User activated successfully",

        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });

    } catch (error) {
      console.error("Activate User Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // ============================================================
  // DEACTIVATE USER

  // ============================================================

  async deactivateUser(req, res) {
    try {
      const { id } = req.params;

      // Validate MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      // Prevent admin from deactivating their own account
      if (req.user.id === id) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "You cannot deactivate your own account",
        });
      }

      const user = await User.findById(id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      user.isActive = false;

      await user.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "User deactivated successfully",

        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });

    } catch (error) {
      console.error("Deactivate User Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }


  // ============================================================
  // CHANGE USER ROLE

  // ============================================================

  async changeUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate MongoDB ObjectId
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid user ID",
        });
      }

      // ----------------------------------------------------------
      // Validate Role
      // ----------------------------------------------------------

      const allowedRoles = [
        "manager",
        "staff",
        "customer",
      ];

      if (!role || !allowedRoles.includes(role)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message:
            "Invalid role. Allowed roles are manager, staff and customer",
        });
      }

      // ----------------------------------------------------------
      // Prevent changing own role
      // ----------------------------------------------------------

      if (req.user.id === id) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "You cannot change your own role",
        });
      }

      // ----------------------------------------------------------
      // Find User
      // ----------------------------------------------------------

      const user = await User.findById(id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      // ----------------------------------------------------------
      // Prevent changing the seeded admin's role
      // ----------------------------------------------------------

      if (user.role === "admin") {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "Admin role cannot be changed",
        });
      }

      // ----------------------------------------------------------
      // Update Role
      // ----------------------------------------------------------

      user.role = role;

      await user.save();

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "User role updated successfully",

        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });

    } catch (error) {
      console.error("Change User Role Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }
}

module.exports = new UserController();


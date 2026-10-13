
const User = require("../../models/users.model");
const StatusCode = require("../../utils/statusCode");
const bcryptjs = require('bcryptjs')

class UserController {


  //CREATE A USER

  async createUser(req, res) {
    try {
      const {
        name,
        email,
        phone,
        password,
        role,
        isActive,
        isVerified,
      } = req.body;

      // ==========================================
      // VALIDATION
      // ==========================================

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email and password are required",
        });
      }

      // ==========================================
      // CHECK EXISTING EMAIL
      // ==========================================

      const existingEmail = await User.findOne({
        email: email.toLowerCase().trim(),
      });

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // ==========================================
      // CHECK EXISTING PHONE
      // ==========================================

      if (phone) {
        const existingPhone = await User.findOne({
          phone: phone.trim(),
        });

        if (existingPhone) {
          return res.status(409).json({
            success: false,
            message: "User with this phone number already exists",
          });
        }
      }

      // ==========================================
      // HASH PASSWORD
      // ==========================================

      const hashedPassword = await bcryptjs.hash(password, 12);

      // ==========================================
      // CREATE USER
      // ==========================================

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : undefined,
        password: hashedPassword,
        role: role || "customer",
        isActive: isActive !== undefined ? isActive : true,
        isVerified: isVerified !== undefined ? isVerified : false,
      });

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user: {
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
        },
      });
    } catch (error) {
      console.error("Create User Error:", error);

      // Handle duplicate key error
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {})[0];

        return res.status(409).json({
          success: false,
          message: `${duplicateField || "Field"} already exists`,
        });
      }

      // Handle mongoose validation error
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ============================================================
  // GET ALL USERS
  
  // ============================================================

async getAllUsers(req, res) {
  try {
    // ============================================================
    // QUERY PARAMETERS
    // ============================================================

    const {
      page = 1,
      limit = 10,
      search = "",
      role,
      status,
    } = req.query;

    // ============================================================
    // PAGINATION
    // ============================================================

    const currentPage = Math.max(
      Number(page) || 1,
      1
    );

    const pageLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      100
    );

    const skip =
      (currentPage - 1) * pageLimit;

    // ============================================================
    // FILTER
    // ============================================================

    const filter = {};

    // ============================================================
    // SEARCH
    // ============================================================

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        {
          name: searchRegex,
        },
        {
          email: searchRegex,
        },
        {
          phone: searchRegex,
        },
      ];
    }

    // ============================================================
    // ROLE FILTER
    // ============================================================

    if (
      role &&
      ["admin", "manager", "staff", "customer"].includes(role)
    ) {
      filter.role = role;
    }

    // ============================================================
    // STATUS FILTER
    // ============================================================

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    // ============================================================
    // GET USERS + TOTAL COUNT
    // ============================================================

    const [users, totalUsers] =
      await Promise.all([
        User.find(filter)
          .select(
            "-password -refreshToken -passwordResetToken -passwordResetExpires"
          )
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(pageLimit),

        User.countDocuments(filter),
      ]);

    // ============================================================
    // PAGINATION INFORMATION
    // ============================================================

    const totalPages =
      Math.ceil(
        totalUsers / pageLimit
      );

    const hasNextPage =
      currentPage < totalPages;

    const hasPreviousPage =
      currentPage > 1;

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(
      StatusCode.SUCCESS
    ).json({
      status: true,

      message:
        "Users fetched successfully",

      count: users.length,

      data: users,

      pagination: {
        currentPage,

        limit: pageLimit,

        totalUsers,

        totalPages,

        hasNextPage,

        hasPreviousPage,
      },
    });

  } catch (error) {

    console.error(
      "Get All Users Error:",
      error
    );

    return res.status(
      StatusCode.SERVER_ERROR
    ).json({
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


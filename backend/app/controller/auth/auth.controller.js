const fs = require("fs");
const bcryptjs = require("bcryptjs");
const User = require("../../models/users.model");
const RefreshToken = require("../../models/refreshToken.model");
const jwt = require("jsonwebtoken");
const cloudinary = require('../../config/cloudinary')

const generateAccessToken = require("../../utils/token/generateAccessToken");
const generateRefreshToken = require("../../utils/token/generateRefreshToken");
const getTokenMaxAge = (expiresIn) => {
  if (!expiresIn) return 60 * 1000;

  const match = expiresIn.match(/^(\d+)([smhd])$/i);

  if (!match) return 60 * 1000;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
};
const mongoose = require("mongoose");
const crypto = require("crypto");
const {
  accessCookieOptions,
  refreshCookieOptions,
} = require("../../utils/cookie/cookieOptions");
const StatusCode = require("../../utils/statusCode");
const sendEmail = require("../../utils/email/sendEmail");
const otpModel = require("../../models/otp.model");



class authController {

  // ============================================================
  // REGISTER
  // ============================================================


  async register(req, res) {
    try {
      const {
        name,
        email,
        phone,
        password,
        confirm_password,
        role,
      } = req.body;


      if (
        !name ||
        !email ||
        !password ||
        !confirm_password ||
        !role
      ) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "name, email, password, confirm_password, role are required",
        });
      }

      //Roles - validation
      const allowedRoles = ["customer", "staff", "manager"];
      if (!allowedRoles.includes(role)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid role. Allowed roles are customer, staff and manager",
        });
      }

      //password, confirm_password matchs
      if (password !== confirm_password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Password and Confirm Password do not match",
        });
      }


      //password validation for 6 charecters
      if (password.length < 6) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false, message: "Password must be at least 6 characters",
        });
      }


      //name charecter validation

      if (name.trim().length < 2) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Name must contain at least 2 characters",
        });
      }



      //existing user validation
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });
      if (existingUser) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Email already exists",
        });
      }

      //existing phone number validation
      const normalizedPhone = phone?.trim();
      if (normalizedPhone) {
        const existingPhone = await User.findOne({
          phone: normalizedPhone,
        });
        if (existingPhone) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Phone number already exists",
          });
        }
      }

      //profile image upload

      let profileImage = {
        url: "",
        publicId: "",
      };

      if (req.file) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "users/profile-images",
          });

          profileImage = {
            url: result.secure_url,
            publicId: result.public_id,
          };
        } finally {
          if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      }



      //hashed password
      const salt = await bcryptjs.genSalt(10);

      const hashedPassword = await bcryptjs.hash(password, salt);



      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone || undefined,
        password: hashedPassword,
        profileImage,
        role,
        isActive: true,
        isVerified: false,
      });



      await sendEmail(req, user);

      return res.status(StatusCode.CREATED).json({
        status: true,
        message:
          "Registration successful. OTP has been sent to your email for verification.",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: user.password,
          role: user.role,
          profileImage: user.profileImage,
          isVerified: user.isVerified,
        },
      });

    } catch (error) {

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error(error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });

    }
  }

  // ============================================================
  // VERIFY-OTP
  // ============================================================

  async verifyOtp(req, res) {
    try {
      const { email, otp } = req.body;



      if (!email || !otp) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Email and OTP are required",
        });
      }



      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      });

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }



      if (user.isVerified) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Email is already verified",
        });
      }


      const otpData = await otpModel.findOne({
        userId: user._id,
        otp,
      });

      if (!otpData) {
        await sendEmail(req, user);

        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid OTP. A new OTP has been sent to your email.",
        });
      }



      const expiryTime = new Date(
        otpData.createdAt.getTime() + 15 * 60 * 1000
      );

      if (new Date() > expiryTime) {
        await otpModel.deleteMany({
          userId: user._id,
        });

        await sendEmail(req, user);

        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "OTP expired. A new OTP has been sent.",
        });
      }


      user.isVerified = true;
      await user.save();



      await otpModel.deleteMany({
        userId: user._id,
      });


      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Verify OTP Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }



  // ============================================================
  // LOGIN
  // ============================================================

  async login(req, res) {
    try {
      const { email, password } = req.body;



      if (!email || !password) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Email and password are required",
        });
      }



      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select("+password");

      if (!user) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid email or password",
        });
      }



      if (!user.isVerified) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Please verify your email before logging in",
        });
      }

      if (!user.isActive) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "Your account has been deactivated",
        });
      }

      if (user.isDeleted) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "This account no longer exists",
        });
      }


      const isPasswordMatched = await bcryptjs.compare(
        password,
        user.password
      );

      if (!isPasswordMatched) {
        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: "Invalid email or password",
        });
      }



      user.lastLogin = new Date();
      await user.save();


      const accessToken = generateAccessToken(user);

      const refreshToken = generateRefreshToken(user);

      const hashedRefreshToken = await bcryptjs.hash(refreshToken, 12);

      const refreshTokenExpiresAt = new Date(
        Date.now() +
        getTokenMaxAge(process.env.REFRESH_TOKEN_EXPIRES_IN)
      );



      await RefreshToken.deleteMany({
        user: user._id,
      });


      await RefreshToken.create({
        user: user._id,
        refreshToken: hashedRefreshToken,
        expiresAt: refreshTokenExpiresAt,
        revoked: false,
      });



      res.clearCookie("accessToken", accessCookieOptions);
      res.clearCookie("refreshToken", refreshCookieOptions);

      res.cookie(
        "accessToken",
        accessToken,
        accessCookieOptions
      );

      res.cookie(
        "refreshToken",
        refreshToken,
        refreshCookieOptions
      );



      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Login successful",
        accessToken,
        // refreshToken,
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role,
          profileImage: user.profileImage,
          bio: user.bio,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }



  // ============================================================
  // REFRESH TOKEN
  // ============================================================

  async refreshToken(req, res) {
    try {

      //get refreh token from the cookie

      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          status: false,
          message: "Refresh token not found",
        });
      }



      let decoded;

      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
      } catch (error) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          status: false,
          message: "Invalid or expired refresh token",
        });
      }



      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }



      const storedToken = await RefreshToken.findOne({
        user: user._id,
        revoked: false,
      });

      if (!storedToken) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          status: false,
          message: "Refresh token not found",
        });
      }


      const matched = await bcryptjs.compare(
        refreshToken,
        storedToken.refreshToken
      );

      if (!matched) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          status: false,
          message: "Invalid refresh token",
        });
      }



      if (storedToken.expiresAt < new Date()) {

        await storedToken.deleteOne();

        return res.status(StatusCode.UNAUTHORIZED).json({
          status: false,
          message: "Refresh token expired",
        });
      }

      //generate the refresh-token

      const newAccessToken = generateAccessToken(user);

      const newRefreshToken = generateRefreshToken(user);

      const hashedRefreshToken = await bcryptjs.hash(
        newRefreshToken,
        12
      );

      storedToken.refreshToken = hashedRefreshToken;

      storedToken.expiresAt = new Date(
        Date.now() +
        getTokenMaxAge(process.env.REFRESH_TOKEN_EXPIRES_IN)
      );

      storedToken.revoked = false;

      await storedToken.save();



      res.cookie(
        "accessToken",
        newAccessToken,
        accessCookieOptions
      );

      res.cookie(
        "refreshToken",
        newRefreshToken,
        refreshCookieOptions
      );



      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
      });

    } catch (error) {

      console.error("Refresh Token Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });

    }
  }


  // ============================================================
  // LOGOUT
  // ============================================================

  async logout(req, res) {
    try {


      const userId = req.user.id;



      await RefreshToken.deleteMany({
        user: userId,
      });



      res.clearCookie("accessToken", accessCookieOptions);

      res.clearCookie("refreshToken", refreshCookieOptions);



      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Logout successful",
      });

    } catch (error) {

      console.error("Logout Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });

    }
  }



  // ============================================================
  // GET PROFILE
  // ============================================================

  async getProfile(req, res) {
    try {

      const user = await User.findById(req.user.id)
        .select("-password -confirm_password");

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }

      if (!['admin', 'manager', 'staff', 'customer'].includes(user.role)) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "You do not have permission to access this profile",
        });
      }

      return res.status(StatusCode.SUCCESS).json({
        status: true,
        data: user,
      });

    } catch (error) {

      console.log(error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });

    }
  }



  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  async updateProfile(req, res) {
    try {

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(StatusCode.NOT_FOUND).json({
          status: false,
          message: "User not found",
        });
      }



      if (!["admin", "manager", "staff", "customer"].includes(user.role)) {
        return res.status(StatusCode.FORBIDDEN).json({
          status: false,
          message: "You do not have permission to update this profile",
        });
      }



      if (req.body.name !== undefined) {
        const name = req.body.name.trim();

        if (name.length < 2 || name.length > 100) {
          return res.status(StatusCode.BAD_REQUEST).json({
            status: false,
            message: "Name must be between 2 and 100 characters",
          });
        }

        user.name = name;
      }



      if (req.body.phone !== undefined) {
        const phone = req.body.phone.trim();

        // Allow empty phone
        if (phone !== "") {
          const existingPhone = await User.findOne({
            phone: phone,
            _id: { $ne: user._id },
          });

          if (existingPhone) {
            return res.status(StatusCode.BAD_REQUEST).json({
              status: false,
              message: "Phone number already exists",
            });
          }
        }

        user.phone = phone;
      }



      if (req.file) {
        try {
          // Delete old image from Cloudinary
          if (user.profileImage?.publicId) {
            await cloudinary.uploader.destroy(
              user.profileImage.publicId
            );
          }

          // Upload new image
          const result = await cloudinary.uploader.upload(
            req.file.path,
            {
              folder: "users/profile-images-restaurant-v1",
            }
          );

          // Save new image information
          user.profileImage = {
            url: result.secure_url,
            publicId: result.public_id,
          };
        } finally {
          // Delete temporary local file
          if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        }
      }



      await user.save();



      return res.status(StatusCode.SUCCESS).json({
        status: true,
        message: "Profile updated successfully",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      // ==========================================
      // Delete uploaded file if error occurs
      // ==========================================

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }



      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {})[0];

        return res.status(StatusCode.BAD_REQUEST).json({
          status: false,
          message: `${duplicateField || "Field"} already exists`,
        });
      }

      console.error("Update Profile Error:", error);

      return res.status(StatusCode.SERVER_ERROR).json({
        status: false,
        message: error.message,
      });
    }
  }

}


module.exports = new authController()
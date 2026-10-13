
"use client";

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "@/api/axios/axios";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints/endpoints";

/* =========================================================
   TYPES
========================================================= */

export type ProfileImage = {
  url?: string;
  publicId?: string;
};

export type AuthUser = {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "manager" | "staff" | "customer";
  profileImage?: ProfileImage | string | null;
  bio?: string;
  isVerified?: boolean;
  isActive?: boolean;
  [key: string]: unknown;
};

export type AuthResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

export type LoginResponse = AuthResponse<AuthUser> & {
  accessToken?: string;
};

export type RegistrationPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
  role: "customer" | "staff" | "manager";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordPayload = {
  userId: string;
  token: string;
  password: string;
  confirm_password: string;
};

export type AuthState = {
  userId: string | null;
  email: string | null;
  name: string | null;
  profileImage: ProfileImage | string | null;
  user: AuthUser | null;
  token: string | null;
  isloggedIn: boolean;
  sessionChecked: boolean;
  loading: boolean;
};

const initialState: AuthState = {
  userId: null,
  email: null,
  name: null,
  profileImage: null,
  user: null,
  token: null,
  isloggedIn: false,
  sessionChecked: false,
  loading: false,
};

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}

function getUserName(user: AuthUser): string | null {
  return (
    user.name ||
    user.username ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    null
  );
}

function setAuthenticatedUser(
  state: AuthState,
  user: AuthUser,
  token?: string
) {
  state.user = user;
  state.userId = user._id || user.id || null;
  state.name = getUserName(user);
  state.email = user.email || null;
  state.profileImage = user.profileImage || null;
  state.isloggedIn = true;
  state.sessionChecked = true;

  if (token !== undefined) {
    state.token = token;
  }
}

function clearAuthState(state: AuthState) {
  state.userId = null;
  state.email = null;
  state.name = null;
  state.profileImage = null;
  state.user = null;
  state.token = null;
  state.isloggedIn = false;
  state.sessionChecked = true;
  state.loading = false;
}

/* =========================================================
   REGISTER
   POST /api/v1/auth/register
========================================================= */

export const authRegistration = createAsyncThunk<
  AuthResponse<AuthUser>,
  RegistrationPayload,
  { rejectValue: string }
>(
  "auth/register",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        endpoints.auth.signUp,
        payload
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Registration failed")
      );
    }
  }
);

/* =========================================================
   LOGIN
   POST /api/v1/auth/login
========================================================= */

export const authLogin = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>(
  "auth/login",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        endpoints.auth.signIn,
        payload
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Login failed")
      );
    }
  }
);

/* =========================================================
   VERIFY OTP
   POST /api/v1/auth/verify-otp
========================================================= */

export const verifyOtp = createAsyncThunk<
  AuthResponse,
  VerifyOtpPayload,
  { rejectValue: string }
>(
  "auth/verifyOtp",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        endpoints.auth.verifyOtp,
        payload
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "OTP verification failed")
      );
    }
  }
);

/* =========================================================
   SEND PASSWORD RESET EMAIL
========================================================= */

export const resetEmail = createAsyncThunk<
  AuthResponse,
  Record<string, unknown>,
  { rejectValue: string }
>(
  "auth/resetEmail",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        endpoints.auth.resetEmail,
        payload
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Failed to send reset link")
      );
    }
  }
);

/* =========================================================
   RESET PASSWORD USING LINK
   Preserves your original API payload format.
========================================================= */

export const resetLink = createAsyncThunk<
  AuthResponse,
  {
    userId: string;
    token: string;
    newPassword: string;
  },
  { rejectValue: string }
>(
  "auth/resetLink",
  async ({ userId, token, newPassword }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `${endpoints.auth.resetLink}/${userId}/${token}`,
        newPassword
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Password reset failed")
      );
    }
  }
);

/* =========================================================
   UPDATE PASSWORD
========================================================= */

export const updatePassword = createAsyncThunk<
  AuthResponse,
  Record<string, unknown>,
  { rejectValue: string }
>(
  "auth/updatePassword",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        endpoints.auth.updatePassword,
        payload
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Password update failed")
      );
    }
  }
);

/* =========================================================
   GET PROFILE / RESTORE SESSION
   GET /api/v1/auth/profile
========================================================= */

export const getProfile = createAsyncThunk<
  AuthResponse<AuthUser>,
  void,
  { rejectValue: string }
>(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        endpoints.auth.profile
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Failed to fetch profile")
      );
    }
  }
);

/* =========================================================
   UPDATE PROFILE
   PUT /api/v1/auth/profile-update

   Accepts FormData when uploading profileImage.
========================================================= */

export const updateProfile = createAsyncThunk<
  AuthResponse<AuthUser>,
  FormData,
  { rejectValue: string }
>(
  "auth/updateProfile",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        endpoints.auth.updateProfile,
        payload
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Profile update failed")
      );
    }
  }
);

/* =========================================================
   LOGOUT
   POST /api/v1/auth/logout
========================================================= */

export const authLogout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  "auth/logoutRequest",
  async (_, thunkAPI) => {
    try {
      await axiosInstance.post(endpoints.auth.logout);
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Logout request failed")
      );
    }
  }
);

/* =========================================================
   RESET PASSWORD
   Preserves your original resetPassword API format.
========================================================= */

export const resetPassword = createAsyncThunk<
  AuthResponse,
  ResetPasswordPayload,
  { rejectValue: string }
>(
  "auth/resetPassword",
  async (
    {
      userId,
      token,
      password,
      confirm_password,
    },
    thunkAPI
  ) => {
    try {
      const response = await axiosInstance.post(
        `${endpoints.auth.resetLink}/${userId}/${token}`,
        {
          password,
          confirm_password,
        }
      );

      return response.data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        getErrorMessage(error, "Reset password failed")
      );
    }
  }
);

/* =========================================================
   AUTH SLICE
========================================================= */

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Use after a successful backend logout or for local reset.
    logout: (state) => {
      clearAuthState(state);
    },

    // Synchronize the current user when needed.
    setCurrentUser: (
      state,
      action: PayloadAction<AuthUser>
    ) => {
      setAuthenticatedUser(state, action.payload);
    },

    // Clear authentication state without making an API request.
    clearAuth: (state) => {
      clearAuthState(state);
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------------- LOGIN ---------------- */

      .addCase(authLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(authLogin.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.status && payload.data) {
          setAuthenticatedUser(
            state,
            payload.data,
            payload.accessToken
          );
        }
      })
      .addCase(authLogin.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          toast.error(action.payload);
        }
      })

      /* ---------------- REGISTRATION ---------------- */

      .addCase(authRegistration.pending, (state) => {
        state.loading = true;
      })
      .addCase(authRegistration.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(authRegistration.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          toast.error(action.payload);
        }
      })

      /* ---------------- OTP ---------------- */

      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          toast.error(action.payload);
        }
      })

      /* ---------------- PROFILE / SESSION RESTORATION ---------------- */

      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.status && payload.data) {
          setAuthenticatedUser(state, payload.data);
        } else {
          state.sessionChecked = true;
        }
      })
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;

        // A missing/expired session is expected for logged-out visitors.
        // Do not show an error toast on public pages.
        clearAuthState(state);
      })

      /* ---------------- UPDATE PROFILE ---------------- */

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.status && payload.data) {
          setAuthenticatedUser(state, payload.data);
          toast.success(
            payload.message || "Profile updated successfully"
          );
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          toast.error(action.payload);
        }
      })

      /* ---------------- LOGOUT ---------------- */

      .addCase(authLogout.pending, (state) => {
        state.loading = true;
      })
      .addCase(authLogout.fulfilled, (state) => {
        clearAuthState(state);
        toast.success("Logout successful");
      })
      .addCase(authLogout.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          toast.error(action.payload);
        }
      })

      /* ---------------- RESET EMAIL ---------------- */

      .addCase(resetEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetEmail.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.status) {
          toast.success(
            payload.message || "Reset link sent to your email"
          );
        } else {
          toast.error(payload.message || "Failed to send reset link");
        }
      })
      .addCase(resetEmail.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Failed to send reset link");
      })

      /* ---------------- RESET LINK ---------------- */

      .addCase(resetLink.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetLink.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.status) {
          toast.success(
            payload.message || "Password reset successful"
          );
        } else {
          toast.error(payload.message || "Password reset failed");
        }
      })
      .addCase(resetLink.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Password reset failed");
      })

      /* ---------------- UPDATE PASSWORD ---------------- */

      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePassword.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.status) {
          toast.success(
            payload.message || "Password updated successfully"
          );
        } else {
          toast.error(payload.message || "Password update failed");
        }
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Password update failed");
      })

      /* ---------------- RESET PASSWORD ---------------- */

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state, { payload }) => {
        state.loading = false;

        if (payload.status) {
          toast.success(
            payload.message || "Password reset successful"
          );
        } else {
          toast.error(payload.message || "Password reset failed");
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || "Reset password failed");
      });
  },
});

export const { logout, setCurrentUser, clearAuth } =
  authSlice.actions;

export default authSlice.reducer;

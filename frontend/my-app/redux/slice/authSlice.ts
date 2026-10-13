
"use client"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "@/api/axios/axios";
import { toast } from "sonner";

import { Cookies } from "react-cookie";
import { endpoints } from "@/api/endpoints/endpoints";


const initialState = {
  userId: null,
  email: null,
  name: null,
  profileImage: null,
  user: null,
  token: null,
  isloggedIn: false,
  loading: false
};

type AuthResponse = {
  status: boolean;
  message: string;
  data?: unknown;
};

type LoginResponse = AuthResponse & {
  accessToken?: string;
};

type RegistrationPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
  role: "customer" | "staff" | "manager";
};

let cookie = new Cookies()
// /signUp/
export const authRegistration = createAsyncThunk<
  AuthResponse,
  RegistrationPayload,
  { rejectValue: string }
>(
  "authRegistration",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.post(endpoints.auth.signUp, payload);
      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      return thunkAPI.rejectWithValue(message || "Registration failed");
    }
  }
);

// /SignIn/
export const authLogin = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>(
  "authLogin",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        endpoints.auth.signIn,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      return thunkAPI.rejectWithValue(message || "Login failed");
    }
  }
);

// /verifyOtp/
export const verifyOtp = createAsyncThunk<
  AuthResponse,
  { email: string; otp: string },
  { rejectValue: string }
>(
  "verifyOtp",
  async (payload, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        endpoints.auth.otp,
        payload
      );
      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      return thunkAPI.rejectWithValue(
        message || "OTP verification failed"
      );
    }
  }
);

// /reset email/
export const resetEmail = createAsyncThunk(
  "resetEmail",
  async (payload) => {
    const response = await axiosInstance.post(
      endpoints.auth.resetEmail, 
      payload
    );
    return response.data;
  }
);
//  /reset link/
export const resetLink = createAsyncThunk(
  "resetLink",
  async ({ userId, token, newPassword }) => {
    const response = await axiosInstance.post(
      `${endpoints.auth.resetLink}/${userId}/${token}`,
      newPassword
    );
    return response.data;
  }
);
// /update password/
export const updatePassword = createAsyncThunk(
  "updatePassword",
  async (payload) => {
    const response = await axiosInstance.put(
      endpoints.auth.updatePassword,
      payload 
    );
    return response.data;
  } 
);

// /profile details/
export const getProfile = createAsyncThunk(
  "getProfile",
  async () => {
    const response = await axiosInstance.get(endpoints.auth.profileDetails);
    return response.data;
  }
);

export const authLogout = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, thunkAPI) => {
  try {
    await axiosInstance.post(endpoints.auth.logout);
  } catch (error: unknown) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message
      : undefined;
    return thunkAPI.rejectWithValue(message || "Logout request failed");
  }
});
//reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    {
      userId,
      token,
      password,
      confirm_password,
    }: {
      userId: string;
      token: string;
      password: string;
      confirm_password: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await axiosInstance.post(
        `${endpoints.auth.resetLink}/${userId}/${token}`,
        { password, confirm_password }
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Reset password failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.email = null;
      state.name = null;
      state.profileImage = null;
      state.user = null;
      state.token = null;
      state.isloggedIn = false;
      toast("Logout successful");

    },

    checkToken: (state, action) => {
      let token = cookie.get("token")
      if (token !== null && token !== undefined) {
        state.isloggedIn = true
       
      }
    }
  },

  extraReducers: (builder) => {
    builder
      // /login/
      .addCase(authLogin.pending, () => { })
      .addCase(authLogin.fulfilled, (state, { payload }) => {
        if (payload.status == true) {
          state.isloggedIn = true
        }
      })
      .addCase(authLogin.rejected, () => { })

      // /verifyOtp/
      .addCase(verifyOtp.pending, () => { })

      // /reset email/
     
      .addCase(resetEmail.pending, (state) => { state.loading = true; })
      .addCase(resetEmail.fulfilled, (state, { payload }) => {
        state.loading = false;
        toast.success("Reset link sent to your email")
       })
      .addCase(resetEmail.rejected, (state) => { 
        state.loading = false;
        toast.error("Failed to send reset link")
      })

      // /reset link/
    
      .addCase(resetLink.pending, () => { })
      .addCase(resetLink.fulfilled, () => {
        toast.success("Password reset successful")
       })
      .addCase(resetLink.rejected, () => { 
        toast.error("Password reset failed")
      })
      // /update password/
     
      .addCase(updatePassword.pending, () => { })
      .addCase(updatePassword.fulfilled, () => { })
      .addCase(updatePassword.rejected, () => { })

      // /profile details/
      .addCase(getProfile.pending, (state) => { state.loading = true; })
      .addCase(getProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (payload.status) {
          state.user = payload.data;
          state.name = payload.data.name;
          state.email = payload.data.email;
          state.profileImage = payload.data.profileImage;
          state.userId = payload.data._id || payload.data.id;
        }
      })
      .addCase(getProfile.rejected, (state) => { state.loading = false; })

      .addCase(resetPassword.fulfilled, (state, action) => {
        if (action.payload.status) {
          toast.success(action.payload.message);
        }
      })
      .addCase(resetPassword.rejected, (state, action: any) => {
        toast.error(action.payload);
      });

  },
});

export default authSlice.reducer;
export const { logout, checkToken } = authSlice.actions
"use client";

import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import axios from "axios";

import { toast } from "sonner";

import axiosInstance from "@/api/axios/axios";

import { endpoints } from "@/api/endpoints/endpoints";

import {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserListParams,
} from "@/types/user";


// ============================================================
// STATE
// ============================================================

interface UserState {
  users: User[];

  selectedUser: User | null;

  currentPage: number;

  limit: number;

  totalUsers: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;

  loading: boolean;

  loadingMore: boolean;

  actionLoading: boolean;

  error: string | null;
}


const initialState: UserState = {
  users: [],

  selectedUser: null,

  currentPage: 0,

  limit: 10,

  totalUsers: 0,

  totalPages: 0,

  hasNextPage: false,

  hasPreviousPage: false,

  loading: false,

  loadingMore: false,

  actionLoading: false,

  error: null,
};


// ============================================================
// ERROR HELPER
// ============================================================

const getErrorMessage = (
  error: unknown,
  fallback: string
) => {
  if (
    axios.isAxiosError<{
      message?: string;
    }>(error)
  ) {
    return (
      error.response?.data?.message ||
      fallback
    );
  }

  return fallback;
};


// ============================================================
// GET USERS
// ============================================================

export const getUsers =
  createAsyncThunk<
    {
      users: User[];

      pagination: {
        currentPage: number;
        limit: number;
        totalUsers: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    },
    UserListParams | undefined,
    {
      rejectValue: string;
    }
  >(
    "user/getUsers",

    async (
      params = {},
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.get(
            endpoints.user.getAll,
            {
              params: {
                page:
                  params.page || 1,

                limit:
                  params.limit || 10,

                search:
                  params.search || "",

                role:
                  params.role === "all"
                    ? undefined
                    : params.role,

                status:
                  params.status === "all"
                    ? undefined
                    : params.status,
              },
            }
          );

        return {
          users:
            response.data.data ||
            [],

          pagination:
            response.data
              .pagination,
        };

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch users"
          )
        );
      }
    }
  );


// ============================================================
// GET SINGLE USER
// ============================================================

export const getUserById =
  createAsyncThunk<
    User,
    string,
    {
      rejectValue: string;
    }
  >(
    "user/getUserById",

    async (
      id,
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.get(
            endpoints.user.getById(
              id
            )
          );

        return response.data.data;

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to fetch user"
          )
        );
      }
    }
  );


// ============================================================
// CREATE USER
// Requires POST /api/v1/user
// ============================================================

export const createUser =
  createAsyncThunk<
    User,
    CreateUserPayload,
    {
      rejectValue: string;
    }
  >(
    "user/createUser",

    async (
      payload,
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.post(
            endpoints.user.create,
            payload
          );

        return response.data.data;

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to create user"
          )
        );
      }
    }
  );


// ============================================================
// UPDATE USER
// ============================================================

export const updateUser =
  createAsyncThunk<
    User,
    {
      id: string;
      data: UpdateUserPayload;
    },
    {
      rejectValue: string;
    }
  >(
    "user/updateUser",

    async (
      {
        id,
        data,
      },
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.user.update(
              id
            ),
            data
          );

        return response.data.data;

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to update user"
          )
        );
      }
    }
  );


// ============================================================
// DELETE USER
// ============================================================

export const deleteUser =
  createAsyncThunk<
    string,
    string,
    {
      rejectValue: string;
    }
  >(
    "user/deleteUser",

    async (
      id,
      thunkAPI
    ) => {
      try {
        await axiosInstance.delete(
          endpoints.user.delete(id)
        );

        return id;

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to delete user"
          )
        );
      }
    }
  );


// ============================================================
// ACTIVATE USER
// ============================================================

export const activateUser =
  createAsyncThunk<
    User,
    string,
    {
      rejectValue: string;
    }
  >(
    "user/activateUser",

    async (
      id,
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.user.activate(
              id
            )
          );

        return response.data.data;

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to activate user"
          )
        );
      }
    }
  );


// ============================================================
// DEACTIVATE USER
// ============================================================

export const deactivateUser =
  createAsyncThunk<
    User,
    string,
    {
      rejectValue: string;
    }
  >(
    "user/deactivateUser",

    async (
      id,
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.user.deactivate(
              id
            )
          );

        return response.data.data;

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to deactivate user"
          )
        );
      }
    }
  );


// ============================================================
// CHANGE ROLE
// ============================================================

export const changeUserRole =
  createAsyncThunk<
    User,
    {
      id: string;
      role:
        | "manager"
        | "staff"
        | "customer";
    },
    {
      rejectValue: string;
    }
  >(
    "user/changeUserRole",

    async (
      {
        id,
        role,
      },
      thunkAPI
    ) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.user.changeRole(
              id
            ),
            {
              role,
            }
          );

        return response.data.data;

      } catch (error) {
        return thunkAPI.rejectWithValue(
          getErrorMessage(
            error,
            "Failed to change user role"
          )
        );
      }
    }
  );


// ============================================================
// SLICE
// ============================================================

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    clearUserError: (
      state
    ) => {
      state.error = null;
    },

    clearSelectedUser: (
      state
    ) => {
      state.selectedUser = null;
    },

    setSelectedUser: (
      state,
      action: PayloadAction<
        User | null
      >
    ) => {
      state.selectedUser =
        action.payload;
    },

    resetUsers: (
      state
    ) => {
      state.users = [];

      state.currentPage = 0;

      state.totalUsers = 0;

      state.totalPages = 0;

      state.hasNextPage =
        false;

      state.hasPreviousPage =
        false;
    },
  },

  extraReducers: (
    builder
  ) => {

    // ========================================================
    // GET USERS
    // ========================================================

    builder
      .addCase(
        getUsers.pending,
        (
          state,
          action
        ) => {
          const page =
            action.meta.arg
              ?.page || 1;

          if (page === 1) {
            state.loading =
              true;
          } else {
            state.loadingMore =
              true;
          }

          state.error = null;
        }
      )

      .addCase(
        getUsers.fulfilled,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.loadingMore =
            false;

          const {
            users,
            pagination,
          } = action.payload;

          if (
            pagination.currentPage ===
            1
          ) {
            state.users =
              users;
          } else {
            const existingIds =
              new Set(
                state.users.map(
                  (user) =>
                    user._id
                )
              );

            const newUsers =
              users.filter(
                (user) =>
                  !existingIds.has(
                    user._id
                  )
              );

            state.users.push(
              ...newUsers
            );
          }

          state.currentPage =
            pagination.currentPage;

          state.limit =
            pagination.limit;

          state.totalUsers =
            pagination.totalUsers;

          state.totalPages =
            pagination.totalPages;

          state.hasNextPage =
            pagination.hasNextPage;

          state.hasPreviousPage =
            pagination.hasPreviousPage;
        }
      )

      .addCase(
        getUsers.rejected,
        (
          state,
          action
        ) => {
          state.loading = false;

          state.loadingMore =
            false;

          state.error =
            action.payload ||
            "Failed to fetch users";
        }
      );


    // ========================================================
    // GET SINGLE USER
    // ========================================================

    builder
      .addCase(
        getUserById.fulfilled,
        (
          state,
          action
        ) => {
          state.selectedUser =
            action.payload;
        }
      );


    // ========================================================
    // CREATE
    // ========================================================

    builder
      .addCase(
        createUser.pending,
        (state) => {
          state.actionLoading =
            true;
        }
      )

      .addCase(
        createUser.fulfilled,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          state.users.unshift(
            action.payload
          );

          state.totalUsers +=
            1;

          toast.success(
            "User created successfully"
          );
        }
      )

      .addCase(
        createUser.rejected,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          toast.error(
            action.payload ||
            "Failed to create user"
          );
        }
      );


    // ========================================================
    // UPDATE
    // ========================================================

    builder
      .addCase(
        updateUser.pending,
        (state) => {
          state.actionLoading =
            true;
        }
      )

      .addCase(
        updateUser.fulfilled,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          const index =
            state.users.findIndex(
              (user) =>
                user._id ===
                action.payload._id
            );

          if (index !== -1) {
            state.users[index] =
              action.payload;
          }

          toast.success(
            "User updated successfully"
          );
        }
      )

      .addCase(
        updateUser.rejected,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          toast.error(
            action.payload ||
            "Failed to update user"
          );
        }
      );


    // ========================================================
    // DELETE
    // ========================================================

    builder
      .addCase(
        deleteUser.pending,
        (state) => {
          state.actionLoading =
            true;
        }
      )

      .addCase(
        deleteUser.fulfilled,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          state.users =
            state.users.filter(
              (user) =>
                user._id !==
                action.payload
            );

          state.totalUsers =
            Math.max(
              0,
              state.totalUsers -
                1
            );

          toast.success(
            "User deleted successfully"
          );
        }
      )

      .addCase(
        deleteUser.rejected,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          toast.error(
            action.payload ||
            "Failed to delete user"
          );
        }
      );


    // ========================================================
    // ACTIVATE
    // ========================================================

    builder
      .addCase(
        activateUser.pending,
        (state) => {
          state.actionLoading =
            true;
        }
      )

      .addCase(
        activateUser.fulfilled,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          const index =
            state.users.findIndex(
              (user) =>
                user._id ===
                action.payload._id
            );

          if (index !== -1) {
            state.users[index] =
              action.payload;
          }

          toast.success(
            "User activated successfully"
          );
        }
      )

      .addCase(
        activateUser.rejected,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          toast.error(
            action.payload ||
            "Failed to activate user"
          );
        }
      );


    // ========================================================
    // DEACTIVATE
    // ========================================================

    builder
      .addCase(
        deactivateUser.pending,
        (state) => {
          state.actionLoading =
            true;
        }
      )

      .addCase(
        deactivateUser.fulfilled,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          const index =
            state.users.findIndex(
              (user) =>
                user._id ===
                action.payload._id
            );

          if (index !== -1) {
            state.users[index] =
              action.payload;
          }

          toast.success(
            "User deactivated successfully"
          );
        }
      )

      .addCase(
        deactivateUser.rejected,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          toast.error(
            action.payload ||
            "Failed to deactivate user"
          );
        }
      );


    // ========================================================
    // CHANGE ROLE
    // ========================================================

    builder
      .addCase(
        changeUserRole.pending,
        (state) => {
          state.actionLoading =
            true;
        }
      )

      .addCase(
        changeUserRole.fulfilled,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          const index =
            state.users.findIndex(
              (user) =>
                user._id ===
                action.payload._id
            );

          if (index !== -1) {
            state.users[index] =
              action.payload;
          }

          toast.success(
            "User role changed successfully"
          );
        }
      )

      .addCase(
        changeUserRole.rejected,
        (
          state,
          action
        ) => {
          state.actionLoading =
            false;

          toast.error(
            action.payload ||
            "Failed to change role"
          );
        }
      );
  },
});


export const {
  clearUserError,
  clearSelectedUser,
  setSelectedUser,
  resetUsers,
} = userSlice.actions;

export default userSlice.reducer;
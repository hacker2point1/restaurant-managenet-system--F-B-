import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

import type { Branch } from "@/types/branch";

interface BranchState {
  branches: Branch[];

  selectedBranch: Branch | null;

  loading: boolean;
  detailsLoading: boolean;
  actionLoading: boolean;

  error: string | null;

  stats: {
    total: number;
    active: number;
    inactive: number;
    openingSoon: number;
  };
}

const initialState: BranchState = {
  branches: [],

  selectedBranch: null,

  loading: false,
  detailsLoading: false,
  actionLoading: false,

  error: null,

  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    openingSoon: 0,
  },
};

export const createBranch = createAsyncThunk<
  Branch,
  { restaurantId: string; data: FormData },
  { rejectValue: string }
>(
  "branch/createBranch",
  async ({ restaurantId, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        endpoints.branch.create(restaurantId),
        data
      );

      return response.data.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      return rejectWithValue(message || "Failed to create branch");
    }
  }
);

export const fetchBranches = createAsyncThunk<
  Branch[],
  string,
  { rejectValue: string }
>(
  "branch/fetchBranches",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        endpoints.branch.getAll(restaurantId)
      );

      return response.data?.data || [];
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch branches"
      );
    }
  }
);

export const updateBranch = createAsyncThunk<
  Branch,
  { id: string; data: FormData },
  { rejectValue: string }
>(
  "branch/updateBranch",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.branch.update(id),
        data
      );

      return response.data.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      return rejectWithValue(message || "Failed to update branch");
    }
  }
);

export const fetchBranchById = createAsyncThunk<
  Branch,
  string,
  { rejectValue: string }
>(
  "branch/fetchBranchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        endpoints.branch.getById(id)
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch branch"
      );
    }
  }
);
export const activateBranch = createAsyncThunk<
  Branch,
  string,
  { rejectValue: string }
>(
  "branch/activateBranch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.branch.activate(id)
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to activate branch"
      );
    }
  }
);
export const deactivateBranch = createAsyncThunk<
  Branch,
  string,
  { rejectValue: string }
>(
  "branch/deactivateBranch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.branch.deactivate(id)
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to deactivate branch"
      );
    }
  }
);
export const softDeleteBranch = createAsyncThunk<
  Branch,
  string,
  { rejectValue: string }
>(
  "branch/softDeleteBranch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.branch.softDelete(id)
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to delete branch"
      );
    }
  }
);
export const restoreBranch = createAsyncThunk<
  Branch,
  string,
  { rejectValue: string }
>(
  "branch/restoreBranch",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        endpoints.branch.restore(id)
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to restore branch"
      );
    }
  }
);
export const hardDeleteBranch = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "branch/hardDeleteBranch",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(
        endpoints.branch.hardDelete(id)
      );

      return id;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to permanently delete branch"
      );
    }
  }
);
const branchSlice = createSlice({
  name: "branch",

  initialState,

  reducers: {
  clearBranchError: (state) => {
    state.error = null;
  },

  clearSelectedBranch: (state) => {
    state.selectedBranch = null;
  },

  setSelectedBranch: (
    state,
    action
  ) => {
    state.selectedBranch =
      action.payload;
  },
},

  extraReducers: (builder) => {
    // ============================================
    // GET BRANCHES
    // ============================================

    builder
      .addCase(fetchBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.loading = false;

        state.branches = action.payload;

        const total = action.payload.length;

        const active = action.payload.filter(
          (branch) => branch.isActive
        ).length;

        const inactive = total - active;

        state.stats = {
          total,
          active,
          inactive,
          openingSoon: 0,
        };
      })

      .addCase(fetchBranches.rejected, (state, action) => {
        state.loading = false;

        state.error =
          action.payload ||
          "Failed to fetch branches";
      });

    // ============================================
    // GET BRANCH
    // ============================================

    builder
      .addCase(fetchBranchById.pending, (state) => {
        state.detailsLoading = true;
      })

      .addCase(fetchBranchById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedBranch = action.payload;
      })

      .addCase(fetchBranchById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error =
          action.payload ||
          "Failed to fetch branch";
      });

    // ============================================
    // CREATE
    // ============================================

    builder
      .addCase(createBranch.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(createBranch.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.branches.unshift(action.payload);

        state.stats.total += 1;

        if (action.payload.isActive) {
          state.stats.active += 1;
        } else {
          state.stats.inactive += 1;
        }
      })

      .addCase(createBranch.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload ||
          "Failed to create branch";
      });

    // ============================================
    // UPDATE
    // ============================================

    builder
      .addCase(updateBranch.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(updateBranch.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.branches.findIndex(
          (branch) =>
            branch._id === action.payload._id
        );

        if (index !== -1) {
          state.branches[index] = action.payload;
        }

        state.selectedBranch = action.payload;
      })

      .addCase(updateBranch.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload ||
          "Failed to update branch";
      });

    // ============================================
    // ACTIVATE
    // ============================================

    builder
      .addCase(activateBranch.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(activateBranch.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.branches.findIndex(
          (branch) =>
            branch._id === action.payload._id
        );

        if (index !== -1) {
          state.branches[index] = action.payload;
        }
      })

      .addCase(activateBranch.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload ||
          "Failed to activate branch";
      });

    // ============================================
    // DEACTIVATE
    // ============================================

    builder
      .addCase(deactivateBranch.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(deactivateBranch.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.branches.findIndex(
          (branch) =>
            branch._id === action.payload._id
        );

        if (index !== -1) {
          state.branches[index] = action.payload;
        }
      })

      .addCase(deactivateBranch.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload ||
          "Failed to deactivate branch";
      });

    // ============================================
    // SOFT DELETE
    // ============================================

    builder
      .addCase(softDeleteBranch.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(softDeleteBranch.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.branches =
          state.branches.filter(
            (branch) =>
              branch._id !== action.payload._id
          );

        state.stats.total =
          Math.max(0, state.stats.total - 1);

        if (action.payload.isActive) {
          state.stats.active =
            Math.max(0, state.stats.active - 1);
        } else {
          state.stats.inactive =
            Math.max(0, state.stats.inactive - 1);
        }
      })

      .addCase(softDeleteBranch.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload ||
          "Failed to delete branch";
      });

    // ============================================
    // RESTORE
    // ============================================

    builder
      .addCase(restoreBranch.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(restoreBranch.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.branches.unshift(action.payload);

        state.stats.total += 1;

        if (action.payload.isActive) {
          state.stats.active += 1;
        } else {
          state.stats.inactive += 1;
        }
      })

      .addCase(restoreBranch.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload ||
          "Failed to restore branch";
      });

    // ============================================
    // HARD DELETE
    // ============================================

    builder
      .addCase(hardDeleteBranch.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(hardDeleteBranch.fulfilled, (state, action) => {
        state.actionLoading = false;

        const branch = state.branches.find(
          (item) => item._id === action.payload
        );

        state.branches =
          state.branches.filter(
            (item) => item._id !== action.payload
          );

        state.stats.total =
          Math.max(0, state.stats.total - 1);

        if (branch?.isActive) {
          state.stats.active =
            Math.max(0, state.stats.active - 1);
        }
      })

      .addCase(hardDeleteBranch.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload ||
          "Failed to permanently delete branch";
      });
  },
});

export const {
  clearBranchError,
  clearSelectedBranch,
} = branchSlice.actions;

export default branchSlice.reducer;
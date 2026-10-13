"use client";

import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import axios from "axios";

import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

import {
  CreateTablePayload,
  Table,
  TableState,
  TableStatus,
  TableUtilization,
  UpdateTablePayload,
} from "@/types/table";

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: TableState = {
  tables: [],

  utilization: null,

  selectedTable: null,

  loading: false,

  utilizationLoading: false,

  actionLoading: false,

  error: null,
};

// ============================================================
// GET TABLES
// ============================================================

export const fetchTables = createAsyncThunk<
  Table[],
  { restaurantId?: string; branchId?: string } | undefined,
  { rejectValue: string }
>(
  "table/fetchTables",
  async (filters = {}, thunkAPI) => {
    try {
      const response = await AxiosInstance.get(
        endpoints.table.getAll,
        { params: filters }
      );

      return response.data.data as Table[];
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch tables"
      );
    }
  }
);

// ============================================================
// GET UTILIZATION
// ============================================================

export const fetchTableUtilization = createAsyncThunk<
  TableUtilization,
  string,
  { rejectValue: string }
>(
  "table/fetchTableUtilization",
  async (branchId, thunkAPI) => {
    try {
      const response = await AxiosInstance.get(
        endpoints.table.utilization(branchId)
      );

      return response.data.data as TableUtilization;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch table utilization"
      );
    }
  }
);

// ============================================================
// CREATE TABLE
// ============================================================

export const createTable = createAsyncThunk<
  Table,
  {
    branchId: string;
    payload: CreateTablePayload;
  },
  { rejectValue: string }
>(
  "table/createTable",
  async ({ branchId, payload }, thunkAPI) => {
    try {
      const response = await AxiosInstance.post(
        endpoints.table.create(branchId),
        payload
      );

      return response.data.data as Table;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to create table"
      );
    }
  }
);

// ============================================================
// GET TABLE BY ID
// ============================================================

export const fetchTableById = createAsyncThunk<
  Table,
  string,
  { rejectValue: string }
>(
  "table/fetchTableById",
  async (id, thunkAPI) => {
    try {
      const response = await AxiosInstance.get(
        endpoints.table.getById(id)
      );

      return response.data.data as Table;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch table"
      );
    }
  }
);

// ============================================================
// UPDATE TABLE
// ============================================================

export const updateTable = createAsyncThunk<
  Table,
  {
    id: string;
    payload: UpdateTablePayload;
  },
  { rejectValue: string }
>(
  "table/updateTable",
  async ({ id, payload }, thunkAPI) => {
    try {
      const response = await AxiosInstance.patch(
        endpoints.table.update(id),
        payload
      );

      return response.data.data as Table;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to update table"
      );
    }
  }
);

// ============================================================
// SOFT DELETE
// ============================================================

export const softDeleteTable = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "table/softDeleteTable",
  async (id, thunkAPI) => {
    try {
      const response = await AxiosInstance.patch(
        endpoints.table.softDelete(id)
      );

      return response.data.message || "Table deleted successfully";
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to delete table"
      );
    }
  }
);

// ============================================================
// RESTORE
// ============================================================

export const restoreTable = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "table/restoreTable",
  async (id, thunkAPI) => {
    try {
      const response = await AxiosInstance.patch(
        endpoints.table.restore(id)
      );

      return response.data.message || "Table restored successfully";
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to restore table"
      );
    }
  }
);

// ============================================================
// PERMANENT DELETE
// ============================================================

export const permanentDeleteTable = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "table/permanentDeleteTable",
  async (id, thunkAPI) => {
    try {
      const response = await AxiosInstance.delete(
        endpoints.table.permanentDelete(id)
      );

      return response.data.message || "Table permanently deleted";
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to permanently delete table"
      );
    }
  }
);

// ============================================================
// UPDATE STATUS
// ============================================================

export const updateTableStatus = createAsyncThunk<
  Table,
  {
    id: string;
    status: TableStatus;
  },
  { rejectValue: string }
>(
  "table/updateTableStatus",
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await AxiosInstance.patch(
        endpoints.table.updateStatus(id),
        {
          status,
        }
      );

      return response.data.data as Table;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to update table status"
      );
    }
  }
);

// ============================================================
// ALLOCATE
// ============================================================

export const allocateTable = createAsyncThunk<
  Table,
  string,
  { rejectValue: string }
>(
  "table/allocateTable",
  async (id, thunkAPI) => {
    try {
      const response = await AxiosInstance.patch(
        endpoints.table.allocate(id)
      );

      return response.data.data as Table;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to allocate table"
      );
    }
  }
);

// ============================================================
// RELEASE
// ============================================================

export const releaseTable = createAsyncThunk<
  Table,
  string,
  { rejectValue: string }
>(
  "table/releaseTable",
  async (id, thunkAPI) => {
    try {
      const response = await AxiosInstance.patch(
        endpoints.table.release(id)
      );

      return response.data.data as Table;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(
        error
      )
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to release table"
      );
    }
  }
);

// ============================================================
// SLICE
// ============================================================

const tableSlice = createSlice({
  name: "table",
  initialState,

  reducers: {
    clearTableError: (state) => {
      state.error = null;
    },

    clearSelectedTable: (state) => {
      state.selectedTable = null;
    },

    setSelectedTable: (
      state,
      action: PayloadAction<Table | null>
    ) => {
      state.selectedTable = action.payload;
    },

    clearTables: (state) => {
      state.tables = [];
      state.utilization = null;
      state.selectedTable = null;
    },
  },

  extraReducers: (builder) => {
    // ==========================================================
    // GET TABLES
    // ==========================================================

    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload;
      })

      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch tables";
      });

    // ==========================================================
    // UTILIZATION
    // ==========================================================

    builder
      .addCase(fetchTableUtilization.pending, (state) => {
        state.utilizationLoading = true;
      })

      .addCase(
        fetchTableUtilization.fulfilled,
        (state, action) => {
          state.utilizationLoading = false;
          state.utilization = action.payload;
        }
      )

      .addCase(
        fetchTableUtilization.rejected,
        (state, action) => {
          state.utilizationLoading = false;
          state.error =
            action.payload ||
            "Failed to fetch utilization";
        }
      );

    // ==========================================================
    // CREATE
    // ==========================================================

    builder
      .addCase(createTable.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })

      .addCase(createTable.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.tables.push(action.payload);

        if (state.utilization) {
          state.utilization.totalTables += 1;

          if (action.payload.isActive) {
            state.utilization.activeTables += 1;
          }

          if (action.payload.status === "available") {
            state.utilization.availableTables += 1;
          }

          if (action.payload.status === "occupied") {
            state.utilization.occupiedTables += 1;
          }

          if (action.payload.status === "reserved") {
            state.utilization.reservedTables += 1;
          }

          if (action.payload.status === "maintenance") {
            state.utilization.maintenanceTables += 1;
          }
        }
      })

      .addCase(createTable.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Failed to create table";
      });

    // ==========================================================
    // GET BY ID
    // ==========================================================

    builder
      .addCase(fetchTableById.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(fetchTableById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedTable = action.payload;
      })

      .addCase(fetchTableById.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Failed to fetch table";
      });

    // ==========================================================
    // UPDATE
    // ==========================================================

    builder
      .addCase(updateTable.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(updateTable.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.tables.findIndex(
          (table) => table._id === action.payload._id
        );

        if (index !== -1) {
          state.tables[index] = action.payload;
        }

        if (
          state.selectedTable?._id === action.payload._id
        ) {
          state.selectedTable = action.payload;
        }
      })

      .addCase(updateTable.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Failed to update table";
      });

    // ==========================================================
    // SOFT DELETE
    // ==========================================================

    builder
      .addCase(softDeleteTable.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(softDeleteTable.fulfilled, (state) => {
        state.actionLoading = false;
      })

      .addCase(softDeleteTable.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Failed to delete table";
      });

    // ==========================================================
    // RESTORE
    // ==========================================================

    builder
      .addCase(restoreTable.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(restoreTable.fulfilled, (state) => {
        state.actionLoading = false;
      })

      .addCase(restoreTable.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Failed to restore table";
      });

    // ==========================================================
    // PERMANENT DELETE
    // ==========================================================

    builder
      .addCase(permanentDeleteTable.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(permanentDeleteTable.fulfilled, (state) => {
        state.actionLoading = false;
      })

      .addCase(
        permanentDeleteTable.rejected,
        (state, action) => {
          state.actionLoading = false;
          state.error =
            action.payload ||
            "Failed to permanently delete table";
        }
      );

    // ==========================================================
    // STATUS
    // ==========================================================

    builder
      .addCase(updateTableStatus.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(
        updateTableStatus.fulfilled,
        (state, action) => {
          state.actionLoading = false;

          const index = state.tables.findIndex(
            (table) => table._id === action.payload._id
          );

          if (index !== -1) {
            state.tables[index] = action.payload;
          }
        }
      )

      .addCase(
        updateTableStatus.rejected,
        (state, action) => {
          state.actionLoading = false;
          state.error =
            action.payload ||
            "Failed to update table status";
        }
      );

    // ==========================================================
    // ALLOCATE
    // ==========================================================

    builder
      .addCase(allocateTable.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(allocateTable.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.tables.findIndex(
          (table) => table._id === action.payload._id
        );

        if (index !== -1) {
          state.tables[index] = action.payload;
        }
      })

      .addCase(allocateTable.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Failed to allocate table";
      });

    // ==========================================================
    // RELEASE
    // ==========================================================

    builder
      .addCase(releaseTable.pending, (state) => {
        state.actionLoading = true;
      })

      .addCase(releaseTable.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.tables.findIndex(
          (table) => table._id === action.payload._id
        );

        if (index !== -1) {
          state.tables[index] = action.payload;
        }
      })

      .addCase(releaseTable.rejected, (state, action) => {
        state.actionLoading = false;
        state.error =
          action.payload || "Failed to release table";
      });
  },
});

export const {
  clearTableError,
  clearSelectedTable,
  setSelectedTable,
  clearTables,
} = tableSlice.actions;

export default tableSlice.reducer;
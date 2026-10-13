import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


import type {
  AdjustmentPayload,
  InventoryTransaction,
  InventoryTransactionType,
  PurchasePayload,
  ReturnPayload,
  StockInPayload,
  StockOutPayload,
  TransactionPagination,
  TransactionQuery,
  TransactionReport,
  WastagePayload,
} from "@/types/inventoryTransaction";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

interface InventoryTransactionState {
  transactions: InventoryTransaction[];

  selectedTransaction: InventoryTransaction | null;

  pagination: TransactionPagination | null;

  report: TransactionReport | null;

  loading: boolean;

  reportLoading: boolean;

  detailsLoading: boolean;

  actionLoading: boolean;

  error: string | null;
}

const initialState: InventoryTransactionState = {
  transactions: [],

  selectedTransaction: null,

  pagination: null,

  report: null,

  loading: false,

  reportLoading: false,

  detailsLoading: false,

  actionLoading: false,

  error: null,
};

// ============================================================
// GET TRANSACTIONS
// ============================================================

export const getInventoryTransactions = createAsyncThunk(
  "inventoryTransaction/getAll",

  async (query: TransactionQuery = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        endpoints.inventoryTransaction.getAll,
        {
          params: query,
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch inventory transactions"
      );
    }
  }
);

// ============================================================
// GET TRANSACTION BY ID
// ============================================================

export const getInventoryTransactionById = createAsyncThunk(
  "inventoryTransaction/getById",

  async (id: string, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        endpoints.inventoryTransaction.getById(id)
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch transaction details"
      );
    }
  }
);

// ============================================================
// GET REPORT
// ============================================================

export const getInventoryTransactionReport = createAsyncThunk(
  "inventoryTransaction/getReport",

  async (
    params: {
      branch?: string;
      startDate?: string;
      endDate?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await AxiosInstance.get(
        endpoints.inventoryTransaction.report,
        {
          params,
        }
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch transaction report"
      );
    }
  }
);

// ============================================================
// STOCK IN
// ============================================================

export const stockIn = createAsyncThunk(
  "inventoryTransaction/stockIn",

  async (data: StockInPayload, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.post(
        endpoints.inventoryTransaction.stockIn,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to record stock in"
      );
    }
  }
);

// ============================================================
// STOCK OUT
// ============================================================

export const stockOut = createAsyncThunk(
  "inventoryTransaction/stockOut",

  async (data: StockOutPayload, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.post(
        endpoints.inventoryTransaction.stockOut,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to record stock out"
      );
    }
  }
);

// ============================================================
// PURCHASE
// ============================================================

export const purchaseStock = createAsyncThunk(
  "inventoryTransaction/purchase",

  async (data: PurchasePayload, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.post(
        endpoints.inventoryTransaction.purchase,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to record purchase"
      );
    }
  }
);

// ============================================================
// WASTAGE
// ============================================================

export const recordWastage = createAsyncThunk(
  "inventoryTransaction/wastage",

  async (data: WastagePayload, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.post(
        endpoints.inventoryTransaction.wastage,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to record wastage"
      );
    }
  }
);

// ============================================================
// RETURN
// ============================================================

export const recordReturn = createAsyncThunk(
  "inventoryTransaction/return",

  async (data: ReturnPayload, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.post(
        endpoints.inventoryTransaction.returnStock,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to record return"
      );
    }
  }
);

// ============================================================
// ADJUSTMENT
// ============================================================

export const adjustStock = createAsyncThunk(
  "inventoryTransaction/adjustment",

  async (data: AdjustmentPayload, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.post(
        endpoints.inventoryTransaction.adjustment,
        data
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to adjust stock"
      );
    }
  }
);

// ============================================================
// SLICE
// ============================================================

const inventoryTransactionSlice = createSlice({
  name: "inventoryTransaction",

  initialState,

  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },

    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },

    clearReport: (state) => {
      state.report = null;
    },
  },

  extraReducers: (builder) => {
    // ----------------------------------------------------------
    // GET ALL
    // ----------------------------------------------------------

    builder
      .addCase(
        getInventoryTransactions.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        getInventoryTransactions.fulfilled,
        (state, action) => {
          state.loading = false;

          state.transactions =
            action.payload.data || [];

          state.pagination =
            action.payload.pagination || null;
        }
      )

      .addCase(
        getInventoryTransactions.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch transactions";
        }
      );

    // ----------------------------------------------------------
    // GET BY ID
    // ----------------------------------------------------------

    builder
      .addCase(
        getInventoryTransactionById.pending,
        (state) => {
          state.detailsLoading = true;
        }
      )

      .addCase(
        getInventoryTransactionById.fulfilled,
        (state, action) => {
          state.detailsLoading = false;

          state.selectedTransaction =
            action.payload;
        }
      )

      .addCase(
        getInventoryTransactionById.rejected,
        (state, action) => {
          state.detailsLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch transaction";
        }
      );

    // ----------------------------------------------------------
    // REPORT
    // ----------------------------------------------------------

    builder
      .addCase(
        getInventoryTransactionReport.pending,
        (state) => {
          state.reportLoading = true;
        }
      )

      .addCase(
        getInventoryTransactionReport.fulfilled,
        (state, action) => {
          state.reportLoading = false;

          state.report = action.payload;
        }
      )

      .addCase(
        getInventoryTransactionReport.rejected,
        (state, action) => {
          state.reportLoading = false;

          state.error =
            (action.payload as string) ||
            "Failed to fetch report";
        }
      );

    // ----------------------------------------------------------
    // MUTATIONS
    // ----------------------------------------------------------

    const mutationThunks = [
      stockIn,
      stockOut,
      purchaseStock,
      recordWastage,
      recordReturn,
      adjustStock,
    ];

    mutationThunks.forEach((thunk) => {
      builder.addCase(thunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      });

      builder.addCase(thunk.fulfilled, (state) => {
        state.actionLoading = false;
      });

      builder.addCase(thunk.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          (action.payload as string) ||
          "Transaction action failed";
      });
    });
  },
});

export const {
  clearTransactionError,
  clearSelectedTransaction,
  clearReport,
} = inventoryTransactionSlice.actions;

export default inventoryTransactionSlice.reducer;
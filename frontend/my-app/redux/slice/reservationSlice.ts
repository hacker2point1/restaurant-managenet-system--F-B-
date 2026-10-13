"use client";

import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import axios from "axios";

import axiosInstance from "@/api/axios/axios";

import { endpoints } from "@/api/endpoints/endpoints";

import {
  AvailableTable,
  Branch,
  Customer,
  Reservation,
  ReservationFormData,
  ReservationListResponse,
  ReservationPagination,
  ReservationStats,
} from "@/types/reservation";

interface FetchReservationsParams {
  branchId: string;

  page?: number;

  limit?: number;

  status?: string;

  date?: string;
}

interface FetchAdminReservationsParams {
  branchId?: string;
  page?: number;
  limit?: number;
  status?: string;
  date?: string;
}

interface ReservationState {
  reservations: Reservation[];

  selectedReservation: Reservation | null;

  customers: Customer[];

  branches: Branch[];

  availableTables: AvailableTable[];

  pagination: ReservationPagination;

  stats: ReservationStats;

  loading: boolean;

  actionLoading: boolean;

  customerLoading: boolean;

  availabilityLoading: boolean;

  branchLoading: boolean;

  error: string | null;

  customerError: string | null;
}

const initialState: ReservationState = {
  reservations: [],

  selectedReservation: null,

  customers: [],

  branches: [],

  availableTables: [],

  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },

  stats: {
    total: 0,
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  },

  loading: false,

  actionLoading: false,

  customerLoading: false,

  availabilityLoading: false,

  branchLoading: false,

  error: null,

  customerError: null,
};


// ============================================================
// GET RESERVATIONS
// ============================================================

export const fetchReservations = createAsyncThunk<
  ReservationListResponse,
  FetchReservationsParams,
  { rejectValue: string }
>(
  "reservation/fetchReservations",

  async (params, thunkAPI) => {
    try {
      const {
        branchId,
        page = 1,
        limit = 10,
        status,
        date,
      } = params;

      const response = await axiosInstance.get(
        endpoints.reservation.getByBranch(branchId),
        {
          params: {
            page,
            limit,
            ...(status ? { status } : {}),
            ...(date ? { date } : {}),
          },
        }
      );

      return response.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch reservations"
      );
    }
  }
);

export const fetchAdminReservations = createAsyncThunk<
  ReservationListResponse,
  FetchAdminReservationsParams,
  { rejectValue: string }
>("reservation/fetchAdminReservations", async (params, thunkAPI) => {
  try {
    const response = await axiosInstance.get(
      endpoints.reservation.getAdmin,
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    const message = axios.isAxiosError<{ message?: string }>(error)
      ? error.response?.data?.message
      : undefined;
    return thunkAPI.rejectWithValue(
      message || "Failed to fetch reservations"
    );
  }
});


// ============================================================
// GET RESERVATION BY ID
// ============================================================

export const fetchReservationById = createAsyncThunk<
  Reservation,
  string,
  { rejectValue: string }
>(
  "reservation/fetchReservationById",

  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        endpoints.reservation.getById(id)
      );

      return response.data.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch reservation"
      );
    }
  }
);


// ============================================================
// SEARCH CUSTOMERS
// ============================================================

export const searchCustomers = createAsyncThunk<
  Customer[],
  string,
  { rejectValue: string }
>(
  "reservation/searchCustomers",

  async (query, thunkAPI) => {
    try {
      const searchQuery = query.trim();

      const response = await axiosInstance.get(
        endpoints.customer.search,
        {
          params: {
            q: searchQuery,
          },
        }
      );

      return response.data.data || [];
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to search customers"
      );
    }
  }
);


// ============================================================
// GET BRANCHES
// ============================================================

export const fetchBranches = createAsyncThunk<
  Branch[],
  string,
  { rejectValue: string }
>(
  "reservation/fetchBranches",

  async (restaurantId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(
        endpoints.branch.getByRestaurant(restaurantId)
      );

      return response.data.data || [];
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to fetch branches"
      );
    }
  }
);


// ============================================================
// CHECK AVAILABILITY
// ============================================================

export const checkReservationAvailability =
  createAsyncThunk<
    AvailableTable[],
    {
      branchId: string;
      reservationDate: string;
      startTime: string;
      endTime: string;
      guestCount: number;
    },
    { rejectValue: string }
  >(
    "reservation/checkAvailability",

    async (params, thunkAPI) => {
      try {
        const response = await axiosInstance.get(
          endpoints.reservation.checkAvailability(
            params.branchId
          ),
          {
            params: {
              reservationDate:
                params.reservationDate,

              startTime: params.startTime,

              endTime: params.endTime,

              guestCount:
                params.guestCount,
            },
          }
        );

        return response.data.data?.tables || [];
      } catch (error: unknown) {
        const message = axios.isAxiosError<{
          message?: string;
        }>(error)
          ? error.response?.data?.message
          : undefined;

        return thunkAPI.rejectWithValue(
          message || "Failed to check availability"
        );
      }
    }
  );


// ============================================================
// CREATE
// ============================================================

export const createReservation = createAsyncThunk<
  Reservation,
  {
    branchId: string;
    data: ReservationFormData;
  },
  { rejectValue: string }
>(
  "reservation/createReservation",

  async ({ branchId, data }, thunkAPI) => {
    try {
      const response =
        await axiosInstance.post(
          endpoints.reservation.create(branchId),
          data
        );

      return response.data.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to create reservation"
      );
    }
  }
);


// ============================================================
// UPDATE
// ============================================================

export const updateReservation = createAsyncThunk<
  Reservation,
  {
    id: string;
    data: Partial<ReservationFormData>;
  },
  { rejectValue: string }
>(
  "reservation/updateReservation",

  async ({ id, data }, thunkAPI) => {
    try {
      const response =
        await axiosInstance.patch(
          endpoints.reservation.update(id),
          data
        );

      return response.data.data;
    } catch (error: unknown) {
      const message = axios.isAxiosError<{
        message?: string;
      }>(error)
        ? error.response?.data?.message
        : undefined;

      return thunkAPI.rejectWithValue(
        message || "Failed to update reservation"
      );
    }
  }
);


// ============================================================
// CONFIRM
// ============================================================

export const confirmReservation =
  createAsyncThunk<
    Reservation,
    string,
    { rejectValue: string }
  >(
    "reservation/confirmReservation",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.reservation.confirm(id)
          );

        return response.data.data;
      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to confirm reservation"
        );
      }
    }
  );


// ============================================================
// CANCEL / REJECT
// ============================================================

export const cancelReservation =
  createAsyncThunk<
    Reservation,
    string,
    { rejectValue: string }
  >(
    "reservation/cancelReservation",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.reservation.cancel(id)
          );

        return response.data.data;
      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to cancel reservation"
        );
      }
    }
  );


// ============================================================
// COMPLETE
// ============================================================

export const completeReservation =
  createAsyncThunk<
    Reservation,
    string,
    { rejectValue: string }
  >(
    "reservation/completeReservation",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.reservation.complete(id)
          );

        return response.data.data;
      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to complete reservation"
        );
      }
    }
  );


// ============================================================
// NO SHOW
// ============================================================

export const markReservationNoShow =
  createAsyncThunk<
    Reservation,
    string,
    { rejectValue: string }
  >(
    "reservation/markNoShow",

    async (id, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.reservation.noShow(id)
          );

        return response.data.data;
      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to mark reservation as no-show"
        );
      }
    }
  );


// ============================================================
// ASSIGN TABLE
// ============================================================

export const assignReservationTable =
  createAsyncThunk<
    Reservation,
    {
      id: string;
      tableId: string;
    },
    { rejectValue: string }
  >(
    "reservation/assignTable",

    async ({ id, tableId }, thunkAPI) => {
      try {
        const response =
          await axiosInstance.patch(
            endpoints.reservation.assignTable(id),
            {
              tableId,
            }
          );

        return response.data.data;
      } catch (error: unknown) {
        const message =
          axios.isAxiosError<{
            message?: string;
          }>(error)
            ? error.response?.data?.message
            : undefined;

        return thunkAPI.rejectWithValue(
          message ||
            "Failed to assign table"
        );
      }
    }
  );


// ============================================================
// SLICE
// ============================================================

const reservationSlice = createSlice({
  name: "reservation",

  initialState,

  reducers: {
    clearReservationError: (state) => {
      state.error = null;
    },

    clearCustomers: (state) => {
      state.customers = [];
      state.customerError = null;
    },

    clearAvailableTables: (state) => {
      state.availableTables = [];
    },

    clearSelectedReservation: (state) => {
      state.selectedReservation = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // --------------------------------------------------------
      // FETCH RESERVATIONS
      // --------------------------------------------------------

      .addCase(
        fetchReservations.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchReservations.fulfilled,
        (state, action) => {
          state.loading = false;

          state.reservations =
            action.payload.data || [];

          state.pagination =
            action.payload.pagination ||
            initialState.pagination;

          if (action.payload.stats) {
            state.stats = action.payload.stats;
          }
        }
      )

      .addCase(
        fetchReservations.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch reservations";
        }
      )

      .addCase(fetchAdminReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
        if (action.payload.stats) state.stats = action.payload.stats;
      })
      .addCase(fetchAdminReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reservations";
      })

      // --------------------------------------------------------
      // GET BY ID
      // --------------------------------------------------------

      .addCase(
        fetchReservationById.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        fetchReservationById.fulfilled,
        (state, action) => {
          state.actionLoading = false;

          state.selectedReservation =
            action.payload;
        }
      )

      .addCase(
        fetchReservationById.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch reservation";
        }
      )

      // --------------------------------------------------------
      // CUSTOMERS
      // --------------------------------------------------------

      .addCase(
        searchCustomers.pending,
        (state) => {
          state.customerLoading = true;
          state.customerError = null;
        }
      )

      .addCase(
        searchCustomers.fulfilled,
        (state, action) => {
          state.customerLoading = false;

          state.customers =
            action.payload;
        }
      )

      .addCase(
        searchCustomers.rejected,
        (state, action) => {
          state.customerLoading = false;

          state.customerError =
            action.payload ||
            "Failed to search customers";
        }
      )

      // --------------------------------------------------------
      // BRANCHES
      // --------------------------------------------------------

      .addCase(
        fetchBranches.pending,
        (state) => {
          state.branchLoading = true;
        }
      )

      .addCase(
        fetchBranches.fulfilled,
        (state, action) => {
          state.branchLoading = false;

          state.branches =
            action.payload;
        }
      )

      .addCase(
        fetchBranches.rejected,
        (state) => {
          state.branchLoading = false;
        }
      )

      // --------------------------------------------------------
      // AVAILABILITY
      // --------------------------------------------------------

      .addCase(
        checkReservationAvailability.pending,
        (state) => {
          state.availabilityLoading = true;
        }
      )

      .addCase(
        checkReservationAvailability.fulfilled,
        (state, action) => {
          state.availabilityLoading = false;

          state.availableTables =
            action.payload;
        }
      )

      .addCase(
        checkReservationAvailability.rejected,
        (state, action) => {
          state.availabilityLoading = false;

          state.error =
            action.payload ||
            "Failed to check availability";
        }
      )

      // --------------------------------------------------------
      // CREATE
      // --------------------------------------------------------

      .addCase(
        createReservation.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        createReservation.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        createReservation.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to create reservation";
        }
      )

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      .addCase(
        updateReservation.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        updateReservation.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        updateReservation.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to update reservation";
        }
      )

      // --------------------------------------------------------
      // CONFIRM
      // --------------------------------------------------------

      .addCase(
        confirmReservation.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        confirmReservation.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        confirmReservation.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to confirm reservation";
        }
      )

      // --------------------------------------------------------
      // CANCEL
      // --------------------------------------------------------

      .addCase(
        cancelReservation.pending,
        (state) => {
          state.actionLoading = true;
        }
      )

      .addCase(
        cancelReservation.fulfilled,
        (state) => {
          state.actionLoading = false;
        }
      )

      .addCase(
        cancelReservation.rejected,
        (state, action) => {
          state.actionLoading = false;

          state.error =
            action.payload ||
            "Failed to cancel reservation";
        }
      );
  },
});

export const {
  clearReservationError,
  clearCustomers,
  clearAvailableTables,
  clearSelectedReservation,
} = reservationSlice.actions;

export default reservationSlice.reducer;
"use client";

import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";


// ============================================================
// TYPES
// ============================================================

export interface AnalyticsFilters {
  restaurantId?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}


// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardSummary {
  restaurants: number;
  branches: number;
  customers: number;
  activeMenuItems: number;
  tables: number;
  lowStockItems: number;
}

export interface DashboardOrders {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
  averageOrderValue: string;

  statusDistribution: {
    _id: string;
    count: number;
  }[];
}

export interface DashboardReservations {
  totalReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  noShowReservations: number;
  totalGuests: number;
  averageGuests: string;
}

export interface DashboardReviews {
  totalReviews: number;
  averageRating: string;

  ratingDistribution: {
    _id: number;
    count: number;
  }[];
}

export interface DashboardInventory {
  stockInQuantity: number;
  stockOutQuantity: number;
  wastageQuantity: number;

  stockInTransactions: number;
  stockOutTransactions: number;
  wastageTransactions: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  orders: DashboardOrders;
  reservations: DashboardReservations;
  reviews: DashboardReviews;
  inventory: DashboardInventory;
}


// ============================================================
// REVENUE TYPES
// ============================================================

export interface RevenueAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalTax: number;
  averageOrderValue: number;
  minimumOrderValue: number;
  maximumOrderValue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  discount: number;
  tax: number;
}

export interface WeeklyRevenue {
  year: number;
  week: number;
  revenue: number;
  orders: number;
  discount: number;
  tax: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  orders: number;
  discount: number;
  tax: number;
}

export interface YearlyRevenue {
  year: number;
  revenue: number;
  orders: number;
  discount: number;
  tax: number;
}

export interface RevenueByBranch {
  branchId: string;
  branchName: string;
  branchCode: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface RevenueByPaymentMethod {
  paymentMethod: string;
  revenue: number;
  orders: number;
}

export interface RevenueComparison {
  current: {
    revenue: number;
    orders: number;
  };

  previous: {
    revenue: number;
    orders: number;
  };

  revenueGrowthPercentage: string;
}


// ============================================================
// ORDER TYPES
// ============================================================

export interface OrderAnalytics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paidOrders: number;
  failedPayments: number;
  refundedOrders: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
}

export interface PaymentStatusDistribution {
  paymentStatus: string;
  count: number;
  amount: number;
}

export interface PeakOrderHour {
  hour: number;
  orders: number;
  revenue: number;
}

export interface DailyOrderTrend {
  date: string;
  orders: number;
  completed: number;
  cancelled: number;
  revenue: number;
}


// ============================================================
// API RESPONSE
// ============================================================

interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}


// ============================================================
// INITIAL STATE
// ============================================================

interface AnalyticsState {
  // Dashboard
  dashboard: DashboardData | null;

  // Summary
  summary: any | null;

  // Revenue
  revenue: RevenueAnalytics | null;

  dailyRevenue: DailyRevenue[];
  weeklyRevenue: WeeklyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  yearlyRevenue: YearlyRevenue[];

  revenueByBranch: RevenueByBranch[];

  revenueByPaymentMethod: RevenueByPaymentMethod[];

  revenueComparison: RevenueComparison | null;

  // Orders
  orders: OrderAnalytics | null;

  orderStatus: OrderStatusDistribution[];

  paymentStatus: PaymentStatusDistribution[];

  peakOrderHours: PeakOrderHour[];

  dailyOrderTrends: DailyOrderTrend[];

  // Loading
  dashboardLoading: boolean;

  summaryLoading: boolean;

  revenueLoading: boolean;

  dailyRevenueLoading: boolean;

  weeklyRevenueLoading: boolean;

  monthlyRevenueLoading: boolean;

  yearlyRevenueLoading: boolean;

  revenueByBranchLoading: boolean;

  revenueByPaymentMethodLoading: boolean;

  revenueComparisonLoading: boolean;

  ordersLoading: boolean;

  orderStatusLoading: boolean;

  paymentStatusLoading: boolean;

  peakOrderHoursLoading: boolean;

  dailyOrderTrendsLoading: boolean;

  // Error
  error: string | null;
}

const initialState: AnalyticsState = {
  // Dashboard
  dashboard: null,

  // Summary
  summary: null,

  // Revenue
  revenue: null,

  dailyRevenue: [],
  weeklyRevenue: [],
  monthlyRevenue: [],
  yearlyRevenue: [],

  revenueByBranch: [],

  revenueByPaymentMethod: [],

  revenueComparison: null,

  // Orders
  orders: null,

  orderStatus: [],

  paymentStatus: [],

  peakOrderHours: [],

  dailyOrderTrends: [],

  // Loading
  dashboardLoading: false,

  summaryLoading: false,

  revenueLoading: false,

  dailyRevenueLoading: false,

  weeklyRevenueLoading: false,

  monthlyRevenueLoading: false,

  yearlyRevenueLoading: false,

  revenueByBranchLoading: false,

  revenueByPaymentMethodLoading: false,

  revenueComparisonLoading: false,

  ordersLoading: false,

  orderStatusLoading: false,

  paymentStatusLoading: false,

  peakOrderHoursLoading: false,

  dailyOrderTrendsLoading: false,

  // Error
  error: null,
};


// ============================================================
// GET DASHBOARD
// ============================================================

export const fetchDashboard = createAsyncThunk<
  ApiResponse<DashboardData>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchDashboard",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<ApiResponse<DashboardData>>(
          endpoints.analytics.dashboard,
          {
            params,
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
        message || "Failed to fetch dashboard analytics"
      );
    }
  }
);


// ============================================================
// GET SUMMARY
// ============================================================

export const fetchSummary = createAsyncThunk<
  ApiResponse<any>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchSummary",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<ApiResponse<any>>(
          endpoints.analytics.summary,
          {
            params,
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
        message || "Failed to fetch analytics summary"
      );
    }
  }
);


// ============================================================
// GET REVENUE ANALYTICS
// ============================================================

export const fetchRevenue = createAsyncThunk<
  ApiResponse<RevenueAnalytics>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchRevenue",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<RevenueAnalytics>
        >(
          endpoints.analytics.revenue,
          {
            params,
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
        message || "Failed to fetch revenue analytics"
      );
    }
  }
);


// ============================================================
// GET DAILY REVENUE
// ============================================================

export const fetchDailyRevenue = createAsyncThunk<
  ApiResponse<DailyRevenue[]>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchDailyRevenue",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<DailyRevenue[]>
        >(
          endpoints.analytics.dailyRevenue,
          {
            params,
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
        message || "Failed to fetch daily revenue"
      );
    }
  }
);


// ============================================================
// GET WEEKLY REVENUE
// ============================================================

export const fetchWeeklyRevenue = createAsyncThunk<
  ApiResponse<WeeklyRevenue[]>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchWeeklyRevenue",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<WeeklyRevenue[]>
        >(
          endpoints.analytics.weeklyRevenue,
          {
            params,
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
        message || "Failed to fetch weekly revenue"
      );
    }
  }
);


// ============================================================
// GET MONTHLY REVENUE
// ============================================================

export const fetchMonthlyRevenue = createAsyncThunk<
  ApiResponse<MonthlyRevenue[]>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchMonthlyRevenue",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<MonthlyRevenue[]>
        >(
          endpoints.analytics.monthlyRevenue,
          {
            params,
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
        message || "Failed to fetch monthly revenue"
      );
    }
  }
);


// ============================================================
// GET YEARLY REVENUE
// ============================================================

export const fetchYearlyRevenue = createAsyncThunk<
  ApiResponse<YearlyRevenue[]>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchYearlyRevenue",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<YearlyRevenue[]>
        >(
          endpoints.analytics.yearlyRevenue,
          {
            params,
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
        message || "Failed to fetch yearly revenue"
      );
    }
  }
);


// ============================================================
// GET REVENUE BY BRANCH
// ============================================================

export const fetchRevenueByBranch = createAsyncThunk<
  ApiResponse<RevenueByBranch[]>,
  Omit<AnalyticsFilters, "branchId"> | undefined,
  { rejectValue: string }
>(
  "analytics/fetchRevenueByBranch",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<RevenueByBranch[]>
        >(
          endpoints.analytics.revenueByBranch,
          {
            params,
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
        message || "Failed to fetch branch revenue"
      );
    }
  }
);


// ============================================================
// GET REVENUE BY PAYMENT METHOD
// ============================================================

export const fetchRevenueByPaymentMethod =
  createAsyncThunk<
    ApiResponse<RevenueByPaymentMethod[]>,
    AnalyticsFilters | undefined,
    { rejectValue: string }
  >(
    "analytics/fetchRevenueByPaymentMethod",

    async (params = {}, thunkAPI) => {
      try {
        const response =
          await axiosInstance.get<
            ApiResponse<RevenueByPaymentMethod[]>
          >(
            endpoints.analytics.revenueByPaymentMethod,
            {
              params,
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
          message ||
            "Failed to fetch payment method revenue"
        );
      }
    }
  );


// ============================================================
// GET REVENUE COMPARISON
// ============================================================

export const fetchRevenueComparison =
  createAsyncThunk<
    ApiResponse<RevenueComparison>,
    AnalyticsFilters,
    { rejectValue: string }
  >(
    "analytics/fetchRevenueComparison",

    async (params, thunkAPI) => {
      try {
        const response =
          await axiosInstance.get<
            ApiResponse<RevenueComparison>
          >(
            endpoints.analytics.revenueComparison,
            {
              params,
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
          message ||
            "Failed to fetch revenue comparison"
        );
      }
    }
  );


// ============================================================
// GET ORDER ANALYTICS
// ============================================================

export const fetchOrderAnalytics = createAsyncThunk<
  ApiResponse<OrderAnalytics>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchOrderAnalytics",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<OrderAnalytics>
        >(
          endpoints.analytics.orders,
          {
            params,
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
        message || "Failed to fetch order analytics"
      );
    }
  }
);


// ============================================================
// GET ORDER STATUS
// ============================================================

export const fetchOrderStatus = createAsyncThunk<
  ApiResponse<OrderStatusDistribution[]>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchOrderStatus",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<OrderStatusDistribution[]>
        >(
          endpoints.analytics.orderStatus,
          {
            params,
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
        message || "Failed to fetch order status"
      );
    }
  }
);


// ============================================================
// GET PAYMENT STATUS
// ============================================================

export const fetchPaymentStatus = createAsyncThunk<
  ApiResponse<PaymentStatusDistribution[]>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchPaymentStatus",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<PaymentStatusDistribution[]>
        >(
          endpoints.analytics.paymentStatus,
          {
            params,
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
        message ||
          "Failed to fetch payment status"
      );
    }
  }
);


// ============================================================
// GET PEAK ORDER HOURS
// ============================================================

export const fetchPeakOrderHours = createAsyncThunk<
  ApiResponse<PeakOrderHour[]>,
  AnalyticsFilters | undefined,
  { rejectValue: string }
>(
  "analytics/fetchPeakOrderHours",

  async (params = {}, thunkAPI) => {
    try {
      const response =
        await axiosInstance.get<
          ApiResponse<PeakOrderHour[]>
        >(
          endpoints.analytics.peakOrderHours,
          {
            params,
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
        message ||
          "Failed to fetch peak order hours"
      );
    }
  }
);


// ============================================================
// GET DAILY ORDER TRENDS
// ============================================================

export const fetchDailyOrderTrends =
  createAsyncThunk<
    ApiResponse<DailyOrderTrend[]>,
    AnalyticsFilters | undefined,
    { rejectValue: string }
  >(
    "analytics/fetchDailyOrderTrends",

    async (params = {}, thunkAPI) => {
      try {
        const response =
          await axiosInstance.get<
            ApiResponse<DailyOrderTrend[]>
          >(
            endpoints.analytics.dailyOrderTrends,
            {
              params,
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
          message ||
            "Failed to fetch daily order trends"
        );
      }
    }
  );


// ============================================================
// SLICE
// ============================================================

const analyticsSlice = createSlice({
  name: "analytics",

  initialState,

  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },

    clearAnalytics: (state) => {
      state.dashboard = null;

      state.summary = null;

      state.revenue = null;

      state.dailyRevenue = [];
      state.weeklyRevenue = [];
      state.monthlyRevenue = [];
      state.yearlyRevenue = [];

      state.revenueByBranch = [];

      state.revenueByPaymentMethod = [];

      state.revenueComparison = null;

      state.orders = null;

      state.orderStatus = [];

      state.paymentStatus = [];

      state.peakOrderHours = [];

      state.dailyOrderTrends = [];

      state.error = null;
    },
  },

  extraReducers: (builder) => {

    // ========================================================
    // DASHBOARD
    // ========================================================

    builder
      .addCase(
        fetchDashboard.pending,
        (state) => {
          state.dashboardLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchDashboard.fulfilled,
        (state, { payload }) => {
          state.dashboardLoading = false;

          if (payload.status) {
            state.dashboard = payload.data;
          }
        }
      )

      .addCase(
        fetchDashboard.rejected,
        (state, action) => {
          state.dashboardLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch dashboard analytics";
        }
      );


    // ========================================================
    // SUMMARY
    // ========================================================

    builder
      .addCase(
        fetchSummary.pending,
        (state) => {
          state.summaryLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchSummary.fulfilled,
        (state, { payload }) => {
          state.summaryLoading = false;

          if (payload.status) {
            state.summary = payload.data;
          }
        }
      )

      .addCase(
        fetchSummary.rejected,
        (state, action) => {
          state.summaryLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch summary";
        }
      );


    // ========================================================
    // REVENUE
    // ========================================================

    builder
      .addCase(
        fetchRevenue.pending,
        (state) => {
          state.revenueLoading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchRevenue.fulfilled,
        (state, { payload }) => {
          state.revenueLoading = false;

          if (payload.status) {
            state.revenue = payload.data;
          }
        }
      )

      .addCase(
        fetchRevenue.rejected,
        (state, action) => {
          state.revenueLoading = false;

          state.error =
            action.payload ||
            "Failed to fetch revenue";
        }
      );


    // ========================================================
    // DAILY REVENUE
    // ========================================================

    builder
      .addCase(
        fetchDailyRevenue.pending,
        (state) => {
          state.dailyRevenueLoading = true;
        }
      )

      .addCase(
        fetchDailyRevenue.fulfilled,
        (state, { payload }) => {
          state.dailyRevenueLoading = false;

          if (payload.status) {
            state.dailyRevenue = payload.data;
          }
        }
      )

      .addCase(
        fetchDailyRevenue.rejected,
        (state) => {
          state.dailyRevenueLoading = false;
        }
      );


    // ========================================================
    // WEEKLY REVENUE
    // ========================================================

    builder
      .addCase(
        fetchWeeklyRevenue.pending,
        (state) => {
          state.weeklyRevenueLoading = true;
        }
      )

      .addCase(
        fetchWeeklyRevenue.fulfilled,
        (state, { payload }) => {
          state.weeklyRevenueLoading = false;

          if (payload.status) {
            state.weeklyRevenue = payload.data;
          }
        }
      )

      .addCase(
        fetchWeeklyRevenue.rejected,
        (state) => {
          state.weeklyRevenueLoading = false;
        }
      );


    // ========================================================
    // MONTHLY REVENUE
    // ========================================================

    builder
      .addCase(
        fetchMonthlyRevenue.pending,
        (state) => {
          state.monthlyRevenueLoading = true;
        }
      )

      .addCase(
        fetchMonthlyRevenue.fulfilled,
        (state, { payload }) => {
          state.monthlyRevenueLoading = false;

          if (payload.status) {
            state.monthlyRevenue = payload.data;
          }
        }
      )

      .addCase(
        fetchMonthlyRevenue.rejected,
        (state) => {
          state.monthlyRevenueLoading = false;
        }
      );


    // ========================================================
    // YEARLY REVENUE
    // ========================================================

    builder
      .addCase(
        fetchYearlyRevenue.pending,
        (state) => {
          state.yearlyRevenueLoading = true;
        }
      )

      .addCase(
        fetchYearlyRevenue.fulfilled,
        (state, { payload }) => {
          state.yearlyRevenueLoading = false;

          if (payload.status) {
            state.yearlyRevenue = payload.data;
          }
        }
      )

      .addCase(
        fetchYearlyRevenue.rejected,
        (state) => {
          state.yearlyRevenueLoading = false;
        }
      );


    // ========================================================
    // REVENUE BY BRANCH
    // ========================================================

    builder
      .addCase(
        fetchRevenueByBranch.pending,
        (state) => {
          state.revenueByBranchLoading = true;
        }
      )

      .addCase(
        fetchRevenueByBranch.fulfilled,
        (state, { payload }) => {
          state.revenueByBranchLoading = false;

          if (payload.status) {
            state.revenueByBranch = payload.data;
          }
        }
      )

      .addCase(
        fetchRevenueByBranch.rejected,
        (state) => {
          state.revenueByBranchLoading = false;
        }
      );


    // ========================================================
    // REVENUE BY PAYMENT METHOD
    // ========================================================

    builder
      .addCase(
        fetchRevenueByPaymentMethod.pending,
        (state) => {
          state.revenueByPaymentMethodLoading =
            true;
        }
      )

      .addCase(
        fetchRevenueByPaymentMethod.fulfilled,
        (state, { payload }) => {
          state.revenueByPaymentMethodLoading =
            false;

          if (payload.status) {
            state.revenueByPaymentMethod =
              payload.data;
          }
        }
      )

      .addCase(
        fetchRevenueByPaymentMethod.rejected,
        (state) => {
          state.revenueByPaymentMethodLoading =
            false;
        }
      );


    // ========================================================
    // REVENUE COMPARISON
    // ========================================================

    builder
      .addCase(
        fetchRevenueComparison.pending,
        (state) => {
          state.revenueComparisonLoading =
            true;
        }
      )

      .addCase(
        fetchRevenueComparison.fulfilled,
        (state, { payload }) => {
          state.revenueComparisonLoading =
            false;

          if (payload.status) {
            state.revenueComparison =
              payload.data;
          }
        }
      )

      .addCase(
        fetchRevenueComparison.rejected,
        (state) => {
          state.revenueComparisonLoading =
            false;
        }
      );


    // ========================================================
    // ORDER ANALYTICS
    // ========================================================

    builder
      .addCase(
        fetchOrderAnalytics.pending,
        (state) => {
          state.ordersLoading = true;
        }
      )

      .addCase(
        fetchOrderAnalytics.fulfilled,
        (state, { payload }) => {
          state.ordersLoading = false;

          if (payload.status) {
            state.orders = payload.data;
          }
        }
      )

      .addCase(
        fetchOrderAnalytics.rejected,
        (state) => {
          state.ordersLoading = false;
        }
      );


    // ========================================================
    // ORDER STATUS
    // ========================================================

    builder
      .addCase(
        fetchOrderStatus.pending,
        (state) => {
          state.orderStatusLoading = true;
        }
      )

      .addCase(
        fetchOrderStatus.fulfilled,
        (state, { payload }) => {
          state.orderStatusLoading = false;

          if (payload.status) {
            state.orderStatus = payload.data;
          }
        }
      )

      .addCase(
        fetchOrderStatus.rejected,
        (state) => {
          state.orderStatusLoading = false;
        }
      );


    // ========================================================
    // PAYMENT STATUS
    // ========================================================

    builder
      .addCase(
        fetchPaymentStatus.pending,
        (state) => {
          state.paymentStatusLoading = true;
        }
      )

      .addCase(
        fetchPaymentStatus.fulfilled,
        (state, { payload }) => {
          state.paymentStatusLoading = false;

          if (payload.status) {
            state.paymentStatus = payload.data;
          }
        }
      )

      .addCase(
        fetchPaymentStatus.rejected,
        (state) => {
          state.paymentStatusLoading = false;
        }
      );


    // ========================================================
    // PEAK ORDER HOURS
    // ========================================================

    builder
      .addCase(
        fetchPeakOrderHours.pending,
        (state) => {
          state.peakOrderHoursLoading = true;
        }
      )

      .addCase(
        fetchPeakOrderHours.fulfilled,
        (state, { payload }) => {
          state.peakOrderHoursLoading = false;

          if (payload.status) {
            state.peakOrderHours = payload.data;
          }
        }
      )

      .addCase(
        fetchPeakOrderHours.rejected,
        (state) => {
          state.peakOrderHoursLoading = false;
        }
      );


    // ========================================================
    // DAILY ORDER TRENDS
    // ========================================================

    builder
      .addCase(
        fetchDailyOrderTrends.pending,
        (state) => {
          state.dailyOrderTrendsLoading = true;
        }
      )

      .addCase(
        fetchDailyOrderTrends.fulfilled,
        (state, { payload }) => {
          state.dailyOrderTrendsLoading =
            false;

          if (payload.status) {
            state.dailyOrderTrends =
              payload.data;
          }
        }
      )

      .addCase(
        fetchDailyOrderTrends.rejected,
        (state) => {
          state.dailyOrderTrendsLoading =
            false;
        }
      );
  },
});


// ============================================================
// EXPORT ACTIONS
// ============================================================

export const {
  clearAnalyticsError,
  clearAnalytics,
} = analyticsSlice.actions;


// ============================================================
// EXPORT REDUCER
// ============================================================

export default analyticsSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";


import type {
  AverageRating,
  RatingDistributionItem,
  Review,
  ReviewFilters,
  ReviewListResponse,
  ReviewState,
} from "@/types/review";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

type ApiError = { message?: string };

const initialState: ReviewState = {
  reviews: [],
  selectedReview: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  averageRating: null,
  ratingDistribution: [],
  loading: false,
  actionLoading: false,
  error: null,
};

function getErrorMessage(error: unknown) {
  const apiError = error as {
    response?: { data?: ApiError };
    message?: string;
  };

  return (
    apiError.response?.data?.message ||
    apiError.message ||
    "Something went wrong."
  );
}

export const fetchReviews = createAsyncThunk<
  ReviewListResponse,
  ReviewFilters,
  { rejectValue: string }
>("reviews/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    const params: Record<string, string | number> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.status) params.status = filters.status;
    if (filters.rating) params.rating = filters.rating;
    if (filters.restaurant) params.restaurant = filters.restaurant;
    if (filters.branch) params.branch = filters.branch;

    const response = await AxiosInstance.get(endpoints.review.getAll, {
      params,
    });

    return {
      data: response.data.data ?? [],
      pagination: response.data.pagination ?? {
        total: 0,
        page: filters.page,
        limit: filters.limit,
        totalPages: 0,
      },
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchReviewById = createAsyncThunk<
  Review,
  string,
  { rejectValue: string }
>("reviews/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await AxiosInstance.get(endpoints.review.getById(id));
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchReviewStatistics = createAsyncThunk<
  {
    averageRating: AverageRating;
    ratingDistribution: RatingDistributionItem[];
  },
  string,
  { rejectValue: string }
>("reviews/fetchStatistics", async (restaurantId, { rejectWithValue }) => {
  try {
    const [averageResponse, distributionResponse] = await Promise.all([
      AxiosInstance.get(endpoints.review.averageRating(restaurantId)),
      AxiosInstance.get(endpoints.review.ratingDistribution(restaurantId)),
    ]);

    return {
      averageRating: averageResponse.data.data ?? {
        averageRating: 0,
        totalReviews: 0,
      },
      ratingDistribution: distributionResponse.data.data ?? [],
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const approveReview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("reviews/approve", async (id, { rejectWithValue }) => {
  try {
    await AxiosInstance.patch(endpoints.review.approve(id));
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const rejectReview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("reviews/reject", async (id, { rejectWithValue }) => {
  try {
    await AxiosInstance.patch(endpoints.review.reject(id));
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const softDeleteReview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("reviews/softDelete", async (id, { rejectWithValue }) => {
  try {
    await AxiosInstance.delete(endpoints.review.softDelete(id));
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const restoreReview = createAsyncThunk<
  Review,
  string,
  { rejectValue: string }
>("reviews/restore", async (id, { rejectWithValue }) => {
  try {
    const response = await AxiosInstance.patch(endpoints.review.restore(id));
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const hardDeleteReview = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("reviews/hardDelete", async (id, { rejectWithValue }) => {
  try {
    await AxiosInstance.delete(endpoints.review.hardDelete(id));
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearSelectedReview(state) {
      state.selectedReview = null;
    },
    clearReviewError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load reviews.";
      })

      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.selectedReview = action.payload;
      })

      .addCase(fetchReviewStatistics.fulfilled, (state, action) => {
        state.averageRating = action.payload.averageRating;
        state.ratingDistribution = action.payload.ratingDistribution;
      })

      .addCase(approveReview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(approveReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        const review = state.reviews.find(
          (item) => item._id === action.payload
        );
        if (review) review.status = "approved";
        if (state.selectedReview?._id === action.payload) {
          state.selectedReview.status = "approved";
        }
      })
      .addCase(approveReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to approve review.";
      })

      .addCase(rejectReview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(rejectReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        const review = state.reviews.find(
          (item) => item._id === action.payload
        );
        if (review) review.status = "rejected";
        if (state.selectedReview?._id === action.payload) {
          state.selectedReview.status = "rejected";
        }
      })
      .addCase(rejectReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to reject review.";
      })

      .addCase(softDeleteReview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(softDeleteReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reviews = state.reviews.filter(
          (item) => item._id !== action.payload
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.selectedReview?._id === action.payload) {
          state.selectedReview = null;
        }
      })
      .addCase(softDeleteReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to delete review.";
      })

      .addCase(restoreReview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(restoreReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reviews = state.reviews.filter(
          (item) => item._id !== action.payload._id
        );
      })
      .addCase(restoreReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to restore review.";
      })

      .addCase(hardDeleteReview.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(hardDeleteReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.reviews = state.reviews.filter(
          (item) => item._id !== action.payload
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.selectedReview?._id === action.payload) {
          state.selectedReview = null;
        }
      })
      .addCase(hardDeleteReview.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? "Failed to permanently delete review.";
      });
  },
});

export const { clearSelectedReview, clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
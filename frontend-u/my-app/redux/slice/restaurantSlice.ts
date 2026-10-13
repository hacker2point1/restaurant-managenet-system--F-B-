import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

export interface RestaurantImage {
  url: string;
  publicId?: string;
}

export interface RestaurantAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  address?: RestaurantAddress;
  cuisineTypes?: string[];
  logo?: string;
  website?: string;
  images?: RestaurantImage[];
  createdAt?: string;
}

export interface RestaurantPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RestaurantApiResponse {
  status: boolean;
  message: string;
  data: Restaurant[];
  pagination: RestaurantPagination;
  filters?: {
    cuisines: string[];
  };
}

interface FetchRestaurantsArgs {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  sort?: "newest" | "name";
}

interface FetchRestaurantsResult {
  restaurants: Restaurant[];
  pagination: RestaurantPagination;
  cuisines: string[];
}

interface RestaurantState {
  restaurants: Restaurant[];
  pagination: RestaurantPagination;
  cuisines: string[];
  loading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  restaurants: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0,
  },
  cuisines: [],
  loading: false,
  error: null,
};

export const fetchPublicRestaurants = createAsyncThunk<
  FetchRestaurantsResult,
  FetchRestaurantsArgs,
  { rejectValue: string }
>(
  "restaurants/fetchPublicRestaurants",
  async (
    {
      page = 1,
      limit = 9,
      search = "",
      cuisine = "",
      sort = "newest",
    },
    { rejectWithValue }
  ) => {
    try {
      const response =
        await AxiosInstance.get<RestaurantApiResponse>(
          endpoints.restaurant.getPublicList,
          {
            params: {
              page,
              limit,
              search: search.trim(),
              cuisine,
              sort,
            },
          }
        );

      if (!response.data.status) {
        return rejectWithValue(
          response.data.message || "Failed to fetch restaurants."
        );
      }

      return {
        restaurants: response.data.data,
        pagination: response.data.pagination,
        cuisines: response.data.filters?.cuisines ?? [],
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as
          | { message?: string }
          | undefined;

        return rejectWithValue(
          responseData?.message ||
            error.message ||
            "Failed to fetch restaurants."
        );
      }

      return rejectWithValue("Something went wrong.");
    }
  }
);

const restaurantSlice = createSlice({
  name: "restaurants",
  initialState,
  reducers: {
    clearRestaurantError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload.restaurants;
        state.pagination = action.payload.pagination;
        state.cuisines = action.payload.cuisines;
      })
      .addCase(fetchPublicRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Failed to fetch restaurants.";
      });
  },
});

export const { clearRestaurantError } = restaurantSlice.actions;

export default restaurantSlice.reducer;
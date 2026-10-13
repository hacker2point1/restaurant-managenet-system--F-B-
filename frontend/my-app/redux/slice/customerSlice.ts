import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type {
  Customer,
  CustomerFormData,
  CustomerListResponse,
  CustomerQuery,
} from "@/types/customer";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

interface CustomerState {
  customers: Customer[];
  deletedCustomers: Customer[];
  selectedCustomer: Customer | null;
  pagination: CustomerListResponse["pagination"];
  deletedPagination: CustomerListResponse["pagination"];
  loading: boolean;
  deletedLoading: boolean;
  submitting: boolean;
  error: string | null;
}

const emptyPagination = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

const initialState: CustomerState = {
  customers: [],
  deletedCustomers: [],
  selectedCustomer: null,
  pagination: emptyPagination,
  deletedPagination: emptyPagination,
  loading: false,
  deletedLoading: false,
  submitting: false,
  error: null,
};

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } };
    message?: string;
  };

  return (
    err.response?.data?.message ||
    err.message ||
    "Something went wrong"
  );
}

function toPayload(data: CustomerFormData) {
  return {
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    address: {
      street: data.street.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      country: data.country.trim(),
      zipCode: data.zipCode.trim(),
    },
    loyaltyPoints: Number(data.loyaltyPoints || 0),
    isActive: data.isActive,
  };
}

export const fetchCustomers = createAsyncThunk<
  CustomerListResponse,
  CustomerQuery | undefined,
  { rejectValue: string }
>("customer/fetchCustomers", async (query = {}, { rejectWithValue }) => {
  try {
    const response = await AxiosInstance.get(
      endpoints.customer.getAll,
      {
        params: {
          page: query.page ?? 1,
          limit: query.limit ?? 10,
          ...(query.search ? { search: query.search } : {}),
          ...(query.isActive !== undefined
            ? { isActive: query.isActive }
            : {}),
        },
      }
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchDeletedCustomers = createAsyncThunk<
  CustomerListResponse,
  CustomerQuery | undefined,
  { rejectValue: string }
>(
  "customer/fetchDeletedCustomers",
  async (query = {}, { rejectWithValue }) => {
    try {
      const response = await AxiosInstance.get(
        endpoints.customer.getDeleted,
        {
          params: {
            page: query.page ?? 1,
            limit: query.limit ?? 10,
            ...(query.search ? { search: query.search } : {}),
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCustomerById = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>("customer/fetchCustomerById", async (id, { rejectWithValue }) => {
  try {
    const response = await AxiosInstance.get(
      endpoints.customer.getById(id)
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createCustomer = createAsyncThunk<
  Customer,
  CustomerFormData,
  { rejectValue: string }
>("customer/createCustomer", async (data, { rejectWithValue }) => {
  try {
    const response = await AxiosInstance.post(
      endpoints.customer.create,
      toPayload(data)
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateCustomer = createAsyncThunk<
  Customer,
  { id: string; data: CustomerFormData },
  { rejectValue: string }
>("customer/updateCustomer", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await AxiosInstance.patch(
      endpoints.customer.update(id),
      toPayload(data)
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const softDeleteCustomer = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("customer/softDeleteCustomer", async (id, { rejectWithValue }) => {
  try {
    await AxiosInstance.patch(endpoints.customer.softDelete(id));
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const restoreCustomer = createAsyncThunk<
  Customer,
  string,
  { rejectValue: string }
>("customer/restoreCustomer", async (id, { rejectWithValue }) => {
  try {
    const response = await AxiosInstance.patch(
      endpoints.customer.restore(id)
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const hardDeleteCustomer = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("customer/hardDeleteCustomer", async (id, { rejectWithValue }) => {
  try {
    await AxiosInstance.delete(endpoints.customer.hardDelete(id));
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearCustomerError(state) {
      state.error = null;
    },
    clearSelectedCustomer(state) {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch customers";
      })

      .addCase(fetchDeletedCustomers.pending, (state) => {
        state.deletedLoading = true;
        state.error = null;
      })
      .addCase(fetchDeletedCustomers.fulfilled, (state, action) => {
        state.deletedLoading = false;
        state.deletedCustomers = action.payload.data;
        state.deletedPagination = action.payload.pagination;
      })
      .addCase(fetchDeletedCustomers.rejected, (state, action) => {
        state.deletedLoading = false;
        state.error = action.payload || "Failed to fetch deleted customers";
      })

      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.selectedCustomer = action.payload;
      })

      .addCase(createCustomer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || "Failed to create customer";
      })

      .addCase(updateCustomer.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        state.customers = state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        );
        state.selectedCustomer = action.payload;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || "Failed to update customer";
      })

      .addCase(softDeleteCustomer.pending, (state) => {
        state.submitting = true;
      })
      .addCase(softDeleteCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(softDeleteCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || "Failed to delete customer";
      })

      .addCase(restoreCustomer.pending, (state) => {
        state.submitting = true;
      })
      .addCase(restoreCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        state.deletedCustomers = state.deletedCustomers.filter(
          (customer) => customer._id !== action.payload._id
        );
        state.deletedPagination.total = Math.max(
          0,
          state.deletedPagination.total - 1
        );
        state.customers.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(restoreCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || "Failed to restore customer";
      })

      .addCase(hardDeleteCustomer.pending, (state) => {
        state.submitting = true;
      })
      .addCase(hardDeleteCustomer.fulfilled, (state, action) => {
        state.submitting = false;
        state.deletedCustomers = state.deletedCustomers.filter(
          (customer) => customer._id !== action.payload
        );
        state.deletedPagination.total = Math.max(
          0,
          state.deletedPagination.total - 1
        );
      })
      .addCase(hardDeleteCustomer.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || "Failed to permanently delete customer";
      });
  },
});

export const { clearCustomerError, clearSelectedCustomer } =
  customerSlice.actions;

export default customerSlice.reducer;
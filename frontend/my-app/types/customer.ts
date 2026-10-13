export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface Customer {
  _id: string;
  user?: string | {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
  name: string;
  email?: string;
  phone?: string;
  address?: CustomerAddress;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  lastVisitAt?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  loyaltyPoints: string;
  isActive: boolean;
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CustomerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerListResponse {
  status: boolean;
  message: string;
  data: Customer[];
  pagination: CustomerPagination;
}
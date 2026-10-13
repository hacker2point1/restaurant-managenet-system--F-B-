export type UserRole =
  | "admin"
  | "manager"
  | "staff"
  | "customer";

export type UserStatus =
  | "active"
  | "inactive";

export interface UserProfileImage {
  url: string;
  publicId: string;
}

export interface User {
  _id: string;

  name: string;

  email: string;

  phone?: string;

  profileImage?: UserProfileImage;

  role: UserRole;

  isActive: boolean;

  isVerified: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
}

export interface CreateUserPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UserPagination {
  currentPage: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
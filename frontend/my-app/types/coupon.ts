export type CouponDiscountType =
  | "percentage"
  | "fixed";

export type CouponAudience =
  | "all"
  | "specific";

export type CouponAudienceFilter =
  | "all-customers"
  | "specific";

export interface CouponRestaurant {
  _id: string;
  name: string;
}

export interface CouponBranch {
  _id: string;
  name: string;
  branchCode?: string;
}

export interface CouponCustomer {
  _id: string;
  name: string;
  email?: string;
}

export interface Coupon {
  _id: string;

  restaurant:
    | CouponRestaurant
    | string;

  code: string;

  description?: string;

  discountType: CouponDiscountType;

  discountValue: number;

  minimumOrderAmount: number;

  maximumDiscountAmount?: number;

  usageLimit?: number;

  usageCount: number;

  perCustomerLimit?: number;

  applicableCustomers: CouponCustomer[];

  applicableBranches: CouponBranch[];

  startDate: string;

  expiryDate: string;

  isActive: boolean;

  isDeleted: boolean;

  deletedAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CouponQuery {
  restaurant?: string;

  branch?: string;

  isActive?: boolean;

  discountType?: CouponDiscountType;

  audience?: CouponAudienceFilter;

  search?: string;

  page?: number;

  limit?: number;
}

export interface CouponPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CouponListResponse {
  status: boolean;
  message: string;
  data: Coupon[];
  pagination: CouponPagination;
}

export interface CouponFormData {
  restaurant: string;

  code: string;

  description: string;

  discountType: CouponDiscountType;

  discountValue: string;

  minimumOrderAmount: string;

  maximumDiscountAmount: string;

  usageLimit: string;

  perCustomerLimit: string;

  startDate: string;

  expiryDate: string;

  audience: CouponAudience;

  applicableCustomers: string[];

  applicableBranches: string[];

  isActive: boolean;
}

export interface CouponSubmitData {
  restaurant: string;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  perCustomerLimit?: number;
  startDate: string;
  expiryDate: string;
  applicableBranches: string[];
  applicableCustomers: string[];
  isActive: boolean;
}
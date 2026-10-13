export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewPerson {
  _id?: string;
  name?: string;
  email?: string;
}

export interface ReviewRestaurant {
  _id?: string;
  name?: string;
}

export interface ReviewBranch {
  _id?: string;
  name?: string;
  branchCode?: string;
}

export interface ReviewMenuItem {
  _id?: string;
  name?: string;
  price?: number;
}

export interface Review {
  _id: string;
  customer?: ReviewPerson;
  restaurant?: ReviewRestaurant;
  branch?: ReviewBranch | string | null;
  menuItem?: ReviewMenuItem | null;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  moderatedBy?: ReviewPerson | null;
  moderatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
}

export interface ReviewFilters {
  page: number;
  limit: number;
  status?: ReviewStatus;
  rating?: number;
  restaurant?: string;
  branch?: string;
  search?: string;
}

export interface ReviewPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewListResponse {
  data: Review[];
  pagination: ReviewPagination;
}

export interface AverageRating {
  averageRating: number;
  totalReviews: number;
}

export interface RatingDistributionItem {
  rating: number;
  count: number;
}

export interface ReviewState {
  reviews: Review[];
  selectedReview: Review | null;
  pagination: ReviewPagination;
  averageRating: AverageRating | null;
  ratingDistribution: RatingDistributionItem[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}
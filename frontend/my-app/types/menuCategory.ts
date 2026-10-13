export interface MenuCategoryImage {
  url: string;
  publicId: string;
}

export interface MenuCategoryBranch {
  _id: string;
  name: string;
}

export interface MenuCategory {
  _id: string;
  branch: string | MenuCategoryBranch;

  name: string;
  description?: string;

  image?: MenuCategoryImage;

  displayOrder: number;

  isActive: boolean;

  isDeleted?: boolean;
  deletedAt?: string | null;

  menuItemCount?: number;

  createdAt?: string;
  updatedAt?: string;
}

export interface MenuCategoryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MenuCategoryListResponse {
  status: boolean;
  message: string;
  data: MenuCategory[];
  pagination: MenuCategoryPagination;
}

export interface MenuCategoryResponse {
  status: boolean;
  message: string;
  data: MenuCategory;
}

export interface MenuCategoryActionResponse {
  status: boolean;
  message: string;
  data?: MenuCategory;
}

export interface MenuCategoryFormValues {
  name: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
  image: File | null;
}
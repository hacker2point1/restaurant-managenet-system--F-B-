export type FoodType =
  | "vegetarian"
  | "non-vegetarian"
  | "vegan";

export interface MenuItemImage {
  url: string;
  publicId: string;
}

export interface MenuItemBranch {
  _id: string;
  name: string;
  branchCode?: string;
}

export interface MenuItemCategory {
  _id: string;
  name: string;
  description?: string;
}

export interface InventoryIngredient {
  _id: string;
  name: string;
}

export interface MenuItem {
  _id: string;

  branch: MenuItemBranch | string;

  category: MenuItemCategory | string;

  name: string;

  description?: string;

  price: number;

  ingredients: InventoryIngredient[] | string[];

  foodType: FoodType;

  tags: string[];

  images: MenuItemImage[];

  preparationTime?: number;

  isAvailable: boolean;

  isFeatured: boolean;

  averageRating: number;

  totalReviews: number;

  isDeleted: boolean;

  deletedAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface MenuItemFormData {
  name: string;

  description: string;

  price: string;

  category: string;

  foodType: FoodType;

  preparationTime: string;

  ingredients: string[];

  tags: string[];

  isAvailable: boolean;

  isFeatured: boolean;

  images: File[];
}

export interface MenuItemQuery {
  page?: number;
  limit?: number;

  search?: string;

  branchId?: string;

  category?: string;

  foodType?: FoodType;

  isAvailable?: boolean;

  isFeatured?: boolean;
}
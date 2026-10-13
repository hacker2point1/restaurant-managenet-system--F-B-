export interface RestaurantAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface RestaurantImage {
  url: string;
  publicId: string;
}

export interface Restaurant {
  _id: string;

  name: string;

  description?: string;

  email?: string;

  phone?: string;

  address?: RestaurantAddress;

  branches?: string[];

  cuisineTypes?: string[];

  logo?: string;

  website?: string;

  isActive: boolean;

  createdBy?: string;

  isDeleted: boolean;

  deletedAt?: string | null;

  images?: RestaurantImage[];

  createdAt?: string;

  updatedAt?: string;
}

export interface RestaurantsApiResponse {
  status: boolean;

  message?: string;

  source?: string;

  count?: number;

  data: Restaurant[];
}

export interface RestaurantApiResponse {
  status: boolean;

  message?: string;

  source?: string;

  data: Restaurant;
}

export interface RestaurantActionResponse {
  status: boolean;

  message?: string;

  data?: Partial<Restaurant>;
}
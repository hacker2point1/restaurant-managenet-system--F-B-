export interface BranchContact {
  phone?: string;
  email?: string;
}

export interface BranchAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface OpeningHour {
  open?: string;
  close?: string;
  isClosed?: boolean;
}

export interface BranchOpeningHours {
  monday?: OpeningHour;
  tuesday?: OpeningHour;
  wednesday?: OpeningHour;
  thursday?: OpeningHour;
  friday?: OpeningHour;
  saturday?: OpeningHour;
  sunday?: OpeningHour;
}

export interface BranchImage {
  url: string;
  publicId?: string;
}

export interface RestaurantReference {
  _id: string;
  name: string;
}

export interface Branch {
  _id: string;
  restaurant:
    | string
    | RestaurantReference;

  name: string;
  branchCode: string;

  images?: BranchImage[];

  contact?: BranchContact;

  address?: BranchAddress;

  openingHours?: BranchOpeningHours;

  isActive: boolean;
  isDeleted: boolean;

  deletedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface BranchFormData {
  name: string;
  branchCode: string;

  contact: BranchContact;

  address: BranchAddress;

  openingHours?: BranchOpeningHours;

  isActive: boolean;
}

export interface BranchStats {
  total: number;
  active: number;
  inactive: number;
  openingSoon: number;
}
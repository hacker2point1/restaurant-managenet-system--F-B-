export type InventoryUnit =
  | "kg"
  | "gram"
  | "liter"
  | "ml"
  | "piece"
  | "packet"
  | "box";

export type StockOperation =
  | "add"
  | "remove";

export interface Supplier {
  name?: string;
  phone?: string;
  email?: string;
}

export interface InventoryItem {
  _id: string;

  branch: string;

  name: string;

  sku?: string;

  unit: InventoryUnit;

  currentQuantity: number;

  minimumStock: number;

  maximumStock?: number;

  unitCost: number;

  supplier?: Supplier;

  expiryDate?: string;

  isActive: boolean;

  isDeleted: boolean;

  deletedAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface InventoryFormData {
  name: string;

  sku: string;

  unit: InventoryUnit;

  currentQuantity: string;

  minimumStock: string;

  maximumStock: string;

  unitCost: string;

  supplierName: string;

  supplierPhone: string;

  supplierEmail: string;

  expiryDate: string;

  isActive: boolean;
}

export interface InventoryQuery {
  page?: number;

  limit?: number;

  search?: string;

  isActive?: boolean;

  unit?: InventoryUnit;
}

export interface InventoryStats {
  total: number;

  inStock: number;

  lowStock: number;

  outOfStock: number;

  inventoryValue: number;
}
export type InventoryTransactionType =
  | "purchase"
  | "stock-in"
  | "stock-out"
  | "wastage"
  | "return"
  | "adjustment";

export type TransactionReferenceType =
  | "order"
  | "purchase"
  | "manual"
  | "wastage"
  | "return"
  | "other";

export interface InventoryTransactionItem {
  _id: string;
  name: string;
  sku?: string;
  unit: string;
}

export interface TransactionBranch {
  _id: string;
  name: string;
  branchCode?: string;
}

export interface TransactionPerformedBy {
  _id: string;
  name: string;
  email?: string;
}

export interface InventoryTransaction {
  _id: string;

  inventoryItem: InventoryTransactionItem;

  branch: TransactionBranch;

  type: InventoryTransactionType;

  quantity: number;

  previousQuantity: number;

  newQuantity: number;

  unitCost: number;

  referenceType?: TransactionReferenceType;

  referenceId?: string;

  reason?: string;

  performedBy: TransactionPerformedBy;

  transactionDate: string;

  createdAt: string;

  updatedAt: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  branch?: string;
  inventoryItem?: string;
  type?: InventoryTransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface TransactionPagination {
  page: number;
  limit: number;
  totalTransactions: number;
  totalPages: number;
}

export interface TransactionListResponse {
  status: boolean;
  message: string;
  pagination: TransactionPagination;
  count: number;
  data: InventoryTransaction[];
}

export interface TransactionSummary {
  totalTransactions: number;
  totalQuantity: number;
  totalTransactionValue: number;
}

export interface TransactionTypeReport {
  _id: InventoryTransactionType;
  transactionCount: number;
  totalQuantity: number;
  totalValue: number;
}

export interface TransactionReport {
  summary: TransactionSummary;
  byType: TransactionTypeReport[];
  byInventoryItem: {
    _id: string;
    itemName: string;
    sku?: string;
    unit: string;
    transactionCount: number;
    totalQuantity: number;
    totalValue: number;
  }[];
}

export interface StockInPayload {
  inventoryItem: string;
  quantity: number;
  unitCost?: number;
  reason?: string;
  referenceType?: TransactionReferenceType;
  referenceId?: string;
}

export interface StockOutPayload {
  inventoryItem: string;
  quantity: number;
  reason?: string;
  referenceType?: TransactionReferenceType;
  referenceId?: string;
}

export interface PurchasePayload {
  inventoryItem: string;
  quantity: number;
  unitCost: number;
  referenceId?: string;
  reason?: string;
}

export interface WastagePayload {
  inventoryItem: string;
  quantity: number;
  reason: string;
}

export interface ReturnPayload {
  inventoryItem: string;
  quantity: number;
  referenceId?: string;
  reason?: string;
}

export interface AdjustmentPayload {
  inventoryItem: string;
  newQuantity: number;
  reason: string;
}

export type TransactionFormPayload =
  | StockInPayload
  | StockOutPayload
  | PurchasePayload
  | WastagePayload
  | ReturnPayload
  | AdjustmentPayload;
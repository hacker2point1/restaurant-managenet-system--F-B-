export type TableStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "maintenance";

export type TableLocation =
  | "indoor"
  | "outdoor"
  | "rooftop"
  | "private"
  | "bar";

export interface Table {
  _id: string;
  branch: string | {
    _id: string;
    name: string;
    branchCode?: string;
  };
  tableNumber: string;
  capacity: number;
  location: TableLocation;
  status: TableStatus;
  isActive: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TableUtilization {
  totalTables: number;
  activeTables: number;
  availableTables: number;
  occupiedTables: number;
  reservedTables: number;
  maintenanceTables: number;
  utilizationPercentage: number;
}

export interface CreateTablePayload {
  tableNumber: string;
  capacity: number;
  location: TableLocation;
  status?: TableStatus;
  isActive?: boolean;
}

export interface UpdateTablePayload {
  tableNumber?: string;
  capacity?: number;
  location?: TableLocation;
  isActive?: boolean;
}

export interface TableState {
  tables: Table[];
  utilization: TableUtilization | null;

  selectedTable: Table | null;

  loading: boolean;
  utilizationLoading: boolean;
  actionLoading: boolean;

  error: string | null;
}
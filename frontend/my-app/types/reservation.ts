export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show";

export interface ReservationCustomer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface ReservationBranch {
  _id: string;
  name: string;
  branchCode?: string;
}

export interface ReservationTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  location?: string;
}

export interface Reservation {
  _id: string;

  reservationDate: string;

  startTime: string;

  endTime: string;

  guestCount: number;

  status: ReservationStatus;

  bookingSource?: "online" | "on-the-spot";

  specialRequest?: string;

  cancelledAt?: string | null;

  createdAt: string;

  updatedAt: string;

  customer: ReservationCustomer;

  branch: ReservationBranch;

  table: ReservationTable;
}

export interface ReservationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReservationStats {
  total: number;
  confirmed: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export interface ReservationListResponse {
  status: boolean;
  message: string;

  pagination: ReservationPagination;

  data: Reservation[];

  stats?: ReservationStats;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Branch {
  _id: string;
  name: string;
  branchCode?: string;
  isActive?: boolean;
  restaurant?: string | { _id: string; name: string };
}

export interface AvailableTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  location: string;
  status: string;
  branch?: Branch;
}

export interface AvailabilityResponse {
  available: boolean;
  availableCount: number;
  tables: AvailableTable[];
}

export interface ReservationFormData {
  branchId: string;
  customer: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  guestCount: number;
  table: string;
  specialRequest: string;
}
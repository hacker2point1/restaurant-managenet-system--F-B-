// ============================================================
// USER ROLE
// ============================================================

export type UserRole =
  | "admin"
  | "manager"
  | "staff"
  | "customer";


// ============================================================
// DASHBOARD PERIOD
// ============================================================

export type DashboardPeriod =
  | "today"
  | "week"
  | "month"
  | "year";


// ============================================================
// STAT CARD
// ============================================================

export interface DashboardStat {
  id: string;

  title: string;

  value: string | number;

  change?: number;

  changeLabel?: string;

  trend?: "up" | "down" | "neutral";

  icon:
    | "revenue"
    | "customers"
    | "reservations"
    | "lowStock"
    | "tables"
    | "menu"
    | "coupons"
    | "rating";
}


// ============================================================
// REVENUE CHART
// ============================================================

export interface RevenueChartItem {
  label: string;

  revenue: number;

  target: number;
}


// ============================================================
// TABLE STATUS
// ============================================================

export interface TableStatusItem {
  status:
    | "available"
    | "occupied"
    | "reserved"
    | "maintenance";

  count: number;
}


// ============================================================
// RESERVATION TREND
// ============================================================

export interface ReservationTrendItem {
  label: string;

  reservations: number;
}


// ============================================================
// POPULAR MENU ITEM
// ============================================================

export interface PopularMenuItem {
  _id: string;

  name: string;

  category?: string;

  image?: string;

  orders: number;

  revenue: number;
}


// ============================================================
// BRANCH
// ============================================================

export interface DashboardBranch {
  _id: string;

  name: string;

  branchCode?: string;

  restaurant?: {
    _id: string;

    name: string;
  };
}


// ============================================================
// DASHBOARD DATA
// ============================================================

export interface DashboardData {
  stats: DashboardStat[];

  revenueOverview: RevenueChartItem[];

  tableStatus: TableStatusItem[];

  reservationTrends: ReservationTrendItem[];

  popularMenuItems: PopularMenuItem[];

  branches: DashboardBranch[];

  selectedBranchId?: string;

  period: DashboardPeriod;

  lastUpdated?: string;
}


//api res

export interface DashboardApiResponse {
  status: boolean;

  message: string;

  data: DashboardData;
}
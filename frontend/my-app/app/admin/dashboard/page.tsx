"use client";

import { useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type { RootState, AppDispatch } from "@/redux/store/store";

import {
  fetchDashboard,
  fetchMonthlyRevenue,
  fetchDailyOrderTrends,
  fetchOrderStatus,
} from "@/redux/slice/analytics";
import DashboardLoading from "@/src/components/admin/dashboard/DashboardLoading";
import DashboardStats from "@/src/components/admin/dashboard/DashboardStats";
import RevenueOverview from "@/src/components/admin/dashboard/RevenueOverview";
import OrderStatusCard from "@/src/components/admin/dashboard/OrderStatusCard";
import ReservationOverview from "@/src/components/admin/dashboard/ReservationOverview";



export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const refreshInProgress = useRef(false);

  const {
    dashboard,
    monthlyRevenue,
    dailyOrderTrends,
    orderStatus,

    dashboardLoading,
    revenueLoading,
    dailyOrderTrendsLoading,
    orderStatusLoading,

    error,
  } = useSelector(
    (state: RootState) => state.analytics
  );

  const isRefreshing =
    dashboardLoading ||
    revenueLoading ||
    dailyOrderTrendsLoading ||
    orderStatusLoading;

  useEffect(() => {
    const params = {};

    dispatch(fetchDashboard(params));
    dispatch(fetchMonthlyRevenue(params));
    dispatch(fetchDailyOrderTrends(params));
    dispatch(fetchOrderStatus(params));
  }, [dispatch]);

  const handleRefresh = async () => {
    if (refreshInProgress.current || isRefreshing) {
      return;
    }

    refreshInProgress.current = true;
    const params = {};

    try {
      await Promise.all([
        dispatch(fetchDashboard(params)),
        dispatch(fetchMonthlyRevenue(params)),
        dispatch(fetchDailyOrderTrends(params)),
        dispatch(fetchOrderStatus(params)),
      ]);
    } finally {
      refreshInProgress.current = false;
    }
  };

  if (dashboardLoading && !dashboard) {
    return <DashboardLoading />;
  }

  if (error && !dashboard) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <AlertCircle
            className="mx-auto text-red-500"
            size={42}
          />

          <h2 className="mt-4 text-lg font-semibold">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <Button
            onClick={handleRefresh}
            className="mt-5"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-[#1f2928]">
            Good morning, Admin 👋
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString(
              "en-IN",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 self-start md:self-auto"
        >
          <RefreshCw
            size={16}
            className={
              isRefreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </Button>
      </section>

      {/* Stats */}
      <DashboardStats data={dashboard} />

      {/* Main charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        <RevenueOverview
          data={monthlyRevenue}
          loading={revenueLoading}
        />

        <OrderStatusCard
          data={orderStatus}
          loading={orderStatusLoading}
        />
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ReservationOverview
          data={dailyOrderTrends}
          loading={dailyOrderTrendsLoading}
        />

        {/* Reservation summary */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#202928]">
              Reservation Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current reservation statistics
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <ReservationBox
              label="Total"
              value={
                dashboard.reservations
                  .totalReservations
              }
            />

            <ReservationBox
              label="Confirmed"
              value={
                dashboard.reservations
                  .confirmedReservations
              }
            />

            <ReservationBox
              label="Completed"
              value={
                dashboard.reservations
                  .completedReservations
              }
            />

            <ReservationBox
              label="Cancelled"
              value={
                dashboard.reservations
                  .cancelledReservations
              }
            />
          </div>
        </div>
      </div>

      {/* Bottom information */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <InfoCard
          title="Inventory"
          items={[
            [
              "Stock In",
              dashboard.inventory
                .stockInQuantity,
            ],
            [
              "Stock Out",
              dashboard.inventory
                .stockOutQuantity,
            ],
            [
              "Wastage",
              dashboard.inventory
                .wastageQuantity,
            ],
          ]}
        />

        <InfoCard
          title="Orders"
          items={[
            [
              "Total Orders",
              dashboard.orders.totalOrders,
            ],
            [
              "Completed",
              dashboard.orders.completedOrders,
            ],
            [
              "Average Order",
              `₹${Number(
                dashboard.orders
                  .averageOrderValue
              ).toLocaleString("en-IN")}`,
            ],
          ]}
        />

        <InfoCard
          title="Reviews"
          items={[
            [
              "Total Reviews",
              dashboard.reviews.totalReviews,
            ],
            [
              "Average Rating",
              `${dashboard.reviews.averageRating} ★`,
            ],
          ]}
        />
      </div>
    </div>
  );
}


// ============================================================
// RESERVATION BOX
// ============================================================

function ReservationBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-[#f7f8f7] p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-[#202928]">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}


// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: [string, string | number][];
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <div className="mt-5 space-y-4">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-gray-500">
              {label}
            </span>

            <span className="font-semibold">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
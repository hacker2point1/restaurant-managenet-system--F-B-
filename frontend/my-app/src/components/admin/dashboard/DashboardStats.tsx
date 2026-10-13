"use client";

import {
  CalendarDays,
  CircleDollarSign,
  Package,
  Star,
  Table2,
  UtensilsCrossed,
  Users,
  AlertTriangle,
} from "lucide-react";

import type { DashboardData } from "@/redux/slice/analytics";

interface DashboardStatsProps {
  data: DashboardData;
}

export default function DashboardStats({
  data,
}: DashboardStatsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${Number(
        data.orders.totalRevenue || 0
      ).toLocaleString("en-IN")}`,
      icon: CircleDollarSign,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },

    {
      title: "Total Customers",
      value: data.summary.customers.toLocaleString(
        "en-IN"
      ),
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },

    {
      title: "Reservations",
      value:
        data.reservations.totalReservations.toLocaleString(
          "en-IN"
        ),
      icon: CalendarDays,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },

    {
      title: "Low Stock Items",
      value: data.summary.lowStockItems,
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      danger: data.summary.lowStockItems > 0,
    },

    {
      title: "Active Tables",
      value: data.summary.tables,
      icon: Table2,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },

    {
      title: "Menu Items",
      value: data.summary.activeMenuItems,
      icon: UtensilsCrossed,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },

    {
      title: "Completed Orders",
      value: data.orders.completedOrders,
      icon: Package,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },

    {
      title: "Average Rating",
      value: `${data.reviews.averageRating} ★`,
      icon: Star,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
                  {card.title}
                </p>

                <h3
                  className={`mt-2 text-[27px] font-bold tracking-tight ${
                    card.danger
                      ? "text-red-500"
                      : "text-[#202928]"
                  }`}
                >
                  {card.value}
                </h3>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon
                  size={21}
                  className={card.iconColor}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
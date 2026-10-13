"use client";

import {
  Store,
  StoreIcon,
  CircleOff,
  Trash2,
} from "lucide-react";

import type { Restaurant } from "@/types/restaurent";

interface RestaurantStatsProps {
  restaurants: Restaurant[];
}

export default function RestaurantStats({
  restaurants,
}: RestaurantStatsProps) {

  const total =
    restaurants.length;

  const active =
    restaurants.filter(
      (restaurant) =>
        restaurant.isActive &&
        !restaurant.isDeleted
    ).length;

  const inactive =
    restaurants.filter(
      (restaurant) =>
        !restaurant.isActive &&
        !restaurant.isDeleted
    ).length;

  const deleted =
    restaurants.filter(
      (restaurant) =>
        restaurant.isDeleted
    ).length;

  const stats = [
    {
      title: "TOTAL RESTAURANTS",
      value: total,
      icon: Store,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
    },

    {
      title: "ACTIVE RESTAURANTS",
      value: active,
      icon: StoreIcon,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },

    {
      title: "INACTIVE RESTAURANTS",
      value: inactive,
      icon: CircleOff,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    {
      title: "DELETED RESTAURANTS",
      value: deleted,
      icon: Trash2,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {stats.map((stat) => {

        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="
              rounded-xl
              border
              bg-white
              p-5
              shadow-sm
              transition
              hover:shadow-md
            "
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-[11px] font-semibold tracking-wide text-gray-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-bold text-[#202928]">
                  {stat.value}
                </p>

              </div>

              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  ${stat.iconBg}
                `}
              >
                <Icon
                  size={21}
                  className={stat.iconColor}
                />
              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}
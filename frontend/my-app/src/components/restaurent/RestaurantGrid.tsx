"use client";

import RestaurantCard from "./RestaurantCard";

import type { Restaurant } from "@/types/restaurent";

interface RestaurantGridProps {
  restaurants: Restaurant[];

  onView?: (
    restaurant: Restaurant
  ) => void;

  onEdit?: (
    restaurant: Restaurant
  ) => void;

  onActivate?: (
    id: string
  ) => void;

  onDeactivate?: (
    id: string
  ) => void;

  onDelete?: (
    id: string
  ) => void;

  onRestore?: (
    id: string
  ) => void;
}

export default function RestaurantGrid({
  restaurants,

  onView,

  onEdit,

  onActivate,

  onDeactivate,

  onDelete,

  onRestore,
}: RestaurantGridProps) {

  if (!restaurants.length) {
    return null;
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-5
        md:grid-cols-2
        xl:grid-cols-3
      "
    >

      {restaurants.map(
        (restaurant) => (

          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}

            onView={onView}

            onEdit={onEdit}

            onActivate={onActivate}

            onDeactivate={
              onDeactivate
            }

            onDelete={onDelete}

            onRestore={onRestore}
          />

        )
      )}

    </div>
  );
}
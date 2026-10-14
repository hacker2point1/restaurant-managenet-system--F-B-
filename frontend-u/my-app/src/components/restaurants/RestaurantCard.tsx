"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Utensils } from "lucide-react";

import { Card } from "@/components/ui/card";

export interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  cuisineTypes?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  logo?: string;
  images?: {
    url?: string;
    publicId?: string;
  }[];
  website?: string;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

export default function RestaurantCard({
  restaurant,
  index = 0,
}: RestaurantCardProps) {
  const image =
    restaurant.images?.find((item) => item.url)?.url ||
    restaurant.logo ||
    "";

  const location = [
    restaurant.address?.city,
    restaurant.address?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const cuisines = restaurant.cuisineTypes?.filter(Boolean) ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.08, 0.24),
      }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#E3E3E8] bg-white p-0 shadow-[0_1px_2px_rgba(20,20,40,0.02)] transition-[border-color,box-shadow] duration-300 hover:border-[#D0CCFF] hover:shadow-[0_12px_35px_rgba(35,30,90,0.08)]">
        {/* Image */}
        <Link
          href={`/restaurants/${restaurant._id}`}
          aria-label={`View ${restaurant.name}`}
          className="relative block aspect-[5/3] overflow-hidden bg-[#F0F0F5]"
        >
          {image ? (
            <img
              src={image}
              alt={restaurant.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#F0EFFF]">
              <Utensils
                className="h-12 w-12 text-[#5B4BFF]"
                strokeWidth={1.3}
              />
            </div>
          )}

          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/[0.03]" />

          {/* Label */}
          <span className="absolute left-4 top-4 rounded-[10px] bg-[#5B4BFF] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm sm:text-xs">
            Handpicked
          </span>

          {/* View icon */}
          <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1B1B1F] shadow-md transition-colors duration-200 group-hover:bg-[#5B4BFF] group-hover:text-white">
            <ArrowRight className="h-5 w-5 -rotate-45" />
          </span>
        </Link>

        {/* Details */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="text-[21px] font-semibold leading-tight tracking-[-0.035em] text-[#1B1B1F] sm:text-[23px]">
            <Link
              href={`/restaurants/${restaurant._id}`}
              className="transition-colors hover:text-[#5B4BFF]"
            >
              {restaurant.name}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-2 min-h-5 text-[14px] leading-6 text-[#737789] sm:text-[15px]">
            {cuisines.length
              ? cuisines.slice(0, 2).join(" · ")
              : restaurant.description?.trim() || "Discover this restaurant"}
          </p>

          {/* Location */}
          <div className="mt-5 flex items-center gap-2 text-[13px] text-[#737789] sm:text-sm">
            <MapPin className="h-[17px] w-[17px] shrink-0 text-[#7B8192]" />

            <span className="truncate">
              {location ||
                restaurant.address?.street ||
                "Location unavailable"}
            </span>
          </div>

          {/* Additional address details */}
          {restaurant.address?.country && (
            <p className="mt-2 truncate text-[13px] text-[#737789]">
              {restaurant.address.country}
              {restaurant.address.zipCode
                ? ` · ${restaurant.address.zipCode}`
                : ""}
            </p>
          )}

          {/* Cuisine tags */}
          {cuisines.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cuisines.slice(0, 3).map((cuisine) => (
                <span
                  key={cuisine}
                  className="rounded-md bg-[#F0EFFF] px-2.5 py-1 text-xs font-medium text-[#5142E8]"
                >
                  {cuisine}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto border-t border-[#E2E3E9] pt-4">
            <Link
              href={`/restaurants/${restaurant._id}`}
              className="group/link flex items-center justify-between gap-3"
            >
              <span className="text-sm font-semibold text-[#5B4BFF] transition-colors group-hover/link:text-[#4939ED]">
                View restaurant
              </span>

              <ArrowRight className="h-[18px] w-[18px] text-[#5B4BFF] transition-transform duration-200 group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
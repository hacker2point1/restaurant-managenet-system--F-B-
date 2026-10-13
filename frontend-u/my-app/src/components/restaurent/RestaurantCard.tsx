"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ExternalLink, MapPin, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Restaurant } from "@/redux/slice/restaurantSlice";

interface RestaurantCardProps {
  restaurant: Restaurant;
  index?: number;
}

export default function RestaurantCard({
  restaurant,
  index = 0,
}: RestaurantCardProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const imageUrl =
    restaurant.images?.find((image) => image.url)?.url ||
    restaurant.logo;

  const location = [
    restaurant.address?.street,
    restaurant.address?.city,
    restaurant.address?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const cuisines = restaurant.cuisineTypes ?? [];

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={
        reduceMotion ? undefined : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.06, 0.25),
      }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white p-0 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-violet-950/10">
        {/* Restaurant image */}
        <div className="relative h-56 overflow-hidden bg-slate-100 sm:h-60">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={restaurant.name}
              loading={index < 3 ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-100 via-slate-100 to-orange-100">
              <Utensils className="h-12 w-12 text-violet-400" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />

          {cuisines.length > 0 && (
            <div className="absolute bottom-4 left-4 max-w-[85%]">
              <span className="inline-flex rounded-lg border border-white/20 bg-black/45 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                {cuisines.slice(0, 2).join(" · ")}
              </span>
            </div>
          )}
        </div>

        {/* Restaurant details */}
        <div className="flex flex-1 flex-col p-5">
          <h2 className="line-clamp-1 text-xl font-bold tracking-tight text-slate-900">
            {restaurant.name}
          </h2>

          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
            {restaurant.description?.trim() ||
              "Discover the menu and dining experience at this restaurant."}
          </p>

          {location && (
            <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

              <span className="line-clamp-2">{location}</span>
            </div>
          )}

          {cuisines.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cuisines.slice(0, 3).map((cuisine) => (
                <span
                  key={cuisine}
                  className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                >
                  {cuisine}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {restaurant.website ? (
              <a
                href={restaurant.website}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-violet-700"
              >
                Website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span className="text-xs text-slate-400">
                Explore the restaurant
              </span>
            )}

            <Button
              type="button"
              onClick={() =>
                router.push(`/restaurants/${restaurant._id}`)
              }
              className="shrink-0 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
            >
              View restaurant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
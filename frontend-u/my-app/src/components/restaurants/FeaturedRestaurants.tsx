"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Utensils } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import RestaurantCard, {
  type Restaurant,
} from "@/src/components/restaurants/RestaurantCard";

interface RestaurantResponse {
  status: boolean;
  message?: string;
  data: Restaurant[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009"
).replace(/\/+$/, "");

const RESTAURANT_ENDPOINT = `${API_URL}/api/v1/restaurent/public`;

function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#E3E3E8] bg-white">
      <Skeleton className="aspect-[5/3] w-full rounded-none" />

      <div className="space-y-4 p-5 sm:p-6">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function FeaturedRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRestaurants() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${RESTAURANT_ENDPOINT}?page=1&limit=3&sort=newest`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load restaurants right now.");
        }

        const result: RestaurantResponse = await response.json();

        if (!result.status || !Array.isArray(result.data)) {
          throw new Error(
            result.message || "Invalid restaurant response."
          );
        }

        setRestaurants(result.data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchRestaurants();

    return () => controller.abort();
  }, []);

  return (
    <section
      aria-labelledby="featured-restaurants-title"
      className="bg-[#F7F8FC] py-14 font-sans sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-[#5B4BFF] sm:text-sm"
            >
              Handpicked for you
            </motion.p>

            <motion.h2
              id="featured-restaurants-title"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="text-[36px] font-normal leading-[1.12] tracking-[-0.055em] text-[#1B1B1F] sm:text-5xl lg:text-[54px]"
            >
              Exceptional restaurants
            </motion.h2>
          </div>

          <Link
            href="/restaurants"
            className="group inline-flex h-auto w-fit items-center rounded-lg py-2 text-sm font-semibold text-[#5B4BFF] hover:text-[#4939ED] sm:text-base"
          >
            See all restaurants
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic restaurant cards */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <RestaurantCardSkeleton key={index} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[22px] border border-[#E3E3E8] bg-white px-6 py-12 text-center"
            >
              <p className="font-semibold text-[#1B1B1F]">
                We couldn&apos;t load the restaurants.
              </p>

              <p className="mt-2 text-sm text-[#747889]">{error}</p>

              <Button
                className="mt-5 rounded-xl bg-[#5B4BFF] text-white hover:bg-[#4939ED]"
                onClick={() => window.location.reload()}
              >
                Try again
              </Button>
            </motion.div>
          ) : restaurants.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[22px] border border-dashed border-[#D9DAE2] bg-white px-6 py-16 text-center"
            >
              <Utensils className="mx-auto h-10 w-10 text-[#5B4BFF]" />

              <h3 className="mt-4 text-xl font-semibold text-[#1B1B1F]">
                No restaurants available yet
              </h3>

              <p className="mt-2 text-sm text-[#747889]">
                Check back soon to discover your next favourite.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="restaurants"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {restaurants.map((restaurant, index) => (
                <RestaurantCard
                  key={restaurant._id}
                  restaurant={restaurant}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  UtensilsCrossed,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchHomepageStats,
} from "@/redux/slice/homePageStatSlice";
import type { AppDispatch, RootState } from "@/redux/store/store";

function formatCount(value: number): string {
  if (value === 0) return "0";

  const compactValue = new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

  return `${compactValue}+`;
}

function formatPercentage(value: number | null): string {
  if (value === null) return "—";

  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`;
}

export default function RestaurantHero() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const shouldReduceMotion = useReducedMotion();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.homepageStats
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("Mumbai, India");

  useEffect(() => {
    dispatch(fetchHomepageStats());
  }, [dispatch]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/restaurants?${queryString}`
        : "/restaurants"
    );
  };

  const stats = [
    {
      label: "Average rating",
      value:
        data?.averageRating == null
          ? "—"
          : data.averageRating.toFixed(1),
      description: data
        ? `${data.totalReviews.toLocaleString("en-IN")} approved reviews`
        : "Across approved reviews",
      icon: Star,
    },
    {
      label: "Curated restaurants",
      value: data ? formatCount(data.restaurantCount) : "—",
      description: "Active restaurant listings",
      icon: UtensilsCrossed,
    },
    {
      label: "Happy diners",
      value: data ? formatCount(data.happyDiners) : "—",
      description: "Guests across completed bookings",
      icon: Users,
    },
    {
      label: "Payment success",
      value: data ? formatPercentage(data.paymentSuccessRate) : "—",
      description: "Paid orders vs. failed orders",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-white">
      {/* HERO BANNER */}
      <section className="relative isolate min-h-[620px] overflow-visible bg-[#15112f] text-white md:min-h-[660px]">
        {/* Restaurant background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div
            className="absolute inset-0 scale-[1.03] bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=85')",
            }}
          />

          {/* Dark purple overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#100d28]/95 via-[#171333]/80 to-[#171333]/25" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#100d28]/45 via-transparent to-[#100d28]/30" />
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-32 pt-20 sm:px-8 md:pb-36 md:pt-28 lg:px-12">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-9 bg-violet-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.19em] text-white/90 sm:text-sm">
                Kolkata&apos;s finest tables
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[82px]">
              Good food.
              <br />

              <span className="text-[#bcb1ff]">
                Great moments.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              Discover exceptional restaurants, explore signature
              dishes, and reserve your perfect table in a few
              effortless steps.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => router.push("/restaurants")}
                className="h-12 rounded-xl bg-violet-600 px-6 font-semibold text-white shadow-lg shadow-violet-950/20 transition-all hover:-translate-y-0.5 hover:bg-violet-500"
              >
                Explore restaurants
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/restaurents")}
                className="h-12 rounded-xl border-white/40 bg-white/10 px-6 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
              >
                Book a table
              </Button>
            </div>
          </motion.div>
        </div>

        {/* FLOATING SEARCH BAR */}
        <div className="absolute inset-x-4 bottom-0 z-20 mx-auto w-auto max-w-6xl translate-y-1/2 sm:inset-x-8">
          <motion.form
            onSubmit={handleSearch}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-slate-900 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_60px] md:items-center md:gap-0 md:px-5 md:py-4"
          >
            {/* Dish / restaurant search */}
            <div className="min-w-0 md:pr-5">
              <label
                htmlFor="restaurant-search"
                className="mb-1 block pl-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500"
              >
                What are you craving?
              </label>

              <div className="relative flex items-center">
                <Search className="absolute left-1 h-5 w-5 text-violet-600" />

                <Input
                  id="restaurant-search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Restaurant, cuisine, or dish"
                  className="h-10 border-0 pl-8 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Location */}
            <div className="min-w-0 border-t border-slate-200 pt-3 md:border-l md:border-t-0 md:px-5 md:pt-0">
              <label
                htmlFor="restaurant-location"
                className="mb-1 block pl-1 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500"
              >
                Near you
              </label>

              <div className="relative flex items-center">
                <MapPin className="absolute left-1 h-5 w-5 text-violet-600" />

                <Input
                  id="restaurant-location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City or area"
                  className="h-10 border-0 pl-8 text-sm font-semibold shadow-none placeholder:font-normal placeholder:text-slate-400 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Search action */}
            <Button
              type="submit"
              aria-label="Search restaurants"
              className="h-12 w-full rounded-xl bg-violet-600 text-white transition-all hover:bg-violet-500 md:h-[60px] md:w-[60px]"
            >
              <Search className="h-5 w-5" />
              <span className="ml-2 md:hidden">Search restaurants</span>
            </Button>
          </motion.form>
        </div>
      </section>

      {/* DYNAMIC ANALYTICS STRIP */}
      <section
        aria-label="Restaurant platform statistics"
        className="bg-white px-5 pb-10 pt-24 sm:px-8 md:pb-12 md:pt-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-y-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={
                    shouldReduceMotion
                      ? false
                      : { opacity: 0, y: 14 }
                  }
                  whileInView={
                    shouldReduceMotion
                      ? undefined
                      : { opacity: 1, y: 0 }
                  }
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.07,
                  }}
                  className="flex items-center gap-4 border-slate-200 px-4 sm:px-6 lg:border-r lg:last:border-r-0"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>

                    {loading && !data ? (
                      <div className="mt-1 h-8 w-20 animate-pulse rounded-md bg-slate-100" />
                    ) : (
                      <p className="mt-0.5 text-2xl font-bold tracking-tight text-violet-600 sm:text-[28px]">
                        {stat.value}
                      </p>
                    )}

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Error and retry */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-red-600"
            >
              <span>Unable to refresh the latest statistics.</span>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => dispatch(fetchHomepageStats())}
                className="h-9 px-3 text-sm"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
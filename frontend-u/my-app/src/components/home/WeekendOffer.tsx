
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Check, Utensils } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import type { AppDispatch, RootState } from "@/redux/store/store";
import { fetchFeaturedCoupon } from "@/redux/slice/weekendOfferSlice";

export default function WeekendOffer() {
  const dispatch = useDispatch<AppDispatch>();

  const { coupon, loading, error } = useSelector(
    (state: RootState) => state.weekendOffer
  );

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!coupon) {
      dispatch(fetchFeaturedCoupon());
    }
  }, [dispatch, coupon]);

  const discountText = coupon
    ? coupon.discountType === "percentage"
      ? `${coupon.discountValue}% less.`
      : `₹${coupon.discountValue.toLocaleString("en-IN")} off.`
    : "";

  const copyCoupon = async () => {
    if (!coupon) return;

    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      toast.success("Coupon code copied!");

      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy the coupon code.");
    }
  };

  // Hide the banner when there is no eligible offer.
  if (!loading && !coupon) {
    if (error) {
      console.error("Weekend offer:", error);
    }

    return null;
  }

  return (
    <section className="bg-[#F7F8FC] px-5 py-12 font-sans sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1600px]">
        {loading && !coupon ? (
          <div className="grid min-h-[340px] overflow-hidden rounded-[24px] border border-[#E3E3E8] bg-white md:grid-cols-2">
            <div className="space-y-6 p-8 sm:p-12 lg:p-16">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-12 w-full max-w-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>

            <Skeleton className="min-h-[260px] rounded-none" />
          </div>
        ) : coupon ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5 }}
            className="grid min-h-[380px] overflow-hidden rounded-[24px] bg-[#302765] shadow-[0_12px_40px_rgba(35,30,90,0.07)] md:grid-cols-[1.08fr_0.92fr] lg:min-h-[430px]"
          >
            {/* Promotional content */}
            <div className="relative flex flex-col justify-center overflow-hidden px-7 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
              <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#5B4BFF]/20 blur-3xl" />

              <div className="relative z-10">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#C8C2FF] sm:text-sm">
                  A special treat for you
                </p>

                <h2 className="max-w-[650px] text-[36px] font-normal leading-[1.13] tracking-[-0.045em] text-white sm:text-5xl lg:text-[54px]">
                  {coupon.description?.trim() ||
                    "An experience worth remembering,"}

                  <span className="mt-1 block font-semibold text-[#C2BBFF]">
                    {discountText}
                  </span>
                </h2>

                <p className="mt-6 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
                  Enjoy something special at{" "}
                  <span className="font-semibold text-white">
                    {coupon.restaurant.name}
                  </span>
                  . Use code{" "}
                  <button
                    type="button"
                    onClick={copyCoupon}
                    className="inline-flex items-center gap-1 font-bold text-white underline decoration-white/40 underline-offset-4 transition-colors hover:text-[#C8C2FF]"
                    aria-label={`Copy coupon code ${coupon.code}`}
                  >
                    {coupon.code}

                    {copied ? (
                      <Check className="ml-1 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="ml-1 h-3.5 w-3.5" />
                    )}
                  </button>{" "}
                  at checkout.
                </p>

                {coupon.minimumOrderAmount ? (
                  <p className="mt-2 text-xs text-white/60">
                    Minimum order: ₹
                    {coupon.minimumOrderAmount.toLocaleString("en-IN")}
                  </p>
                ) : null}

                <div className="mt-8">
                  <Link
                    href={`/restaurants/${coupon.restaurant._id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-white/60 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white hover:text-[#302765] sm:text-base"
                  >
                    Find a table
                    <ArrowRight className="ml-3 h-4 w-4" />
                  </Link>
                </div>

                <p className="mt-6 text-xs text-white/55">
                  Valid until{" "}
                  {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Restaurant image */}
            <div className="relative min-h-[270px] overflow-hidden bg-[#F0EFFF] md:min-h-full">
              {coupon.restaurant.image ? (
                <img
                  src={coupon.restaurant.image}
                  alt={coupon.restaurant.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#F0EFFF] to-[#DCD6FF]">
                  <Utensils
                    className="h-20 w-20 text-[#5B4BFF]/50"
                    strokeWidth={1}
                  />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-[#302765]/10" />

              <div className="absolute bottom-5 left-5 rounded-xl border border-white/30 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:bottom-7 sm:left-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#737789]">
                  Featured restaurant
                </p>

                <p className="mt-1 text-sm font-semibold text-[#1B1B1F] sm:text-base">
                  {coupon.restaurant.name}
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

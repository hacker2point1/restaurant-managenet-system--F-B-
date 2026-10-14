
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Search,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface PublicOffer {
  _id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  expiryDate: string;
  restaurant: {
    _id: string;
    name: string;
    image?: string;
    city?: string;
  };
}

interface PublicOffersResponse {
  status: boolean;
  message: string;
  data: PublicOffer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type DiscountFilter = "all" | "percentage" | "fixed";

const cardGradients = [
  "bg-gradient-to-br from-[#5B4BFF] to-[#8238EF]",
  "bg-gradient-to-br from-[#292448] to-[#423B70]",
  "bg-gradient-to-br from-[#4338CA] to-[#2563EB]",
];

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "Unable to load offers."
    );
  }

  return error instanceof Error
    ? error.message
    : "Unable to load offers.";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDiscountLabel(offer: PublicOffer) {
  return offer.discountType === "percentage"
    ? `${offer.discountValue}% OFF`
    : `${formatCurrency(offer.discountValue)} OFF`;
}

function OfferCard({
  offer,
  index,
  onCopy,
  copied,
}: {
  offer: PublicOffer;
  index: number;
  onCopy: (code: string) => void;
  copied: boolean;
}) {
  const gradient = cardGradients[index % cardGradients.length];

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card
        className={`group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-[20px] border-0 p-0 text-white shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-[#302765]/15 sm:min-h-[300px] ${gradient}`}
      >
        {/* Decorative circle */}
        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border border-white/15 transition-transform duration-500 group-hover:scale-110" />

        <CardContent className="relative flex flex-1 flex-col p-5 sm:p-6">
          {/* Discount */}
          <div className="min-h-[76px]">
            <p className="text-[32px] font-semibold leading-none tracking-[-0.045em] sm:text-[38px]">
              {getDiscountLabel(offer)}
            </p>
          </div>

          {/* Offer details */}
          <div className="mt-auto">
            <p className="line-clamp-2 min-h-[52px] text-lg font-normal leading-7 tracking-[-0.025em] sm:text-xl">
              {offer.description?.trim() ||
                `A special treat at ${offer.restaurant.name}.`}
            </p>

            <p className="mt-2 truncate border-b border-dashed border-white/30 pb-2 text-xs text-white/75 sm:text-sm">
              {offer.minimumOrderAmount
                ? `Min. booking ${formatCurrency(offer.minimumOrderAmount)}`
                : "Available at participating restaurants"}

              {offer.discountType === "percentage" &&
              offer.maximumDiscountAmount != null
                ? ` · Up to ${formatCurrency(offer.maximumDiscountAmount)}`
                : ""}
            </p>

            {/* Coupon code and action */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-white/75">
                  Use code
                </p>

                <p className="mt-0.5 truncate text-sm font-bold tracking-[0.08em] sm:text-base">
                  {offer.code}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => onCopy(offer.code)}
                aria-label={`${copied ? "Copied" : "Copy"} offer code ${offer.code}`}
                className="h-10 shrink-0 rounded-xl border-white/55 bg-white/5 px-3 text-xs font-semibold text-white hover:border-white hover:bg-white hover:text-[#5B4BFF] sm:px-4 sm:text-sm"
              >
                {copied ? (
                  <Check className="mr-1.5 h-4 w-4" />
                ) : (
                  <Copy className="mr-1.5 h-4 w-4" />
                )}
                {copied ? "Copied" : "Use offer"}
              </Button>
            </div>

            {/* Restaurant and expiry */}
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/15 pt-3 text-[11px] text-white/75">
              <Link
                href={`/restaurants/${offer.restaurant._id}`}
                className="min-w-0 truncate transition-colors hover:text-white hover:underline"
              >
                {offer.restaurant.name}
              </Link>

              <span className="shrink-0">
                Ends{" "}
                {new Date(offer.expiryDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function OfferCardSkeleton() {
  return (
    <Card className="min-h-[280px] overflow-hidden rounded-[20px] border border-[#E3E3E8] bg-white p-5 sm:min-h-[300px] sm:p-6">
      <div className="space-y-5">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="mt-12 h-6 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-5">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </Card>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [discountFilter, setDiscountFilter] =
    useState<DiscountFilter>("all");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Debounced search
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setAppliedSearch(search.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  // Fetch offers
  useEffect(() => {
    const controller = new AbortController();

    async function loadOffers() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await AxiosInstance.get<PublicOffersResponse>(
            endpoints.coupon.getPublicOffers,
            {
              params: {
                page,
                limit: 9,
                search: appliedSearch || undefined,
                discountType:
                  discountFilter === "all"
                    ? undefined
                    : discountFilter,
              },
              signal: controller.signal,
            }
          );

        if (!response.data.status) {
          throw new Error(
            response.data.message || "Unable to load offers."
          );
        }

        setOffers(response.data.data);
        setTotal(response.data.pagination.total);
        setTotalPages(
          Math.max(response.data.pagination.totalPages, 1)
        );
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;
        setError(getErrorMessage(loadError));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadOffers();

    return () => controller.abort();
  }, [appliedSearch, discountFilter, page, retryKey]);

  async function copyOfferCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Code ${code} copied.`);

      window.setTimeout(() => {
        setCopiedCode((current) =>
          current === code ? null : current
        );
      }, 1800);
    } catch {
      toast.error("Unable to copy this offer code.");
    }
  }

  function setFilter(filter: DiscountFilter) {
    setDiscountFilter(filter);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setAppliedSearch("");
    setFilter("all");
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] font-sans text-[#1B1B1F]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#E3E3E8] bg-[#F0EFFF]">
        <div className="pointer-events-none absolute -right-24 -top-36 h-[420px] w-[420px] rounded-full bg-[#5B4BFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-[-100px] h-[350px] w-[350px] rounded-full bg-white/80 blur-3xl" />

        <div className="relative mx-auto max-w-[1440px] px-5 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:px-12 lg:pb-20">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#737789] transition-colors hover:text-[#5B4BFF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>

          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#5B4BFF] sm:text-sm">
              <Tag className="h-4 w-4" />
              More taste, more value
            </p>

            <h1 className="text-[40px] font-normal leading-[1.1] tracking-[-0.055em] text-[#1B1B1F] sm:text-6xl lg:text-[68px]">
              Offers made for{" "}
              <span className="text-[#5B4BFF]">dining out</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#737789] sm:text-base">
              Handpicked privileges at restaurants you&apos;ll love.
              Discover your next favourite meal for less.
            </p>

            <div className="mx-auto mt-8 w-full max-w-xl">
              <label htmlFor="offer-search" className="sr-only">
                Search offers or restaurants
              </label>

              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#737789]" />
                <Input
                  id="offer-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search offers, codes or restaurants..."
                  className="h-14 rounded-2xl border-[#E3E3E8] bg-white pl-12 pr-4 text-sm text-[#1B1B1F] shadow-[0_6px_24px_rgba(35,30,90,0.05)] placeholder:text-[#9296A5] focus-visible:border-[#5B4BFF] focus-visible:ring-[#5B4BFF]/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mb-7 flex flex-col gap-5 border-b border-[#E3E3E8] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1B1B1F] sm:text-3xl">
              Explore our offers
            </h2>
            <p className="mt-2 text-sm text-[#737789]">
              {loading
                ? "Finding available offers..."
                : `${total} ${total === 1 ? "offer" : "offers"} available`}
            </p>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter offer type"
          >
            {(
              [
                ["all", "All offers"],
                ["percentage", "Percentage"],
                ["fixed", "Fixed amount"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={
                  discountFilter === value ? "default" : "outline"
                }
                aria-pressed={discountFilter === value}
                onClick={() => setFilter(value)}
                className={
                  discountFilter === value
                    ? "rounded-full bg-[#5B4BFF] px-4 text-white hover:bg-[#4939ED]"
                    : "rounded-full border-[#E3E3E8] bg-white px-4 text-[#737789] hover:border-[#D0CCFF] hover:bg-[#F0EFFF] hover:text-[#5B4BFF]"
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-auto grid max-w-[1320px] grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <OfferCardSkeleton key={index} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="rounded-[22px] border border-[#E3E3E8] bg-white px-6 py-14 text-center"
            >
              <p className="font-semibold text-[#1B1B1F]">
                We couldn&apos;t load the offers.
              </p>
              <p className="mt-2 text-sm text-[#737789]">{error}</p>
              <Button
                type="button"
                onClick={() => setRetryKey((current) => current + 1)}
                className="mt-5 rounded-xl bg-[#5B4BFF] text-white hover:bg-[#4939ED]"
              >
                Try again
              </Button>
            </motion.div>
          ) : offers.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-[22px] border border-dashed border-[#D0CCFF] bg-white px-6 py-16 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0EFFF]">
                <UtensilsCrossed className="h-8 w-8 text-[#5B4BFF]" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-[#1B1B1F]">
                No offers found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#737789]">
                Try another search or discount filter to discover available
                restaurant offers.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="mt-5 rounded-xl border-[#D0CCFF] text-[#5B4BFF] hover:bg-[#F0EFFF]"
              >
                Clear filters
              </Button>
              <div>
                <Link
                  href="/restaurants"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5B4BFF] hover:text-[#4939ED]"
                >
                  Browse restaurants
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${appliedSearch}-${discountFilter}-${page}`}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.09 },
                },
              }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="mx-auto grid max-w-[1320px] grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {offers.map((offer, index) => (
                <OfferCard
                  key={offer._id}
                  offer={offer}
                  index={index}
                  onCopy={copyOfferCode}
                  copied={copiedCode === offer.code}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && !error && offers.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl border-[#E3E3E8] bg-white text-[#5B4BFF] hover:bg-[#F0EFFF]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm tabular-nums text-[#737789]">
              Page {page} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl border-[#E3E3E8] bg-white text-[#5B4BFF] hover:bg-[#F0EFFF]"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

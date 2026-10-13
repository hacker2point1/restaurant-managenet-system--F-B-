"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import MenuCategoryCard from "./MenuCategoryCard";
import MenuCategoryCardSkeleton from "./MenuCategoryCardSkeleton";

import { fetchMenuCategories } from "@/redux/slice/menuCategorySlice";
import type { RootState, AppDispatch } from "@/redux/store/store";

interface MenuCategoriesSectionProps {
  branchId?: string;
}

export default function MenuCategoriesSection({
  branchId,
}: MenuCategoriesSectionProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Use the selected branch supplied by the parent, or a configured default.
  const activeBranchId =
    branchId || process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID || "";

  const { categories, loading, error } = useSelector(
    (state: RootState) => state.menuCategories
  );

  useEffect(() => {
    dispatch(
      fetchMenuCategories({
        branchId: activeBranchId || undefined,
        page: 1,
        limit: 5,
      })
    );
  }, [dispatch, activeBranchId]);

  const handleExploreAll = () => {
    if (!activeBranchId) return;

    router.push(`/menu-categories/${activeBranchId}`);
  };

  return (
    <section className="bg-[#f7f8fc] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              <UtensilsCrossed className="h-4 w-4" />
              From our kitchen
            </div>

            <h2 className="text-4xl font-medium tracking-[-0.045em] text-[#171717] sm:text-5xl lg:text-[56px]">
              Explore menu categories
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Discover delicious choices across our menu, from
              comforting favourites to signature dishes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {activeBranchId && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleExploreAll}
              className="w-fit shrink-0 rounded-xl px-0 text-base font-semibold text-violet-600 hover:bg-transparent hover:text-violet-700"
            >
              Explore all categories
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            )}
            <Link
              href="/explore-food"
              className="inline-flex w-fit shrink-0 items-center rounded-xl text-base font-semibold text-violet-600 hover:text-violet-700"
            >
              Explore more
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {loading && categories.length === 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <MenuCategoryCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && categories.length === 0 && !loading && (
          <div className="rounded-2xl border border-red-200 bg-white p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() =>
                dispatch(
                  fetchMenuCategories({
                    branchId: activeBranchId,
                    page: 1,
                    limit: 5,
                  })
                )
              }
            >
              Try again
            </Button>
          </div>
        )}

        {/* Dynamic cards */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.slice(0, 5).map((category, index) => (
              <MenuCategoryCard
                key={category._id}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          !error &&
          categories.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <UtensilsCrossed className="mx-auto h-9 w-9 text-slate-400" />

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No menu categories yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Categories will appear here once they are available
                for this branch.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}
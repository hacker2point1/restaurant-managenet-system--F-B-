"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  UtensilsCrossed,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import MenuCategoryCard from "./MenuCategoryCard";
import MenuCategoryCardSkeleton from "./MenuCategoryCardSkeleton";

import { fetchMenuCategories } from "@/redux/slice/menuCategorySlice";
import type { AppDispatch, RootState } from "@/redux/store/store";

interface MenuCategoriesPageProps {
  branchId?: string;
}

export default function MenuCategoriesPage({
  branchId,
}: MenuCategoriesPageProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { categories, pagination, loading, error } = useSelector(
    (state: RootState) => state.menuCategories
  );

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1);
      setAppliedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  // Fetch categories whenever the branch, page, or search changes.
  useEffect(() => {
    dispatch(
      fetchMenuCategories({
        branchId,
        page,
        limit: 12,
        search: appliedSearch,
      })
    );
  }, [dispatch, branchId, page, appliedSearch]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
    setAppliedSearch("");
  };

  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      {/* Page heading */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 -ml-3 text-slate-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>

          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Find your next favourite
          </p>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-medium tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                {branchId ? "All menu categories" : "Explore food"}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                {branchId
                  ? "Explore our menu categories and discover the dishes available at this branch."
                  : "Browse menu categories and discover dishes available across our active branches."}
              </p>
            </div>

            <div className="text-sm text-slate-500">
              {pagination.total.toLocaleString("en-IN")}{" "}
              {pagination.total === 1 ? "category" : "categories"}
            </div>
          </div>

          {/* Search categories */}
          <form
            onSubmit={handleSearch}
            className="mt-8 flex w-full max-w-xl gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search menu categories..."
                className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-10 focus-visible:ring-violet-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-violet-600 px-5 hover:bg-violet-700"
            >
              Search
            </Button>

            {appliedSearch && (
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl"
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            )}
          </form>
        </div>
      </section>

      {/* Categories grid */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <MenuCategoryCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() =>
                dispatch(
                  fetchMenuCategories({
                    branchId,
                    page,
                    limit: 12,
                    search: appliedSearch,
                  })
                )
              }
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => (
              <MenuCategoryCard
                key={category._id}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <UtensilsCrossed className="mx-auto h-10 w-10 text-slate-400" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No categories found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {appliedSearch
                ? `No categories match "${appliedSearch}". Try a different name.`
                : "No menu categories are available yet."}
            </p>

            {appliedSearch && (
              <Button
                type="button"
                variant="outline"
                className="mt-5"
                onClick={handleClearSearch}
              >
                Clear search
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <span className="text-sm font-medium text-slate-600">
              Page {pagination.page} of {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-xl"
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
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Search, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import RestaurantCard from "./RestaurantCard";
import RestaurantCardSkeleton from "./RestaurantCardSkeleton";
import RestaurantFilters from "./RestaurantFilters";

import { fetchPublicRestaurants } from "@/redux/slice/restaurantSlice";
import type { AppDispatch, RootState } from "@/redux/store/store";

export default function RestaurantListingPage() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    restaurants,
    pagination,
    cuisines,
    loading,
    error,
  } = useSelector((state: RootState) => state.restaurants);

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [sort, setSort] = useState<"newest" | "name">("newest");
  const [page, setPage] = useState(1);

  // Fetch from the backend when a filter, page, or search changes.
  useEffect(() => {
    dispatch(
      fetchPublicRestaurants({
        page,
        limit: 9,
        search: appliedSearch,
        cuisine: selectedCuisine,
        sort,
      })
    );
  }, [dispatch, page, appliedSearch, selectedCuisine, sort]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

  const handleCuisineChange = (cuisine: string) => {
    setPage(1);
    setSelectedCuisine(cuisine);
  };

  const totalPages = pagination.totalPages;

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      {/* Hero + search */}
      <section className="relative overflow-hidden bg-[#f0efff]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Discover your next favourite
          </p>

          <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.045em] text-[#18181b] sm:text-5xl lg:text-6xl">
            Restaurants worth the trip.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Discover great places to eat, explore different cuisines,
            and find your next favourite restaurant.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
          >
            <Search className="ml-2 h-5 w-5 shrink-0 text-violet-600" />

            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search restaurants, cuisines, or cities..."
              aria-label="Search restaurants"
              className="h-11 border-0 shadow-none focus-visible:ring-0"
            />

            <Button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl bg-violet-600 px-5 text-white hover:bg-violet-700 sm:px-7"
            >
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Listings */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
        <RestaurantFilters
          cuisines={cuisines}
          selectedCuisine={selectedCuisine}
          onCuisineChange={handleCuisineChange}
          sort={sort}
          onSortChange={(value) => {
            setPage(1);
            setSort(value);
          }}
          total={pagination.total}
        />

        {appliedSearch && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>
              Results for{" "}
              <strong className="text-slate-900">
                &quot;{appliedSearch}&quot;
              </strong>
            </span>

            <Button
              type="button"
              variant="link"
              onClick={() => {
                setSearchInput("");
                setAppliedSearch("");
                setPage(1);
              }}
              className="h-auto p-0 text-violet-600"
            >
              Clear search
            </Button>
          </div>
        )}

        {selectedCuisine && (
          <div className="mt-3 text-sm text-slate-500">
            Cuisine:{" "}
            <span className="font-semibold text-violet-700">
              {selectedCuisine}
            </span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <RestaurantCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-white p-8 text-center"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Unable to load restaurants
            </h2>

            <p className="mt-2 text-sm text-slate-500">{error}</p>

            <Button
              type="button"
              onClick={() =>
                dispatch(
                  fetchPublicRestaurants({
                    page,
                    limit: 9,
                    search: appliedSearch,
                    cuisine: selectedCuisine,
                    sort,
                  })
                )
              }
              className="mt-5 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              Try again
            </Button>
          </div>
        )}

        {/* Dynamic restaurant cards */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && restaurants.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <UtensilsCrossed className="mx-auto h-10 w-10 text-violet-400" />

            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No restaurants found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try another restaurant name, city, or cuisine.
            </p>

            {(appliedSearch || selectedCuisine) && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchInput("");
                  setAppliedSearch("");
                  setSelectedCuisine("");
                  setPage(1);
                }}
                className="mt-5 rounded-xl"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
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
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
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
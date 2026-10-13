"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Leaf, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  foodType: string;
  images?: { url: string }[];
  preparationTime?: number;
  averageRating?: number;
}

interface MenuItemsResponse {
  status: boolean;
  message: string;
  category: { _id: string; name: string; description?: string };
  data: MenuItem[];
  pagination: { page: number; totalPages: number; total: number };
}

interface MenuCategoryItemsPageProps {
  categoryId: string;
}

export default function MenuCategoryItemsPage({
  categoryId,
}: MenuCategoryItemsPageProps) {
  const router = useRouter();
  const [category, setCategory] = useState<MenuItemsResponse["category"] | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadItems() {
      setLoading(true);
      setError(null);

      try {
        const response = await AxiosInstance.get<MenuItemsResponse>(
          endpoints.menuCategory.getPublicMenuItems(categoryId),
          { params: { page, limit: 12 }, signal: controller.signal }
        );

        if (!response.data.status) {
          throw new Error(response.data.message || "Could not load menu items.");
        }

        setCategory(response.data.category);
        setItems(response.data.data);
        setTotalPages(Math.max(response.data.pagination.totalPages, 1));
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;

        const message = axios.isAxiosError<{ message?: string }>(loadError)
          ? loadError.response?.data?.message || loadError.message
          : loadError instanceof Error
            ? loadError.message
            : "Could not load menu items.";
        setError(message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadItems();
    return () => controller.abort();
  }, [categoryId, page]);

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8 -ml-3 text-slate-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to categories
          </Button>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Explore food
          </p>
          <h1 className="text-4xl font-medium tracking-[-0.045em] text-slate-950 sm:text-5xl">
            {category?.name || "Menu items"}
          </h1>
          {category?.description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
              {category.description}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        {loading && (
          <p className="py-12 text-center text-sm text-slate-500">
            Loading available foods...
          </p>
        )}

        {!loading && error && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <UtensilsCrossed className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              No available foods in this category
            </h2>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <Card key={item._id} className="overflow-hidden rounded-2xl bg-white p-0 shadow-sm">
                  <div className="relative aspect-[4/3] bg-slate-100">
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <UtensilsCrossed className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                      <span className="shrink-0 font-semibold text-violet-700">
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        }).format(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-xs capitalize text-slate-500">
                      <Leaf className="h-4 w-4 text-emerald-600" />
                      {item.foodType.replaceAll("-", " ")}
                      {item.preparationTime ? ` · ${item.preparationTime} min` : ""}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
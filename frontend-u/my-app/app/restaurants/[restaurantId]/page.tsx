"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import RestaurantDetailPage from "@/src/components/restaurent/RestaurantDetailPage";

function RestaurantDetailRouteContent() {
  const params = useParams<{ restaurantId: string }>();

  return <RestaurantDetailPage restaurantId={params.restaurantId} />;
}

export default function RestaurantDetailRoute() {
  return (
    <Suspense
      fallback={(
        <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-20 text-center text-slate-500">
          Loading restaurant details...
        </main>
      )}
    >
      <RestaurantDetailRouteContent />
    </Suspense>
  );
}
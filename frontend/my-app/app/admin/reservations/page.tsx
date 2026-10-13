"use client";
import { useEffect } from "react";

import ReservationPage from "@/src/components/reservations/ReservationPage";
import {
  useAppDispatch,
  useAppSelector,
} from "@/redux/hooks/hooks";
import { getRestaurants } from "@/redux/slice/restaurentSlice";



export default function ReservationsPage() {
  const dispatch = useAppDispatch();
  const { restaurants, loading } = useAppSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    dispatch(getRestaurants());
  }, [dispatch]);

  if (restaurants.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-muted-foreground">
        {loading ? "Loading restaurants..." : "No restaurants available."}
      </div>
    );
  }

  return (
    <ReservationPage
      restaurants={restaurants.map(({ _id, name }) => ({ _id, name }))}
    />
  );
}
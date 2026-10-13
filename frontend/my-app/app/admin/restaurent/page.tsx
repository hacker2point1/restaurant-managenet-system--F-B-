"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Input,
} from "@/components/ui/input";

import {
  Badge,
} from "@/components/ui/badge";

import {
  AppDispatch,
  RootState,
} from "@/redux/store/store";

import {
  getRestaurants,
  activateRestaurant,
  deactivateRestaurant,
  deleteRestaurant,
  restoreRestaurant,
} from "@/redux/slice/restaurentSlice";

import RestaurantStats from "@/src/components/restaurent/RestaurantStats";

import RestaurantGrid from "@/src/components/restaurent/RestaurantGrid";

import CreateRestaurantDialog from "@/src/components/restaurent/CreateRestaurantDialog";

import RestaurantEmptyState from "@/src/components/restaurent/RestaurantEmptyState";

import RestaurantPageSkeleton from "@/src/components/restaurent/RestaurantPageSkeleton";
import RestaurantEditModal from "@/src/components/restaurent/RestaurantEditModal";
import RestaurantViewModal from "@/src/components/restaurent/RestaurantViewModal";
import type { Restaurant } from "@/types/restaurent";

type ConfirmationRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<unknown>;
};

export default function RestaurantsPage() {

  const dispatch =
    useDispatch<AppDispatch>();


  // ==========================================================
  // REDUX
  // ==========================================================

  const {
    restaurants,
    loading,
    actionLoading,
  } = useSelector(
    (state: RootState) =>
      state.restaurant
  );


  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [confirmation, setConfirmation] =
    useState<ConfirmationRequest | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editModalSession, setEditModalSession] = useState(0);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    filter,
    setFilter,
  ] = useState<
    "all" |
    "active" |
    "inactive" |
    "deleted"
  >("all");


  // ==========================================================
  // GET DATA
  // ==========================================================

  useEffect(() => {

    dispatch(
      getRestaurants()
    );

  }, [dispatch]);


  // ==========================================================
  // SEARCH + FILTER
  // ==========================================================

  const filteredRestaurants =
    useMemo(() => {

      let result =
        restaurants;


      // Status filter

      if (filter === "active") {

        result =
          result.filter(
            (restaurant) =>
              restaurant.isActive &&
              !restaurant.isDeleted
          );

      }


      if (filter === "inactive") {

        result =
          result.filter(
            (restaurant) =>
              !restaurant.isActive &&
              !restaurant.isDeleted
          );

      }


      if (filter === "deleted") {

        result =
          result.filter(
            (restaurant) =>
              restaurant.isDeleted
          );

      }


      // Search

      if (search.trim()) {

        const searchValue =
          search
            .trim()
            .toLowerCase();


        result =
          result.filter(
            (restaurant) => {

              const name =
                restaurant.name
                  ?.toLowerCase() ||
                "";

              const email =
                restaurant.email
                  ?.toLowerCase() ||
                "";

              const phone =
                restaurant.phone
                  ?.toLowerCase() ||
                "";

              const city =
                restaurant.address
                  ?.city
                  ?.toLowerCase() ||
                "";


              return (
                name.includes(
                  searchValue
                ) ||

                email.includes(
                  searchValue
                ) ||

                phone.includes(
                  searchValue
                ) ||

                city.includes(
                  searchValue
                )
              );
            }
          );
      }


      return result;

    }, [
      restaurants,
      search,
      filter,
    ]);


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    () => {

      dispatch(
        getRestaurants()
      );

    };

  const openRestaurantView = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setViewOpen(true);
  };

  const openRestaurantEdit = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditModalSession((session) => session + 1);
    setEditOpen(true);
  };


  // ==========================================================
  // ACTIONS
  // ==========================================================

  const requestRestaurantAction = (
    id: string,
    title: string,
    description: string,
    confirmLabel: string,
    onConfirm: () => Promise<unknown>,
    destructive = false
  ) => {
    setConfirmation({
      title,
      description,
      confirmLabel,
      destructive,
      onConfirm,
    });
  };

  const handleActivate = (id: string) => {
    const name = restaurants.find((item) => item._id === id)?.name ?? "this restaurant";

    requestRestaurantAction(
      id,
      "Activate restaurant?",
      `Activate ${name}? It will become available as an active restaurant.`,
      "Activate",
      () => dispatch(activateRestaurant(id)).unwrap()
    );
  };

  const handleDeactivate = (id: string) => {
    const name = restaurants.find((item) => item._id === id)?.name ?? "this restaurant";

    requestRestaurantAction(
      id,
      "Deactivate restaurant?",
      `Deactivate ${name}? It will no longer appear as active.`,
      "Deactivate",
      () => dispatch(deactivateRestaurant(id)).unwrap()
    );
  };

  const handleDelete = (id: string) => {
    const name = restaurants.find((item) => item._id === id)?.name ?? "this restaurant";

    requestRestaurantAction(
      id,
      "Delete restaurant?",
      `Delete ${name}? This moves it to the deleted list.`,
      "Delete",
      async () => {
        await dispatch(deleteRestaurant(id)).unwrap();
        await dispatch(getRestaurants());
      },
      true
    );
  };

  const handleRestore = (id: string) => {
    const name = restaurants.find((item) => item._id === id)?.name ?? "this restaurant";

    requestRestaurantAction(
      id,
      "Restore restaurant?",
      `Restore ${name} and make it available in the restaurant list?`,
      "Restore",
      async () => {
        await dispatch(restoreRestaurant(id)).unwrap();
        await dispatch(getRestaurants());
      }
    );
  };

  const confirmRestaurantAction = async () => {
    if (!confirmation || isConfirming) {
      return;
    }

    setIsConfirming(true);

    try {
      await confirmation.onConfirm();
      setConfirmation(null);
    } catch {
      // Redux handles operation errors.
    } finally {
      setIsConfirming(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    restaurants.length === 0
  ) {

    return (
      <RestaurantPageSkeleton />
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="space-y-6">


      {/* ==================================================== */}
      {/* PAGE HEADER */}
      {/* ==================================================== */}

      <section
        className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div>

          <h1 className="text-[26px] font-bold tracking-tight text-[#1f2928]">
            Restaurants
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage restaurants, branches,
            operating hours and teams
          </p>

        </div>


        <Button
          onClick={() =>
            setCreateOpen(true)
          }
          className="
            self-start
            bg-[#9b6b2f]
            hover:bg-[#825823]
            md:self-auto
          "
        >

          <Plus
            size={17}
            className="mr-2"
          />

          Add restaurant

        </Button>

      </section>


      {/* ==================================================== */}
      {/* STATS */}
      {/* ==================================================== */}

      <RestaurantStats
        restaurants={restaurants}
      />


      {/* ==================================================== */}
      {/* TOOLBAR */}
      {/* ==================================================== */}

      <section
        className="
          flex
          flex-col
          gap-3
          rounded-xl
          border
          bg-white
          p-4
          shadow-sm
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        {/* Search */}

        <div className="relative w-full md:max-w-[360px]">

          <Search
            size={17}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search restaurants..."
            className="pl-9"
          />

        </div>


        {/* Filters */}

        <div className="flex flex-wrap items-center gap-2">

          <div className="flex items-center gap-1">

            <SlidersHorizontal
              size={16}
              className="mr-1 text-gray-400"
            />


            {(
              [
                "all",
                "active",
                "inactive",
                "deleted",
              ] as const
            ).map(
              (item) => (

                <Button
                  key={item}
                  variant={
                    filter === item
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setFilter(
                      item
                    )
                  }
                  className={
                    filter === item
                      ? "bg-[#9b6b2f] hover:bg-[#825823]"
                      : ""
                  }
                >
                  {item
                    .charAt(0)
                    .toUpperCase() +
                    item.slice(1)}
                </Button>

              )
            )}

          </div>


          <Button
            variant="outline"
            size="sm"
            onClick={
              handleRefresh
            }
            disabled={
              loading ||
              actionLoading
            }
          >

            <RefreshCw
              size={15}
              className={
                loading
                  ? "mr-2 animate-spin"
                  : "mr-2"
              }
            />

            Refresh

          </Button>

        </div>

      </section>


      {/* ==================================================== */}
      {/* RESULT COUNT */}
      {/* ==================================================== */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <h2 className="text-sm font-semibold text-[#202928]">
            Restaurants
          </h2>

          <Badge
            variant="secondary"
            className="rounded-full"
          >
            {filteredRestaurants.length}
          </Badge>

        </div>

      </div>


      {/* ==================================================== */}
      {/* CONTENT */}
      {/* ==================================================== */}

      {filteredRestaurants.length === 0 ? (

        <RestaurantEmptyState
          onCreate={() =>
            setCreateOpen(true)
          }
        />

      ) : (

        <RestaurantGrid
          restaurants={
            filteredRestaurants
          }

          onView={openRestaurantView}

          onEdit={openRestaurantEdit}

          onActivate={
            handleActivate
          }

          onDeactivate={
            handleDeactivate
          }

          onDelete={
            handleDelete
          }

          onRestore={
            handleRestore
          }
        />

      )}


      {/* ==================================================== */}
      {/* CREATE DIALOG */}
      {/* ==================================================== */}

      <CreateRestaurantDialog
        open={createOpen}
        onOpenChange={
          setCreateOpen
        }
        onSuccess={() => dispatch(getRestaurants())}
      />

      <RestaurantViewModal
        open={viewOpen}
        onOpenChange={setViewOpen}
        restaurantId={selectedRestaurant?._id ?? null}
      />

      <RestaurantEditModal
        key={editModalSession}
        open={editOpen}
        onOpenChange={setEditOpen}
        restaurant={selectedRestaurant}
        onSuccess={() => dispatch(getRestaurants())}
      />

      <Dialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open && !isConfirming) {
            setConfirmation(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={!isConfirming}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>{confirmation?.title}</DialogTitle>
            <DialogDescription>
              {confirmation?.description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isConfirming}
              onClick={() => setConfirmation(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={confirmation?.destructive ? "destructive" : "default"}
              disabled={isConfirming}
              onClick={confirmRestaurantAction}
            >
              {isConfirming ? "Working..." : confirmation?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
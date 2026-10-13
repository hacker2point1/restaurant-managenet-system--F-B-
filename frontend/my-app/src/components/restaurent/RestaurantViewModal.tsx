"use client";

import { useEffect } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store/store";

import {
  getRestaurantById,
  clearSelectedRestaurant,
} from "@/redux/slice/restaurentSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Separator,
} from "@/components/ui/separator";

import {
  Loader2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";

import RestaurantImageGallery from "./RestaurantImageGallery";

interface RestaurantViewModalProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  restaurantId: string | null;
}

const formatDate = (
  value?: string | null
) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const getStatusBadge = (
  isActive: boolean,
  isDeleted: boolean
) => {
  if (isDeleted) {
    return (
      <Badge variant="destructive">
        <Trash2 className="mr-1 h-3 w-3" />
        Deleted
      </Badge>
    );
  }

  if (isActive) {
    return (
      <Badge>
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <XCircle className="mr-1 h-3 w-3" />
      Inactive
    </Badge>
  );
};

export default function RestaurantViewModal({
  open,
  onOpenChange,
  restaurantId,
}: RestaurantViewModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    selectedRestaurant,
    getByIdLoading,
  } = useSelector(
    (state: RootState) => state.restaurant
  );

  useEffect(() => {
    if (
      open &&
      restaurantId
    ) {
      dispatch(
        getRestaurantById(restaurantId)
      );
    }

    return () => {
      if (!open) {
        dispatch(
          clearSelectedRestaurant()
        );
      }
    };
  }, [
    open,
    restaurantId,
    dispatch,
  ]);

  const restaurant =
    selectedRestaurant;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          dispatch(
            clearSelectedRestaurant()
          );
        }
      }}
    >
      <DialogContent
        className="
          max-w-5xl
          overflow-hidden
          p-0
        "
      >
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-xl">
            Restaurant Details
          </DialogTitle>

          <DialogDescription>
            View complete restaurant information.
          </DialogDescription>
        </DialogHeader>

        {getByIdLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />

              <p className="text-sm text-muted-foreground">
                Loading restaurant...
              </p>
            </div>
          </div>
        ) : !restaurant ? (
          <div className="flex h-80 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Restaurant not found.
            </p>
          </div>
        ) : (
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="space-y-6 p-6">

              {/* ================================================= */}
              {/* HEADER */}
              {/* ================================================= */}

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold">
                      {restaurant.name}
                    </h2>

                    {getStatusBadge(
                      restaurant.isActive,
                      restaurant.isDeleted
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Restaurant ID:{" "}
                    {restaurant._id}
                  </p>
                </div>
              </div>

              {/* ================================================= */}
              {/* IMAGES */}
              {/* ================================================= */}

              <section className="space-y-3">
                <h3 className="font-semibold">
                  Restaurant Images
                </h3>

                <RestaurantImageGallery
                  images={
                    restaurant.images
                  }
                />
              </section>

              <Separator />

              {/* ================================================= */}
              {/* BASIC INFORMATION */}
              {/* ================================================= */}

              <section className="space-y-4">
                <h3 className="font-semibold">
                  Basic Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="Name"
                    value={
                      restaurant.name
                    }
                  />

                  <InfoItem
                    label="Email"
                    value={
                      restaurant.email
                    }
                    icon={
                      <Mail className="h-4 w-4" />
                    }
                  />

                  <InfoItem
                    label="Phone"
                    value={
                      restaurant.phone
                    }
                    icon={
                      <Phone className="h-4 w-4" />
                    }
                  />

                  <InfoItem
                    label="Website"
                    value={
                      restaurant.website
                    }
                    icon={
                      <Globe className="h-4 w-4" />
                    }
                  />
                </div>

                <div className="rounded-xl border p-4">
                  <p className="mb-2 text-sm font-medium">
                    Description
                  </p>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {restaurant.description ||
                      "No description available."}
                  </p>
                </div>
              </section>

              <Separator />

              {/* ================================================= */}
              {/* ADDRESS */}
              {/* ================================================= */}

              <section className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>

                <div className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
                  <InfoItem
                    label="Street"
                    value={
                      restaurant.address
                        ?.street
                    }
                  />

                  <InfoItem
                    label="City"
                    value={
                      restaurant.address
                        ?.city
                    }
                  />

                  <InfoItem
                    label="State"
                    value={
                      restaurant.address
                        ?.state
                    }
                  />

                  <InfoItem
                    label="Country"
                    value={
                      restaurant.address
                        ?.country
                    }
                  />

                  <InfoItem
                    label="ZIP Code"
                    value={
                      restaurant.address
                        ?.zipCode
                    }
                  />
                </div>
              </section>

              <Separator />

              {/* ================================================= */}
              {/* CUISINE */}
              {/* ================================================= */}

              <section className="space-y-3">
                <h3 className="font-semibold">
                  Cuisine Types
                </h3>

                {restaurant.cuisineTypes
                  ?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {restaurant.cuisineTypes.map(
                      (cuisine) => (
                        <Badge
                          key={cuisine}
                          variant="outline"
                        >
                          {cuisine}
                        </Badge>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No cuisine types available.
                  </p>
                )}
              </section>

              <Separator />

              {/* ================================================= */}
              {/* BRANCHES */}
              {/* ================================================= */}

              <section className="space-y-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Building2 className="h-4 w-4" />
                  Branches
                </h3>

                {restaurant.branches
                  ?.length ? (
                  <div className="space-y-2">
                    {restaurant.branches.map(
                      (branchId, index) => (
                        <div
                          key={`${branchId}-${index}`}
                          className="rounded-lg border p-3"
                        >
                          <p className="text-xs text-muted-foreground">
                            Branch ID
                          </p>

                          <p className="font-mono text-sm">
                            {branchId}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No branches assigned.
                  </p>
                )}
              </section>

              <Separator />

              {/* ================================================= */}
              {/* SYSTEM INFORMATION */}
              {/* ================================================= */}

              <section className="space-y-4">
                <h3 className="font-semibold">
                  System Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoItem
                    label="Created By"
                    value={
                      restaurant.createdBy
                    }
                  />

                  <InfoItem
                    label="Restaurant ID"
                    value={
                      restaurant._id
                    }
                  />

                  <InfoItem
                    label="Created At"
                    value={formatDate(
                      restaurant.createdAt
                    )}
                    icon={
                      <CalendarDays className="h-4 w-4" />
                    }
                  />

                  <InfoItem
                    label="Updated At"
                    value={formatDate(
                      restaurant.updatedAt
                    )}
                    icon={
                      <Clock3 className="h-4 w-4" />
                    }
                  />

                  <InfoItem
                    label="Deleted At"
                    value={formatDate(
                      restaurant.deletedAt
                    )}
                  />
                </div>
              </section>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface InfoItemProps {
  label: string;

  value?: string | null;

  icon?: React.ReactNode;
}

function InfoItem({
  label,
  value,
  icon,
}: InfoItemProps) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium">
        {icon}
        {label}
      </div>

      <p className="break-all text-sm text-muted-foreground">
        {value || "N/A"}
      </p>
    </div>
  );
}
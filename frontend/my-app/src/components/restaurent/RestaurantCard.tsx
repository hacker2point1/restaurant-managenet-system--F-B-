"use client";

import Image from "next/image";

import {
  MoreHorizontal,
  Pencil,
  Eye,
  Power,
  PowerOff,
  Trash2,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  GitBranch,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Restaurant } from "@/types/restaurent";

interface RestaurantCardProps {
  restaurant: Restaurant;

  onView?: (restaurant: Restaurant) => void;

  onEdit?: (restaurant: Restaurant) => void;

  onActivate?: (id: string) => void;

  onDeactivate?: (id: string) => void;

  onDelete?: (id: string) => void;

  onRestore?: (id: string) => void;
}

export default function RestaurantCard({
  restaurant,

  onView,

  onEdit,

  onActivate,

  onDeactivate,

  onDelete,

  onRestore,
}: RestaurantCardProps) {

  const firstImage =
    restaurant.images?.[0]?.url;

  const initials =
    restaurant.name
      ?.split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "R";

  const address =
    restaurant.address;

  const addressText = [
    address?.street,
    address?.city,
    address?.state,
    address?.country,
    address?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  const branchCount =
    restaurant.branches?.length || 0;

  return (
    <Card
      className="
        overflow-hidden
        rounded-xl
        border
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >

      {/* IMAGE */}
      <div className="relative h-40 w-full bg-[#eef1f0]">

        {firstImage ? (
          <Image
            src={firstImage}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#172321]">

            <span className="text-2xl font-bold text-white">
              {initials}
            </span>

          </div>
        )}

        {/* STATUS */}
        <div className="absolute right-4 top-4">

          {restaurant.isDeleted ? (

            <Badge
              variant="destructive"
              className="bg-red-50 text-red-600 hover:bg-red-50"
            >
              Deleted
            </Badge>

          ) : restaurant.isActive ? (

            <Badge
              className="
                border
                border-emerald-200
                bg-emerald-50
                text-emerald-600
                hover:bg-emerald-50
              "
            >
              Active
            </Badge>

          ) : (

            <Badge
              variant="secondary"
              className="
                border
                border-gray-200
                bg-gray-100
                text-gray-600
              "
            >
              Inactive
            </Badge>

          )}

        </div>

      </div>


      <CardContent className="p-5">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="truncate text-lg font-semibold text-[#202928]">
              {restaurant.name}
            </h3>

            {restaurant.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                {restaurant.description}
              </p>
            )}

          </div>


          {/* MENU */}
          <DropdownMenu>

            <DropdownMenuTrigger
              render={
                <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
              >
                <MoreHorizontal size={19} />
                </Button>
              }
            />


            <DropdownMenuContent
              align="end"
              className="w-48"
            >

              <DropdownMenuItem
                onClick={() => onView?.(restaurant)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View restaurant
              </DropdownMenuItem>


              <DropdownMenuItem
                onClick={() =>
                  onEdit?.(restaurant)
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit restaurant
              </DropdownMenuItem>


              <DropdownMenuSeparator />


              {!restaurant.isDeleted &&
                restaurant.isActive && (

                  <DropdownMenuItem
                    onClick={() =>
                      onDeactivate?.(
                        restaurant._id
                      )
                    }
                  >
                    <PowerOff className="mr-2 h-4 w-4" />

                    Deactivate
                  </DropdownMenuItem>

                )}


              {!restaurant.isDeleted &&
                !restaurant.isActive && (

                  <DropdownMenuItem
                    onClick={() =>
                      onActivate?.(
                        restaurant._id
                      )
                    }
                  >
                    <Power className="mr-2 h-4 w-4" />

                    Activate
                  </DropdownMenuItem>

                )}


              {!restaurant.isDeleted && (

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() =>
                    onDelete?.(
                      restaurant._id
                    )
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />

                  Delete
                </DropdownMenuItem>

              )}


              {restaurant.isDeleted && (

                <DropdownMenuItem
                  onClick={() =>
                    onRestore?.(
                      restaurant._id
                    )
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4" />

                  Restore
                </DropdownMenuItem>

              )}

            </DropdownMenuContent>

          </DropdownMenu>

        </div>


        {/* ADDRESS */}
        {addressText && (

          <div className="mt-5 flex gap-2 text-sm text-gray-600">

            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-gray-400"
            />

            <span className="line-clamp-2">
              {addressText}
            </span>

          </div>

        )}


        {/* CONTACT */}
        <div className="mt-4 space-y-2">

          {restaurant.phone && (

            <div className="flex items-center gap-2 text-sm text-gray-500">

              <Phone size={14} />

              <span>
                {restaurant.phone}
              </span>

            </div>

          )}


          {restaurant.email && (

            <div className="flex min-w-0 items-center gap-2 text-sm text-gray-500">

              <Mail size={14} />

              <span className="truncate">
                {restaurant.email}
              </span>

            </div>

          )}

        </div>


        {/* BRANCHES */}
        <div className="mt-5 border-t pt-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <GitBranch
                size={16}
                className="text-gray-400"
              />

              <span className="text-sm text-gray-500">
                Branches
              </span>

            </div>

            <span className="font-semibold text-[#202928]">
              {branchCount}
            </span>

          </div>

        </div>


        {/* BUTTON */}
        <div className="mt-5 flex gap-2">

          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onView?.(restaurant)}
          >
            View restaurant
          </Button>


          <Button
            variant="ghost"
            onClick={() =>
              onEdit?.(restaurant)
            }
          >
            Edit
          </Button>

        </div>

      </CardContent>

    </Card>
  );
}
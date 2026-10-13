"use client";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  Star,
} from "lucide-react";

import type { MenuItem } from "@/types/menuItem";

import MenuItemSkeleton from "./MenuItemSkeleton";
import MenuItemEmptyState from "./MenuItemEmptyState";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* =========================================================
   PROPS
========================================================= */

interface Props {
  items: MenuItem[];
  loading: boolean;

  /*
   * Keep your existing logic by passing
   * the existing handlers from the parent.
   */

  onView?: (item: MenuItem) => void;

  onEdit?: (item: MenuItem) => void;

  onDelete?: (item: MenuItem) => void;

  onRestore?: (item: MenuItem) => void;

  onToggleAvailability?: (
    item: MenuItem
  ) => void;

  onToggleFeatured?: (
    item: MenuItem
  ) => void;
}


/* =========================================================
   MAIN TABLE
========================================================= */

export default function MenuItemsTable({
  items,
  loading,

  onView,
  onEdit,
  onDelete,
  onRestore,

  onToggleAvailability,
  onToggleFeatured,
}: Props) {

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <MenuItemSkeleton />;
  }


  /* =======================================================
     EMPTY
  ======================================================= */

  if (!items.length) {
    return <MenuItemEmptyState />;
  }


  /* =======================================================
     TABLE
  ======================================================= */

  return (
    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        {/* =================================================
            HEADER
        ================================================= */}

        <thead>

          <tr className="border-b bg-muted/20">

            <th className="px-5 py-4 text-left font-medium">
              ITEM
            </th>

            <th className="px-4 py-4 text-left font-medium">
              CATEGORY
            </th>

            <th className="px-4 py-4 text-left font-medium">
              PRICE
            </th>

            <th className="px-4 py-4 text-left font-medium">
              TYPE
            </th>

            <th className="px-4 py-4 text-left font-medium">
              PREP TIME
            </th>

            <th className="px-4 py-4 text-left font-medium">
              RATING
            </th>

            <th className="px-4 py-4 text-center font-medium">
              ACTIONS
            </th>

          </tr>

        </thead>


        {/* =================================================
            BODY
        ================================================= */}

        <tbody>

          {items.map((item) => (

            <MenuItemRow
              key={item._id}
              item={item}

              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}

              onToggleAvailability={
                onToggleAvailability
              }

              onToggleFeatured={
                onToggleFeatured
              }
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}


/* =========================================================
   TABLE ROW
========================================================= */

function MenuItemRow({
  item,

  onView,
  onEdit,
  onDelete,
  onRestore,

  onToggleAvailability,
  onToggleFeatured,
}: {
  item: MenuItem;

  onView?: (item: MenuItem) => void;

  onEdit?: (item: MenuItem) => void;

  onDelete?: (item: MenuItem) => void;

  onRestore?: (item: MenuItem) => void;

  onToggleAvailability?: (
    item: MenuItem
  ) => void;

  onToggleFeatured?: (
    item: MenuItem
  ) => void;
}) {

  /* =======================================================
     IMAGE
  ======================================================= */

  const image =
    item.images?.[0]?.url;


  /* =======================================================
     CATEGORY
  ======================================================= */

  const categoryName =
    typeof item.category === "string"
      ? item.category
      : item.category?.name;


  /* =======================================================
     RETURN
  ======================================================= */

  return (

    <tr
      className={`
        border-b
        last:border-0
        hover:bg-muted/20
        ${item.isDeleted ? "opacity-60" : ""}
      `}
    >

      {/* ===================================================
          ITEM
      =================================================== */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          {image ? (

            <img
              src={image}
              alt={item.name}
              className="
                h-10
                w-10
                rounded-lg
                object-cover
              "
            />

          ) : (

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                bg-muted
                text-xs
              "
            >
              IMG
            </div>

          )}

          <div className="min-w-0">

            <span className="block font-medium">
              {item.name}
            </span>

            {item.isDeleted && (

              <span
                className="
                  mt-0.5
                  block
                  text-xs
                  text-red-500
                "
              >
                Deleted
              </span>

            )}

          </div>

        </div>

      </td>


      {/* ===================================================
          CATEGORY
      =================================================== */}

      <td
        className="
          px-4
          py-4
          text-muted-foreground
        "
      >
        {categoryName || "-"}
      </td>


      {/* ===================================================
          PRICE
      =================================================== */}

      <td
        className="
          px-4
          py-4
          font-semibold
        "
      >
        ₹{item.price}
      </td>


      {/* ===================================================
          FOOD TYPE
      =================================================== */}

      <td className="px-4 py-4">

        <FoodTypeBadge
          type={item.foodType}
        />

      </td>


      {/* ===================================================
          PREPARATION TIME
      =================================================== */}

      <td
        className="
          px-4
          py-4
          text-muted-foreground
        "
      >
        {item.preparationTime
          ? `${item.preparationTime} min`
          : "-"}
      </td>


      {/* ===================================================
          RATING
      =================================================== */}

      <td className="px-4 py-4">

        <div className="flex items-center gap-1">

          <span className="text-yellow-500">
            ★
          </span>

          <span>
            {item.averageRating?.toFixed(1) ||
              "0.0"}
          </span>

        </div>

      </td>


      {/* ===================================================
          ACTIONS
      =================================================== */}

      <td className="px-4 py-4 text-center">

        <MenuItemActions
          item={item}

          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}

          onToggleAvailability={
            onToggleAvailability
          }

          onToggleFeatured={
            onToggleFeatured
          }
        />

      </td>

    </tr>
  );
}


/* =========================================================
   FOOD TYPE BADGE
========================================================= */

function FoodTypeBadge({
  type,
}: {
  type: string;
}) {

  const isVeg =
    type === "vegetarian" ||
    type === "vegan";


  return (

    <span
      className={
        isVeg
          ? `
            rounded-md
            border
            border-green-200
            bg-green-50
            px-2
            py-1
            text-xs
            text-green-600
          `
          : `
            rounded-md
            border
            border-red-200
            bg-red-50
            px-2
            py-1
            text-xs
            text-red-600
          `
      }
    >
      {isVeg
        ? "● Veg"
        : "● Non-veg"}

    </span>
  );
}


/* =========================================================
   ACTION MENU
========================================================= */

function MenuItemActions({
  item,

  onView,
  onEdit,
  onDelete,
  onRestore,

  onToggleAvailability,
  onToggleFeatured,
}: {
  item: MenuItem;

  onView?: (item: MenuItem) => void;

  onEdit?: (item: MenuItem) => void;

  onDelete?: (item: MenuItem) => void;

  onRestore?: (item: MenuItem) => void;

  onToggleAvailability?: (
    item: MenuItem
  ) => void;

  onToggleFeatured?: (
    item: MenuItem
  ) => void;
}) {

  return (

    <DropdownMenu>

      {/* =================================================
          THREE DOT BUTTON
      ================================================= */}

      <DropdownMenuTrigger
        type="button"
        className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Open menu"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>


      {/* =================================================
          DROPDOWN
      ================================================= */}

      <DropdownMenuContent
        align="end"
        className="w-52"
      >

        {/* =================================================
            VIEW
        ================================================= */}

        <DropdownMenuItem
          onClick={() =>
            onView?.(item)
          }
        >

          <Eye className="mr-2 h-4 w-4" />

          View

        </DropdownMenuItem>


        {/* =================================================
            EDIT
        ================================================= */}

        {!item.isDeleted && (

          <DropdownMenuItem
            onClick={() =>
              onEdit?.(item)
            }
          >

            <Pencil className="mr-2 h-4 w-4" />

            Edit

          </DropdownMenuItem>

        )}


        <DropdownMenuSeparator />


        {/* =================================================
            AVAILABLE
        ================================================= */}

        {!item.isDeleted && (

          <DropdownMenuItem
            onClick={() =>
              onToggleAvailability?.(
                item
              )
            }
          >

            <Check className="mr-2 h-4 w-4" />

            {item.isAvailable
              ? "Mark unavailable"
              : "Mark available"}

          </DropdownMenuItem>

        )}


        {/* =================================================
            FEATURED
        ================================================= */}

        {!item.isDeleted && (

          <DropdownMenuItem
            onClick={() =>
              onToggleFeatured?.(
                item
              )
            }
          >

            <Star
              className={`
                mr-2
                h-4
                w-4

                ${
                  item.isFeatured
                    ? "fill-current"
                    : ""
                }
              `}
            />

            {item.isFeatured
              ? "Remove featured"
              : "Mark as featured"}

          </DropdownMenuItem>

        )}


        {/* =================================================
            DELETE
        ================================================= */}

        {!item.isDeleted && (

          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() =>
                onDelete?.(item)
              }
              className="
                text-red-600
                focus:bg-red-50
                focus:text-red-600
              "
            >

              <Trash2
                className="
                  mr-2
                  h-4
                  w-4
                "
              />

              Delete

            </DropdownMenuItem>
          </>

        )}


        {/* =================================================
            RESTORE
        ================================================= */}

        {item.isDeleted && (

          <DropdownMenuItem
            onClick={() =>
              onRestore?.(item)
            }
            className="
              text-emerald-600
              focus:bg-emerald-50
              focus:text-emerald-600
            "
          >

            <RotateCcw
              className="
                mr-2
                h-4
                w-4
              "
            />

            Restore

          </DropdownMenuItem>

        )}

      </DropdownMenuContent>

    </DropdownMenu>
  );
}
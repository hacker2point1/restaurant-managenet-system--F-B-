"use client";

import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  RotateCcw,
  AlertTriangle,
  Ticket,
  CalendarDays,
  Users,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Badge,
} from "@/components/ui/badge";

import CouponStatusBadge from "./CouponStatusBadge";

import CouponAudienceBadge from "./CouponAudienceBadge";

import type { Coupon } from "@/types/coupon";


/* =========================================================
   PROPS
========================================================= */

interface Props {
  coupons: Coupon[];

  loading: boolean;

  restoreMode: boolean;

  onView: (
    coupon: Coupon
  ) => void;

  onEdit: (
    coupon: Coupon
  ) => void;

  onDelete: (
    coupon: Coupon
  ) => void;

  onActivate: (
    coupon: Coupon
  ) => void;

  onDeactivate: (
    coupon: Coupon
  ) => void;

  onRestore: (
    coupon: Coupon
  ) => void;

  onPermanentDelete: (
    coupon: Coupon
  ) => void;
}


/* =========================================================
   HELPERS
========================================================= */

const currency = (
  value?: number
) => {

  if (
    value === undefined ||
    value === null
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(value);
};


const formatDate = (
  value: string
) => {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(
    new Date(value)
  );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CouponTable({
  coupons,
  loading,
  restoreMode,

  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onRestore,
  onPermanentDelete,
}: Props) {

  return (

    <div
      className="
        overflow-hidden
        rounded-xl
        border
        bg-background
        shadow-sm
      "
    >

      <div className="overflow-x-auto">

        <Table>

          {/* =================================================
              TABLE HEADER
          ================================================= */}

          <TableHeader>

            <TableRow
              className="
                bg-muted/30
                hover:bg-muted/30
              "
            >

              <TableHead
                className="
                  h-12
                  min-w-[170px]
                  px-5
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Coupon
              </TableHead>


              <TableHead
                className="
                  h-12
                  min-w-[140px]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Discount
              </TableHead>


              <TableHead
                className="
                  h-12
                  min-w-[130px]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Min. Order
              </TableHead>


              <TableHead
                className="
                  h-12
                  min-w-[140px]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Max. Discount
              </TableHead>


              <TableHead
                className="
                  h-12
                  min-w-[120px]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Usage
              </TableHead>


              <TableHead
                className="
                  h-12
                  min-w-[160px]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Validity
              </TableHead>


              <TableHead
                className="
                  h-12
                  min-w-[130px]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Audience
              </TableHead>


              <TableHead
                className="
                  h-12
                  min-w-[120px]
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Status
              </TableHead>


              <TableHead
                className="
                  h-12
                  w-[70px]
                  text-right
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-muted-foreground
                "
              >
                Actions
              </TableHead>

            </TableRow>

          </TableHeader>


          {/* =================================================
              TABLE BODY
          ================================================= */}

          <TableBody>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              Array.from({
                length: 5,
              }).map((_, index) => (

                <TableRow
                  key={index}
                  className="hover:bg-transparent"
                >

                  {Array.from({
                    length: 9,
                  }).map(
                    (_, cellIndex) => (

                      <TableCell
                        key={cellIndex}
                        className="py-5"
                      >

                        <div
                          className="
                            h-5
                            animate-pulse
                            rounded-md
                            bg-muted
                          "
                        />

                      </TableCell>

                    )
                  )}

                </TableRow>

              ))

            ) : coupons.length === 0 ? (

              /* =================================================
                  EMPTY STATE
              ================================================= */

              <TableRow>

                <TableCell
                  colSpan={9}
                  className="h-72"
                >

                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      justify-center
                      text-center
                    "
                  >

                    <div
                      className="
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                        bg-muted
                      "
                    >

                      <Ticket
                        className="
                          h-6
                          w-6
                          text-muted-foreground
                        "
                      />

                    </div>


                    <p
                      className="
                        font-semibold
                        text-foreground
                      "
                    >
                      {restoreMode
                        ? "No deleted coupons"
                        : "No coupons found"}
                    </p>


                    <p
                      className="
                        mt-1
                        max-w-sm
                        text-sm
                        text-muted-foreground
                      "
                    >
                      {restoreMode
                        ? "Deleted coupons will appear here."
                        : "Create a coupon to get started."}
                    </p>

                  </div>

                </TableCell>

              </TableRow>

            ) : (

              /* =================================================
                  COUPONS
              ================================================= */

              coupons.map(
                (coupon) => (

                  <TableRow
                    key={coupon._id}
                    className="
                      group
                      border-b
                      transition-colors
                      hover:bg-muted/20
                    "
                  >

                    {/* =================================================
                        COUPON
                    ================================================= */}

                    <TableCell className="px-5 py-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#fbf6eb]
                            text-[#8B6126]
                          "
                        >

                          <Ticket
                            className="
                              h-4
                              w-4
                            "
                          />

                        </div>


                        <div className="min-w-0">

                          <span
                            className="
                              block
                              truncate
                              font-mono
                              text-sm
                              font-bold
                              tracking-wide
                            "
                          >
                            {coupon.code}
                          </span>


                          <span
                            className="
                              mt-0.5
                              block
                              text-xs
                              text-muted-foreground
                            "
                          >
                            Coupon code
                          </span>

                        </div>

                      </div>

                    </TableCell>


                    {/* =================================================
                        DISCOUNT
                    ================================================= */}

                    <TableCell className="py-4">

                      <div>

                        <p
                          className="
                            font-semibold
                            text-[#8B6126]
                          "
                        >

                          {coupon.discountType ===
                          "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `${currency(
                                coupon.discountValue
                              )} OFF`}

                        </p>


                        <Badge
                          variant="secondary"
                          className="
                            mt-1
                            h-5
                            px-1.5
                            text-[10px]
                            font-medium
                          "
                        >

                          {coupon.discountType ===
                          "percentage"
                            ? "Percentage"
                            : "Fixed"}

                        </Badge>

                      </div>

                    </TableCell>


                    {/* =================================================
                        MINIMUM ORDER
                    ================================================= */}

                    <TableCell className="py-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <ShoppingBag
                          className="
                            h-4
                            w-4
                            text-muted-foreground
                          "
                        />

                        <span className="font-medium">

                          {currency(
                            coupon.minimumOrderAmount
                          )}

                        </span>

                      </div>

                    </TableCell>


                    {/* =================================================
                        MAX DISCOUNT
                    ================================================= */}

                    <TableCell className="py-4">

                      <span
                        className="
                          font-medium
                        "
                      >
                        {currency(
                          coupon.maximumDiscountAmount
                        )}
                      </span>

                    </TableCell>


                    {/* =================================================
                        USAGE
                    ================================================= */}

                    <TableCell className="py-4">

                      <div
                        className="
                          min-w-[100px]
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                          "
                        >

                          <span
                            className="
                              text-sm
                              font-semibold
                            "
                          >
                            {coupon.usageCount}
                            {coupon.usageLimit !==
                            undefined
                              ? ` / ${coupon.usageLimit}`
                              : " / ∞"}
                          </span>

                        </div>


                        {coupon.usageLimit && (

                          <div
                            className="
                              mt-2
                              h-1.5
                              overflow-hidden
                              rounded-full
                              bg-muted
                            "
                          >

                            <div
                              className="
                                h-full
                                rounded-full
                                bg-[#B78A45]
                                transition-all
                              "
                              style={{
                                width: `${Math.min(
                                  (coupon.usageCount /
                                    coupon.usageLimit) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        )}

                      </div>

                    </TableCell>


                    {/* =================================================
                        VALIDITY
                    ================================================= */}

                    <TableCell className="py-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          whitespace-nowrap
                        "
                      >

                        <CalendarDays
                          className="
                            h-4
                            w-4
                            shrink-0
                            text-muted-foreground
                          "
                        />

                        <span
                          className="
                            text-sm
                            text-muted-foreground
                          "
                        >

                          {formatDate(
                            coupon.startDate
                          )}

                          <span className="mx-1.5">
                            →
                          </span>

                          {formatDate(
                            coupon.expiryDate
                          )}

                        </span>

                      </div>

                    </TableCell>


                    {/* =================================================
                        AUDIENCE
                    ================================================= */}

                    <TableCell className="py-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <Users
                          className="
                            h-4
                            w-4
                            text-muted-foreground
                          "
                        />

                        <CouponAudienceBadge
                          customersCount={
                            coupon
                              .applicableCustomers
                              ?.length || 0
                          }
                        />

                      </div>

                    </TableCell>


                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <TableCell className="py-4">

                      {restoreMode ? (

                        <Badge
                          variant="secondary"
                          className="
                            gap-1.5
                            font-medium
                          "
                        >

                          <span
                            className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-muted-foreground
                            "
                          />

                          Deleted

                        </Badge>

                      ) : (

                        <CouponStatusBadge
                          isActive={
                            coupon.isActive
                          }
                          expiryDate={
                            coupon.expiryDate
                          }
                        />

                      )}

                    </TableCell>


                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <TableCell className="py-4">

                      <div
                        className="
                          flex
                          justify-end
                        "
                      >

                        {restoreMode ? (

                          /* =================================================
                              RESTORE MODE ACTIONS
                          ================================================= */

                          <DropdownMenu>

                            <DropdownMenuTrigger
                              asChild
                            >

                              <Button
                                variant="ghost"
                                size="icon"
                                className="
                                  h-8
                                  w-8
                                  rounded-lg
                                  text-muted-foreground
                                  opacity-70
                                  transition-opacity
                                  hover:bg-muted
                                  hover:text-foreground
                                  group-hover:opacity-100
                                "
                              >

                                <MoreHorizontal
                                  className="
                                    h-4
                                    w-4
                                  "
                                />

                              </Button>

                            </DropdownMenuTrigger>


                            <DropdownMenuContent
                              align="end"
                              className="w-48"
                            >

                              <DropdownMenuItem
                                onClick={() =>
                                  onRestore(
                                    coupon
                                  )
                                }
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


                              <DropdownMenuSeparator />


                              <DropdownMenuItem
                                className="
                                  text-destructive
                                  focus:text-destructive
                                "
                                onClick={() =>
                                  onPermanentDelete(
                                    coupon
                                  )
                                }
                              >

                                <AlertTriangle
                                  className="
                                    mr-2
                                    h-4
                                    w-4
                                  "
                                />

                                Permanent Delete

                              </DropdownMenuItem>

                            </DropdownMenuContent>

                          </DropdownMenu>

                        ) : (

                          /* =================================================
                              NORMAL ACTIONS
                          ================================================= */

                          <DropdownMenu>

                            <DropdownMenuTrigger
                              asChild
                            >

                              <Button
                                variant="ghost"
                                size="icon"
                                className="
                                  h-8
                                  w-8
                                  rounded-lg
                                  text-muted-foreground
                                  opacity-70
                                  transition-opacity
                                  hover:bg-muted
                                  hover:text-foreground
                                  group-hover:opacity-100
                                "
                              >

                                <MoreHorizontal
                                  className="
                                    h-4
                                    w-4
                                  "
                                />

                              </Button>

                            </DropdownMenuTrigger>


                            <DropdownMenuContent
                              align="end"
                              className="w-48"
                            >

                              {/* VIEW */}

                              <DropdownMenuItem
                                onClick={() =>
                                  onView(
                                    coupon
                                  )
                                }
                              >

                                <Eye
                                  className="
                                    mr-2
                                    h-4
                                    w-4
                                  "
                                />

                                View

                              </DropdownMenuItem>


                              {/* EDIT */}

                              <DropdownMenuItem
                                onClick={() =>
                                  onEdit(
                                    coupon
                                  )
                                }
                              >

                                <Pencil
                                  className="
                                    mr-2
                                    h-4
                                    w-4
                                  "
                                />

                                Edit

                              </DropdownMenuItem>


                              {/* ACTIVATE / DEACTIVATE */}

                              {coupon.isActive ? (

                                <DropdownMenuItem
                                  onClick={() =>
                                    onDeactivate(
                                      coupon
                                    )
                                  }
                                >

                                  <PowerOff
                                    className="
                                      mr-2
                                      h-4
                                      w-4
                                    "
                                  />

                                  Deactivate

                                </DropdownMenuItem>

                              ) : (

                                <DropdownMenuItem
                                  onClick={() =>
                                    onActivate(
                                      coupon
                                    )
                                  }
                                >

                                  <Power
                                    className="
                                      mr-2
                                      h-4
                                      w-4
                                    "
                                  />

                                  Activate

                                </DropdownMenuItem>

                              )}


                              <DropdownMenuSeparator />


                              {/* DELETE */}

                              <DropdownMenuItem
                                className="
                                  text-destructive
                                  focus:text-destructive
                                "
                                onClick={() =>
                                  onDelete(
                                    coupon
                                  )
                                }
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

                            </DropdownMenuContent>

                          </DropdownMenu>

                        )}

                      </div>

                    </TableCell>

                  </TableRow>

                )

              )

            )}

          </TableBody>

        </Table>

      </div>

    </div>
  );
}
"use client";

import {
  Eye,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import TransactionTypeBadge from "./TransactionTypeBadge";

import type {
  InventoryTransaction,
} from "@/types/inventoryTransaction";

interface Props {
  transactions: InventoryTransaction[];

  loading: boolean;

  onView: (
    transaction: InventoryTransaction
  ) => void;
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const getTransactionCode = (
  id: string
) => {
  return `TXN-${id.slice(-4).toUpperCase()}`;
};

export default function InventoryTransactionTable({
  transactions,
  loading,
  onView,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>
                TRANSACTION
              </TableHead>

              <TableHead>
                ITEM
              </TableHead>

              <TableHead>
                TYPE
              </TableHead>

              <TableHead>
                QUANTITY
              </TableHead>

              <TableHead>
                BRANCH
              </TableHead>

              <TableHead>
                RECORDED BY
              </TableHead>

              <TableHead>
                DATE & TIME
              </TableHead>

              {/* <TableHead>
                REFERENCE
              </TableHead> */}

              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              Array.from({
                length: 5,
              }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({
                    length: 9,
                  }).map(
                    (_, cellIndex) => (
                      <TableCell
                        key={cellIndex}
                      >
                        <div className="h-5 animate-pulse rounded bg-muted" />
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <p className="font-medium">
                      No transactions found
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Try changing your filters or record a new transaction.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map(
                (transaction) => {
                  const isPositive =
                    transaction.type ===
                      "stock-in" ||
                    transaction.type ===
                      "purchase" ||
                    transaction.type ===
                      "return";

                  return (
                    <TableRow
                      key={
                        transaction._id
                      }
                      className="hover:bg-muted/30"
                    >
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {getTransactionCode(
                            transaction._id
                          )}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-semibold">
                            {
                              transaction
                                .inventoryItem
                                .name
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              transaction
                                .inventoryItem
                                .sku
                            }
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <TransactionTypeBadge
                          type={
                            transaction.type
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <span
                          className={`font-semibold ${
                            isPositive
                              ? "text-emerald-600"
                              : transaction.type ===
                                "wastage"
                              ? "text-red-600"
                              : "text-foreground"
                          }`}
                        >
                          {isPositive
                            ? "+"
                            : transaction.type ===
                              "adjustment"
                            ? "±"
                            : "-"}
                          {transaction.quantity}{" "}
                          {
                            transaction
                              .inventoryItem
                              .unit
                          }
                        </span>
                      </TableCell>

                      <TableCell>
                        {
                          transaction.branch
                            .name
                        }
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {
                              transaction
                                .performedBy
                                .name
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              transaction
                                .performedBy
                                .email
                            }
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(
                          transaction.transactionDate
                        )}
                      </TableCell>

                      {/* <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">
                          {transaction.referenceId ||
                            "—"}
                        </span>
                      </TableCell> */}

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                onView(
                                  transaction
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                }
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
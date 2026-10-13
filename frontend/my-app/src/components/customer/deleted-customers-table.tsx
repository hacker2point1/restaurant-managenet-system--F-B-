
"use client";

import { MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Customer } from "@/types/customer";

interface Props {
  customers: Customer[];
  isAdmin: boolean;
  onRestore: (customer: Customer) => void;
  onPermanentDelete: (customer: Customer) => void;
}

export function DeletedCustomersTable({
  customers, isAdmin, onRestore, onPermanentDelete,
}: Props) {
  if (!customers.length) {
    return (
      <div className="p-12 text-center">
        <Trash2 className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="font-medium">Recycle Bin is empty</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleted customers will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Deleted At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell>
                <p className="font-medium">{customer.name}</p>
              </TableCell>
              <TableCell>
                {customer.phone ||
                  (typeof customer.user === "object"
                    ? customer.user?.phone
                    : undefined) ||
                  "—"}
              </TableCell>
              <TableCell>{customer.email || "—"}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {customer.deletedAt
                  ? new Date(customer.deletedAt).toLocaleString("en-IN")
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for deleted customer ${customer.name}`}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onRestore(customer)}>
                      <RotateCcw className="mr-2 size-4" />
                      Restore customer
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => onPermanentDelete(customer)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Permanently delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

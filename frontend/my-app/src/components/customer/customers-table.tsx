
"use client";

import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Customer } from "@/types/customer";

interface Props {
  customers: Customer[];
  search?: string;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onToggleStatus: (customer: Customer) => void;
}

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

export function CustomersTable({
  customers, search, onView, onEdit, onDelete, onToggleStatus,
}: Props) {
  if (!customers.length) {
    return (
      <div className="p-12 text-center">
        <p className="font-medium">
          {search ? "No search results found" : "No customers found"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[240px]">Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Total Visits</TableHead>
            <TableHead>Total Spending</TableHead>
            <TableHead>Loyalty Points</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F0E6D2] text-xs font-semibold text-[#765326]">
                    {initials(customer.name || "?")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{customer.name}</p>
                    <p className="max-w-[190px] truncate text-xs text-muted-foreground">
                      {customer.email || "No email"}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="whitespace-nowrap text-muted-foreground">
                {customer.phone ||
                  (typeof customer.user === "object"
                    ? customer.user?.phone
                    : undefined) ||
                  "—"}
              </TableCell>
              <TableCell>{customer.totalVisits ?? 0}</TableCell>
              <TableCell className="font-semibold">
                {money(customer.totalSpent)}
              </TableCell>
              <TableCell className="font-semibold text-[#8B642F]">
                ✦ {customer.loyaltyPoints ?? 0}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {customer.lastVisitAt
                  ? new Date(customer.lastVisitAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                    })
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={customer.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"}
                >
                  {customer.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${customer.name}`}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(customer)}>
                      <Eye className="mr-2 size-4" /> View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(customer)}>
                      <Pencil className="mr-2 size-4" /> Edit customer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStatus(customer)}>
                      {customer.isActive ? "Deactivate customer" : "Activate customer"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(customer)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" /> Move to recycle bin
                    </DropdownMenuItem>
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

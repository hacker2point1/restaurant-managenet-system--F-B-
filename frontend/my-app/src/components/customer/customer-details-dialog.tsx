
"use client";

import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Customer } from "@/types/customer";

interface Props {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({
  customer, open, onOpenChange,
}: Props) {
  if (!customer) return null;

  const address = customer.address;
  const fullAddress = [
    address?.street, address?.city, address?.state,
    address?.zipCode, address?.country,
  ].filter(Boolean).join(", ");

  const fields = [
    ["Email", customer.email || "—"],
    ["Phone", customer.phone || "—"],
    ["Loyalty points", String(customer.loyaltyPoints ?? 0)],
    ["Total visits", String(customer.totalVisits ?? 0)],
    ["Total spending", new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0,
    }).format(customer.totalSpent ?? 0)],
    ["Last visit", customer.lastVisitAt
      ? new Date(customer.lastVisitAt).toLocaleString("en-IN")
      : "No visits recorded"],
    ["Address", fullAddress || "No address provided"],
    ["Created", new Date(customer.createdAt).toLocaleDateString("en-IN")],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer.name}</DialogTitle>
          <DialogDescription>Customer profile and activity summary.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#F0E6D2] font-semibold text-[#765326]">
            {customer.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.email || "No email"}</p>
            <Badge variant="outline" className="mt-1">
              {customer.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 break-words text-sm font-medium">{value}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Customer, CustomerFormData } from "@/types/customer";

const blankForm: CustomerFormData = {
  name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  country: "India",
  zipCode: "",
  loyaltyPoints: "0",
  isActive: true,
};

interface Props {
  open: boolean;
  customer?: Customer | null;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
}

export function CustomerFormDialog({
  open, customer, loading = false, onOpenChange, onSubmit,
}: Props) {
  const [form, setForm] = useState<CustomerFormData>(blankForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(customer ? {
      name: customer.name ?? "",
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      street: customer.address?.street ?? "",
      city: customer.address?.city ?? "",
      state: customer.address?.state ?? "",
      country: customer.address?.country ?? "India",
      zipCode: customer.address?.zipCode ?? "",
      loyaltyPoints: String(customer.loyaltyPoints ?? 0),
      isActive: customer.isActive ?? true,
    } : { ...blankForm });

    setFormError("");
  }, [open, customer]);

  function change<K extends keyof CustomerFormData>(
    key: K,
    value: CustomerFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Customer name is required.");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    if (
      !Number.isFinite(Number(form.loyaltyPoints)) ||
      Number(form.loyaltyPoints) < 0
    ) {
      setFormError("Loyalty points must be zero or greater.");
      return;
    }

    await onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit customer" : "Add customer"}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? "Update the customer's contact and profile details."
              : "Enter the customer details to add them to your database."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-6">
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer information
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customer-name">Full name *</Label>
                <Input
                  id="customer-name"
                  value={form.name}
                  onChange={(e) => change("name", e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input
                  id="customer-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => change("email", e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-phone">Phone</Label>
                <Input
                  id="customer-phone"
                  value={form.phone}
                  onChange={(e) => change("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Address
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customer-street">Street</Label>
                <Input
                  id="customer-street"
                  value={form.street}
                  onChange={(e) => change("street", e.target.value)}
                  placeholder="House number, street, area"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-city">City</Label>
                <Input
                  id="customer-city"
                  value={form.city}
                  onChange={(e) => change("city", e.target.value)}
                  placeholder="Kolkata"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-state">State</Label>
                <Input
                  id="customer-state"
                  value={form.state}
                  onChange={(e) => change("state", e.target.value)}
                  placeholder="West Bengal"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-country">Country</Label>
                <Input
                  id="customer-country"
                  value={form.country}
                  onChange={(e) => change("country", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-zip">Postal code</Label>
                <Input
                  id="customer-zip"
                  value={form.zipCode}
                  onChange={(e) => change("zipCode", e.target.value)}
                  placeholder="700001"
                />
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer-loyalty">Loyalty points</Label>
              <Input
                id="customer-loyalty"
                type="number"
                min="0"
                value={form.loyaltyPoints}
                onChange={(e) => change("loyaltyPoints", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="customer-active">Active customer</Label>
                <p className="text-xs text-muted-foreground">
                  Allow this customer to remain active.
                </p>
              </div>
              <Switch
                id="customer-active"
                checked={form.isActive}
                onCheckedChange={(value) => change("isActive", value)}
              />
            </div>
          </section>

          {formError && (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#8B642F] text-white hover:bg-[#765326]"
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {customer ? "Save changes" : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AxiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";
import LoginModal from "@/src/components/auth/LoginModal";
import type { RootState } from "@/redux/store/store";

interface Branch {
  _id: string;
  name: string;
  branchCode: string;
  contact?: { phone?: string; email?: string };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface RestaurantDetails {
  _id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: Branch["address"];
  cuisineTypes?: string[];
  logo?: string;
  website?: string;
  images?: { url: string }[];
  branches: Branch[];
}

interface RestaurantDetailsResponse {
  status: boolean;
  message: string;
  data: RestaurantDetails;
}

interface AvailableTable {
  _id: string;
  tableNumber: string;
  capacity: number;
  location: string;
}

interface AvailabilityResponse {
  status: boolean;
  message: string;
  data: {
    available: boolean;
    tables: AvailableTable[];
  };
}

interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CustomerListResponse {
  status: boolean;
  message: string;
  data: Customer[];
}

interface CustomerResponse {
  status: boolean;
  message: string;
  data: Customer;
}

function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function makeDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function getApiError(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

interface RestaurantDetailPageProps {
  restaurantId: string;
}

export default function RestaurantDetailPage({
  restaurantId,
}: RestaurantDetailPageProps) {
  const router = useRouter();
  const { isloggedIn, user } = useSelector((state: RootState) => state.auth);
  const [restaurant, setRestaurant] = useState<RestaurantDetails | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [date, setDate] = useState(() => getLocalDate(new Date()));
  const [time, setTime] = useState("19:00");
  const [guestCount, setGuestCount] = useState(2);
  const [tables, setTables] = useState<AvailableTable[]>([]);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingTableId, setBookingTableId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customersLoading, setCustomersLoading] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const canSelectCustomer = ["admin", "manager", "staff"].includes(user?.role || "");
  const canCreateCustomer = ["admin", "manager", "staff"].includes(user?.role || "");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRestaurant() {
      setLoading(true);
      setError(null);

      try {
        const response = await AxiosInstance.get<RestaurantDetailsResponse>(
          endpoints.restaurant.getPublicById(restaurantId),
          { signal: controller.signal }
        );

        if (!response.data.status) {
          throw new Error(response.data.message || "Restaurant not found.");
        }

        setRestaurant(response.data.data);
        setSelectedBranchId(response.data.data.branches[0]?._id || "");
      } catch (loadError: unknown) {
        if (controller.signal.aborted) return;
        setError(getApiError(loadError, "Unable to load this restaurant."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadRestaurant();
    return () => controller.abort();
  }, [restaurantId]);

  useEffect(() => {
    if (!bookingOpen || !canSelectCustomer) return;

    const controller = new AbortController();

    async function loadCustomers() {
      setCustomersLoading(true);

      try {
        const response = await AxiosInstance.get<CustomerListResponse>(
          endpoints.customer.getAll,
          {
            params: { limit: 100, search: customerSearch.trim() || undefined },
            signal: controller.signal,
          }
        );

        if (!response.data.status) {
          throw new Error(response.data.message || "Unable to load customers.");
        }

        setCustomers(response.data.data);
      } catch (loadError: unknown) {
        if (!controller.signal.aborted) {
          toast.error(getApiError(loadError, "Unable to load customers."));
        }
      } finally {
        if (!controller.signal.aborted) setCustomersLoading(false);
      }
    }

    const timeout = window.setTimeout(() => void loadCustomers(), customerSearch ? 250 : 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [bookingOpen, canSelectCustomer, customerSearch]);

  const selectedBranch = restaurant?.branches.find(
    (branch) => branch._id === selectedBranchId
  );

  async function checkAvailability() {
    if (!selectedBranchId) return;

    setCheckingAvailability(true);
    setTables([]);
    setAvailabilityChecked(false);

    try {
      const startTime = makeDateTime(date, time);
      const endTime = new Date(
        new Date(startTime).getTime() + 2 * 60 * 60 * 1000
      ).toISOString();
      const reservationDate = makeDateTime(date, "00:00");

      const response = await AxiosInstance.get<AvailabilityResponse>(
        endpoints.reservation.checkPublicAvailability(selectedBranchId),
        {
          params: { reservationDate, startTime, endTime, guestCount },
        }
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Could not check availability.");
      }

      setTables(response.data.data.tables);
      setAvailabilityChecked(true);
    } catch (availabilityError: unknown) {
      toast.error(getApiError(availabilityError, "Could not check availability."));
    } finally {
      setCheckingAvailability(false);
    }
  }

  async function bookTable(table: AvailableTable) {
    if (!isloggedIn) {
      setLoginOpen(true);
      return;
    }

    if (user?.role !== "customer" && !canSelectCustomer) {
      toast.error("Sign in with a customer account to book a table.");
      return;
    }

    if (canSelectCustomer && !selectedCustomerId) {
      toast.error("Select a customer before booking this table.");
      return;
    }

    if (!selectedBranchId) return;

    setBookingTableId(table._id);

    try {
      const startTime = makeDateTime(date, time);
      const endTime = new Date(
        new Date(startTime).getTime() + 2 * 60 * 60 * 1000
      ).toISOString();
      const reservationDate = makeDateTime(date, "00:00");

      const response = await AxiosInstance.post(
        endpoints.reservation.createForBranch(selectedBranchId),
        {
          table: table._id,
          reservationDate,
          startTime,
          endTime,
          guestCount,
          ...(canSelectCustomer ? { customer: selectedCustomerId } : {}),
        }
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Could not book this table.");
      }

      toast.success("Table requested. Your reservation is pending confirmation.");
      setBookingOpen(false);
      await checkAvailability();
    } catch (bookingError: unknown) {
      toast.error(getApiError(bookingError, "Could not book this table."));
    } finally {
      setBookingTableId(null);
    }
  }

  async function addCustomer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingCustomer(true);

    try {
      const response = await AxiosInstance.post<CustomerResponse>(
        endpoints.customer.create,
        {
          name: newCustomerName.trim(),
          email: newCustomerEmail.trim().toLowerCase() || undefined,
          phone: newCustomerPhone.trim() || undefined,
        }
      );

      if (!response.data.status || !response.data.data?._id) {
        throw new Error(response.data.message || "Unable to add customer.");
      }

      const customer = response.data.data;
      setCustomers((current) => [customer, ...current.filter((item) => item._id !== customer._id)]);
      setSelectedCustomerId(customer._id);
      setCustomerMode("existing");
      setCustomerSearch("");
      setNewCustomerName("");
      setNewCustomerEmail("");
      setNewCustomerPhone("");
      setAddCustomerOpen(false);
      setBookingOpen(true);
      toast.success("Customer added. Continue with the booking.");
    } catch (customerError: unknown) {
      toast.error(getApiError(customerError, "Unable to add customer."));
    } finally {
      setCreatingCustomer(false);
    }
  }

  const restaurantAddress = [
    restaurant?.address?.street,
    restaurant?.address?.city,
    restaurant?.address?.state,
    restaurant?.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  if (loading) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-20 text-center text-slate-500">
        Loading restaurant details...
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="mx-auto min-h-[60vh] max-w-7xl px-5 py-16 text-center">
        <p role="alert" className="text-red-600">
          {error || "Restaurant not found."}
        </p>
        <Button variant="outline" onClick={() => router.push("/restaurants")} className="mt-5">
          Back to restaurants
        </Button>
      </main>
    );
  }

  const heroImage = restaurant.images?.find((image) => image.url)?.url || restaurant.logo;

  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/restaurants")}
            className="mb-6 -ml-3 text-slate-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All restaurants
          </Button>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
              {heroImage ? (
                <img src={heroImage} alt={restaurant.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Restaurant
                </div>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                Restaurant details
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className="mt-5 text-base leading-7 text-slate-600">
                  {restaurant.description}
                </p>
              )}
              {restaurantAddress && (
                <p className="mt-5 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  {restaurantAddress}
                </p>
              )}
              {restaurant.phone && (
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-violet-600" />
                  {restaurant.phone}
                </p>
              )}
              {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {restaurant.cuisineTypes.map((cuisine) => (
                    <span key={cuisine} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                      {cuisine}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)] lg:px-12 lg:py-16">
        <div>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
              Locations
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Choose a branch</h2>
          </div>

          {restaurant.branches.length > 0 ? (
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {restaurant.branches.map((branch) => {
                const branchAddress = [
                  branch.address?.street,
                  branch.address?.city,
                  branch.address?.state,
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <button
                    key={branch._id}
                    type="button"
                    onClick={() => {
                      setSelectedBranchId(branch._id);
                      setTables([]);
                      setAvailabilityChecked(false);
                    }}
                    aria-pressed={selectedBranchId === branch._id}
                    className={`flex w-full cursor-pointer items-start justify-between gap-4 rounded-lg border border-transparent px-3 py-5 text-left transition-colors hover:border-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-inset ${selectedBranchId === branch._id ? "text-violet-700" : "text-slate-800"}`}
                  >
                    <span>
                      <span className="block font-semibold">{branch.name}</span>
                      {branchAddress && <span className="mt-1 block text-sm text-slate-500">{branchAddress}</span>}
                    </span>
                    <span className="text-xs font-medium">{branch.branchCode}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="border-y border-slate-200 py-6 text-sm text-slate-500">
              No active branches are available for reservations.
            </p>
          )}

          {selectedBranch?.contact?.phone && (
            <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-4 w-4 text-violet-600" />
              {selectedBranch.contact.phone}
            </p>
          )}
        </div>

        <div className="border-t border-slate-200 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Reservations
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Reserve your table</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Choose a branch, then check available tables for your date and party size.
          </p>
          <Button
            type="button"
            disabled={!selectedBranchId}
            onClick={() => setBookingOpen(true)}
            className="mt-5 h-11 rounded-xl bg-violet-600 px-5 text-white hover:bg-violet-700"
          >
            Book a table
          </Button>
        </div>
      </section>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:max-w-xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="text-xl font-semibold text-slate-950">
              Book a table at {restaurant.name}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              Select your date, arrival time, and party size to see available tables.
            </DialogDescription>
          </DialogHeader>

            {canSelectCustomer && (
              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">Customer</p>
                  <div className="flex gap-2" role="group" aria-label="Customer type">
                    {canCreateCustomer && (
                      <Button
                        type="button"
                        variant={customerMode === "new" ? "default" : "outline"}
                        onClick={() => {
                          setCustomerMode("new");
                          setAddCustomerOpen(true);
                        }}
                        className={customerMode === "new" ? "bg-violet-600 text-white hover:bg-violet-700" : ""}
                      >
                        New customer
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant={customerMode === "existing" ? "default" : "outline"}
                      onClick={() => setCustomerMode("existing")}
                      className={customerMode === "existing" ? "bg-violet-600 text-white hover:bg-violet-700" : ""}
                    >
                      Existing customer
                    </Button>
                  </div>
                </div>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="sr-only">Search customers</span>
                  <input
                    type="search"
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder="Search by name, email, or phone"
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
                  />
                </label>
                <select
                  aria-label="Select an existing customer"
                  value={selectedCustomerId}
                  onChange={(event) => {
                    setSelectedCustomerId(event.target.value);
                    setCustomerMode("existing");
                  }}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
                >
                  <option value="">{customersLoading ? "Loading customers..." : "Select a customer"}</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {[customer.name, customer.email, customer.phone].filter(Boolean).join(" · ")}
                    </option>
                  ))}
                </select>
                {!customersLoading && customers.length === 0 && (
                  <p className="text-xs text-slate-500">No customers found.</p>
                )}
              </div>
            )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-violet-600" />Date</span>
              <input
                type="date"
                min={getLocalDate(new Date())}
                value={date}
                onChange={(event) => { setDate(event.target.value); setTables([]); setAvailabilityChecked(false); }}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><Clock3 className="h-4 w-4 text-violet-600" />Start time</span>
              <input
                type="time"
                value={time}
                onChange={(event) => { setTime(event.target.value); setTables([]); setAvailabilityChecked(false); }}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              <span className="mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-violet-600" />Guests</span>
              <input
                type="number"
                min={1}
                max={20}
                value={guestCount}
                onChange={(event) => { setGuestCount(Math.max(1, Number(event.target.value))); setTables([]); setAvailabilityChecked(false); }}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
              />
            </label>
          </div>

          <Button
            type="button"
            disabled={!selectedBranchId || checkingAvailability}
            onClick={checkAvailability}
            className="h-11 w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700"
          >
            {checkingAvailability ? "Checking tables..." : "Check availability"}
          </Button>

          {tables.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">Available tables</h3>
              {tables.map((table) => (
                <Card key={table._id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-none">
                  <div>
                    <p className="font-semibold text-slate-900">Table {table.tableNumber}</p>
                    <p className="mt-1 text-sm capitalize text-slate-500">
                      {table.location} · Up to {table.capacity} guests
                    </p>
                  </div>
                  <Button
                    type="button"
                    disabled={bookingTableId !== null}
                    onClick={() => bookTable(table)}
                    className="shrink-0 rounded-lg bg-violet-600 text-white hover:bg-violet-700"
                  >
                    {bookingTableId === table._id ? "Booking..." : "Book"}
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {availabilityChecked && !checkingAvailability && tables.length === 0 && (
            <p
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              No tables are available for the selected date, time, and guest size. Try another option.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={addCustomerOpen}
        onOpenChange={(open) => {
          setAddCustomerOpen(open);
          if (!open) setCustomerMode("existing");
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-950">Add a customer</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-500">
              Add their details, then continue with this reservation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addCustomer} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Full name</span>
              <input
                required
                minLength={2}
                autoComplete="name"
                value={newCustomerName}
                onChange={(event) => setNewCustomerName(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={newCustomerEmail}
                onChange={(event) => setNewCustomerEmail(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 block">Phone</span>
              <input
                type="tel"
                autoComplete="tel"
                value={newCustomerPhone}
                onChange={(event) => setNewCustomerPhone(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
              />
            </label>
            <Button
              type="submit"
              disabled={creatingCustomer || newCustomerName.trim().length < 2}
              className="h-11 w-full rounded-lg bg-violet-600 text-white hover:bg-violet-700"
            >
              {creatingCustomer ? "Adding customer..." : "Add customer and return to booking"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onCreateAccount={() => router.push("/register")}
      />
    </main>
  );
}
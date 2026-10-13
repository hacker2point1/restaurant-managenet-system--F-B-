"use client";

import {
  Loader2,
  Search,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

import { useDebounce } from "@/hooks/use-debounce";

import {
  Customer,
} from "@/types/reservation";

interface Props {
  value: Customer | null;

  customers: Customer[];

  loading: boolean;

  onSearch: (
    value: string
  ) => void;

  onSelect: (
    customer: Customer | null
  ) => void;
}

export default function CustomerSearch({
  value,
  customers,
  loading,
  onSearch,
  onSelect,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [showResults, setShowResults] =
    useState(false);

  const selectedNameRef = useRef(
    value?.name.trim().toLowerCase()
  );

  useEffect(() => {
    selectedNameRef.current =
      value?.name.trim().toLowerCase();
  }, [value]);

  const debouncedSearch =
    useDebounce(search, 500);

  useEffect(() => {
    const query = debouncedSearch.trim();

    if (query.toLowerCase() === selectedNameRef.current) return;

    onSearch(query);
  }, [
    debouncedSearch,
    onSearch,
  ]);

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-medium">
        Customer <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <Input
          value={search}
          onChange={(event) => {
            const nextSearch = event.target.value;
            setSearch(nextSearch);
            setShowResults(Boolean(nextSearch.trim()));
            if (value) onSelect(null);
          }}
          onFocus={() => {
            const selectedName = value?.name.trim().toLowerCase();
            setShowResults(
              Boolean(search.trim()) && search.trim().toLowerCase() !== selectedName
            );
          }}
          placeholder="Search customer by name or phone..."
          className="pl-9"
        />

        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg">
          {customers.length === 0 &&
            !loading && (
              <p className="p-3 text-sm text-slate-500">
                No customers found.
              </p>
            )}

          {customers.map(
            (customer) => (
              <button
                key={customer._id}
                type="button"
                className="flex w-full items-center gap-3 rounded-md p-3 text-left hover:bg-slate-50"
                onClick={() => {
                  onSelect(customer);
                  setSearch(customer.name);
                  setShowResults(false);
                }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1e7d7] font-medium text-[#8b622d]">
                  {customer.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {customer.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {customer.phone ||
                      customer.email ||
                      ""}
                  </p>
                </div>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
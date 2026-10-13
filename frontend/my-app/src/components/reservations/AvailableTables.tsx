"use client";

import { Loader2 } from "lucide-react";

import {
  AvailableTable,
} from "@/types/reservation";

interface Props {
  tables: AvailableTable[];

  selectedTable: string;

  loading: boolean;

  onSelect: (
    tableId: string
  ) => void;
}

export default function AvailableTables({
  tables,
  selectedTable,
  loading,
  onSelect,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Available Tables{" "}
        <span className="text-red-500">*</span>
      </label>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />

          Checking available tables...
        </div>
      ) : tables.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">
          Select date, time and guest count
          to see available tables.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tables.map((table) => {
            const selected =
              selectedTable ===
              table._id;

            return (
              <button
                key={table._id}
                type="button"
                onClick={() =>
                  onSelect(table._id)
                }
                className={[
                  "rounded-md border px-4 py-2 text-sm font-medium transition",
                  selected
                    ? "border-[#91662f] bg-[#91662f] text-white"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                ].join(" ")}
              >
                {table.tableNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
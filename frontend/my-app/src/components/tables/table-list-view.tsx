"use client";

import {
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Table } from "@/types/table";

import {
  Card,
} from "@/components/ui/card";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableListViewProps {
  tables: Table[];

  onEdit: (table: Table) => void;

  onDelete: (table: Table) => void;
}

const statusClasses = {
  available:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  reserved:
    "border-[#dec99f] bg-[#faf7f0] text-[#805b2b]",

  occupied:
    "border-blue-200 bg-blue-50 text-blue-700",

  maintenance:
    "border-red-200 bg-red-50 text-red-700",
};

export default function TableListView({
  tables,
  onEdit,
  onDelete,
}: TableListViewProps) {
  return (
    <Card className="overflow-hidden rounded-xl shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-5 py-4 text-left font-semibold">
                Table
              </th>

              <th className="px-5 py-4 text-left font-semibold">
                Capacity
              </th>

              <th className="px-5 py-4 text-left font-semibold">
                Location
              </th>

              <th className="px-5 py-4 text-left font-semibold">
                Status
              </th>

              <th className="px-5 py-4 text-left font-semibold">
                Active
              </th>

              <th className="px-5 py-4 text-right font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {tables.map((table) => (
              <tr
                key={table._id}
                className="border-b last:border-0 hover:bg-muted/20"
              >
                <td className="px-5 py-4 font-semibold">
                  {table.tableNumber}
                </td>

                <td className="px-5 py-4">
                  {table.capacity} seats
                </td>

                <td className="px-5 py-4 capitalize">
                  {table.location}
                </td>

                <td className="px-5 py-4">
                  <Badge
                    variant="outline"
                    className={
                      statusClasses[table.status]
                    }
                  >
                    {table.status}
                  </Badge>
                </td>

                <td className="px-5 py-4">
                  <Badge
                    variant="outline"
                    className={
                      table.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }
                  >
                    {table.isActive
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </td>

                <td className="px-5 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
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
                          onEdit(table)
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          onDelete(table)
                        }
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
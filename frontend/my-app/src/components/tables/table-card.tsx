"use client";

import {
  MoreVertical,
  Users,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import { Table } from "@/types/table";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableCardProps {
  table: Table;

  onEdit: (table: Table) => void;

  onDelete: (table: Table) => void;

  onAllocate: (table: Table) => void;

  onRelease: (table: Table) => void;

  onStatusChange: (table: Table) => void;
}

const statusConfig = {
  available: {
    label: "Available",
    border:
      "border-emerald-300 bg-emerald-50/60",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },

  reserved: {
    label: "Reserved",
    border:
      "border-[#dec99f] bg-[#faf7f0]",
    text: "text-[#805b2b]",
    dot: "bg-[#a97a38]",
  },

  occupied: {
    label: "Occupied",
    border:
      "border-blue-300 bg-blue-50/60",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },

  maintenance: {
    label: "Maintenance",
    border:
      "border-red-300 bg-red-50/60",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

export default function TableCard({
  table,
  onEdit,
  onDelete,
  onAllocate,
  onRelease,
  onStatusChange,
}: TableCardProps) {
  const config = statusConfig[table.status];

  return (
    <Card
      className={`relative overflow-hidden rounded-xl border-2 shadow-none transition-all hover:shadow-sm ${config.border}`}
    >
      <CardContent className="p-4">
        {/* TOP */}
        <div className="flex items-start justify-between">
          <div>
            <h3
              className={`text-lg font-bold ${config.text}`}
            >
              {table.tableNumber}
            </h3>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />

              {table.capacity}{" "}
              {table.capacity === 1
                ? "seat"
                : "seats"}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onEdit(table)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    onStatusChange(table)
                  }
                >
                  Change status
                </DropdownMenuItem>

                {table.status === "available" && (
                  <DropdownMenuItem
                    onClick={() =>
                      onAllocate(table)
                    }
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Allocate
                  </DropdownMenuItem>
                )}

                {table.status === "occupied" && (
                  <DropdownMenuItem
                    onClick={() =>
                      onRelease(table)
                    }
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Release
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(table)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* DETAILS */}
        <div className="mt-5 space-y-2">
          <div className="text-xs text-muted-foreground">
            Location
          </div>

          <div className="text-sm font-medium capitalize">
            {table.location}
          </div>
        </div>

        {/* STATUS */}
        <div className="mt-5">
          <Badge
            variant="outline"
            className={`border-transparent bg-transparent p-0 text-sm font-medium ${config.text}`}
          >
            {config.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
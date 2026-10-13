"use client";

import { Table } from "@/types/table";

import TableCard from "./table-card";

interface TableFloorViewProps {
  tables: Table[];

  columns: number;

  onEdit: (table: Table) => void;

  onDelete: (table: Table) => void;

  onAllocate: (table: Table) => void;

  onRelease: (table: Table) => void;

  onStatusChange: (table: Table) => void;
}

export default function TableFloorView({
  tables,
  columns,
  onEdit,
  onDelete,
  onAllocate,
  onRelease,
  onStatusChange,
}: TableFloorViewProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {tables.map((table) => (
        <TableCard
          key={table._id}
          table={table}
          onEdit={onEdit}
          onDelete={onDelete}
          onAllocate={onAllocate}
          onRelease={onRelease}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
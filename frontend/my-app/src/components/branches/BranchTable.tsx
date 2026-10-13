"use client";

import { MapPin, Phone } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Branch } from "@/types/branch";

import { BranchStatusBadge } from "./BranchStatusBadge";
import { BranchActions } from "./BranchActions";

interface BranchTableProps {
  branches: Branch[];

  onView: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;

  onActivate: (branch: Branch) => void;
  onDeactivate: (branch: Branch) => void;

  onDelete: (branch: Branch) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function BranchTable({
  branches,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: BranchTableProps) {
  if (!branches.length) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <div className="text-center">
          <p className="font-medium">
            No branches found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>BRANCH</TableHead>
            <TableHead>LOCATION</TableHead>
            <TableHead>CONTACT</TableHead>
            {/* <TableHead>CAPACITY</TableHead> */}
            <TableHead>STATUS</TableHead>
            <TableHead className="text-right">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {branches.map((branch) => (
            <TableRow
              key={branch._id}
              className="hover:bg-muted/40"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
                    {getInitials(branch.name)}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {branch.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {branch.branchCode}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />

                  <div>
                    <p className="font-medium">
                      {branch.address?.city ||
                        "—"}
                    </p>

                    <p className="max-w-[220px] text-xs text-muted-foreground">
                      {branch.address?.street ||
                        "Address not available"}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />

                  <span className="text-sm">
                    {branch.contact?.phone ||
                      "—"}
                  </span>
                </div>
              </TableCell>

              {/* <TableCell>
                <span className="text-sm font-semibold">
                  —
                </span>

                <p className="text-xs text-muted-foreground">
                  Capacity API required
                </p>
              </TableCell> */}

              <TableCell>
                <BranchStatusBadge
                  isActive={branch.isActive}
                />
              </TableCell>

              <TableCell className="text-right">
                <BranchActions
                  branch={branch}
                  onView={onView}
                  onEdit={onEdit}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
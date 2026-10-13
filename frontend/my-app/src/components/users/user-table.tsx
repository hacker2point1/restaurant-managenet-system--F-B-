"use client";

import {
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  User,
} from "@/types/user";


interface UserTableProps {
  users: User[];

  onEdit: (
    user: User
  ) => void;

  onActivate: (
    user: User
  ) => void;

  onDeactivate: (
    user: User
  ) => void;

  onDelete: (
    user: User
  ) => void;
}


const roleStyle: Record<
  User["role"],
  string
> = {
  admin:
    "border-violet-200 bg-violet-50 text-violet-700",

  manager:
    "border-blue-200 bg-blue-50 text-blue-700",

  staff:
    "border-amber-200 bg-amber-50 text-amber-700",

  customer:
    "border-slate-200 bg-slate-50 text-slate-600",
};


function getInitials(
  name?: string | null
) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0)
    )
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return initials || "U";
}


export default function UserTable({
  users,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: UserTableProps) {

  if (!users.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center p-6">

        <div className="max-w-sm text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

            <SearchEmptyIcon />

          </div>

          <h3 className="font-semibold text-slate-900">
            No users found
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            No users match your current search or filters.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="overflow-x-auto">

      <Table className="min-w-[920px]">

        <TableHeader>

          <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">

            <TableHead className="h-12 pl-5">
              User
            </TableHead>

            <TableHead>
              Email
            </TableHead>

            <TableHead>
              Phone
            </TableHead>

            <TableHead>
              Role
            </TableHead>

            <TableHead>
              Status
            </TableHead>

            <TableHead>
              Created
            </TableHead>

            <TableHead className="w-[70px] text-right">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>


        <TableBody>

          {users.map(
            (user) => (

              <TableRow
                key={
                  user._id
                }
                className="group"
              >

                {/* USER */}

                <TableCell className="py-4 pl-5">

                  <div className="flex items-center gap-3">

                    <Avatar className="h-10 w-10 border border-slate-100">

                      <AvatarImage
                        src={
                          user
                            .profileImage
                            ?.url ||
                          undefined
                        }
                        alt={
                          user.name || user.email || "User"
                        }
                      />

                      <AvatarFallback className="bg-amber-50 text-xs font-semibold text-amber-800">
                        {getInitials(
                          user.name || user.email
                        )}
                      </AvatarFallback>

                    </Avatar>


                    <div className="min-w-0">

                      <p className="truncate font-medium text-slate-900">
                        {user.name || user.email || "Unnamed user"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {user.isVerified
                          ? "Verified"
                          : "Not verified"}
                      </p>

                    </div>

                  </div>

                </TableCell>


                {/* EMAIL */}

                <TableCell className="text-sm text-slate-600">
                  {user.email}
                </TableCell>


                {/* PHONE */}

                <TableCell className="text-sm text-slate-600">

                  {user.phone ||
                    "—"}

                </TableCell>


                {/* ROLE */}

                <TableCell>

                  <Badge
                    variant="outline"
                    className={`rounded-full px-2.5 py-0.5 font-medium capitalize ${roleStyle[user.role]}`}
                  >
                    {user.role}
                  </Badge>

                </TableCell>


                {/* STATUS */}

                <TableCell>

                  {user.isActive ? (

                    <Badge
                      variant="outline"
                      className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 text-emerald-700"
                    >
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      Active
                    </Badge>

                  ) : (

                    <Badge
                      variant="outline"
                      className="rounded-full border-slate-200 bg-slate-50 px-2.5 text-slate-500"
                    >
                      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />

                      Inactive
                    </Badge>

                  )}

                </TableCell>


                {/* CREATED */}

                <TableCell className="text-sm text-slate-500">

                  {new Date(
                    user.createdAt
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}

                </TableCell>


                {/* ACTION */}

                <TableCell className="text-right">

                  <DropdownMenu>

                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >

                        <MoreHorizontal className="h-4 w-4" />

                        <span className="sr-only">
                          Open user actions
                        </span>

                        </Button>
                      }
                    />


                    <DropdownMenuContent
                      align="end"
                      className="w-48"
                    >

                      <DropdownMenuGroup>
                        <DropdownMenuLabel>
                          User actions
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator />


                      <DropdownMenuItem
                        onClick={() =>
                          onEdit(
                            user
                          )
                        }
                      >

                        <Pencil className="mr-2 h-4 w-4" />

                        Edit user

                      </DropdownMenuItem>


                      {user.isActive ? (

                        <DropdownMenuItem
                          onClick={() =>
                            onDeactivate(
                              user
                            )
                          }
                        >

                          <PowerOff className="mr-2 h-4 w-4" />

                          Deactivate

                        </DropdownMenuItem>

                      ) : (

                        <DropdownMenuItem
                          onClick={() =>
                            onActivate(
                              user
                            )
                          }
                        >

                          <Power className="mr-2 h-4 w-4" />

                          Activate

                        </DropdownMenuItem>

                      )}


                      <DropdownMenuSeparator />


                      <DropdownMenuItem
                        onClick={() =>
                          onDelete(
                            user
                          )
                        }
                        className="text-red-600 focus:bg-red-50 focus:text-red-600"
                      >

                        <Trash2 className="mr-2 h-4 w-4" />

                        Delete user

                      </DropdownMenuItem>

                    </DropdownMenuContent>

                  </DropdownMenu>

                </TableCell>

              </TableRow>

            )
          )}

        </TableBody>

      </Table>

    </div>
  );
}


function SearchEmptyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-500"
    >
      <circle
        cx="11"
        cy="11"
        r="8"
      />

      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
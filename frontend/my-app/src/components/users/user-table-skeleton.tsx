import {
  Skeleton,
} from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function UserTableSkeleton() {

  return (
    <Table>

      <TableHeader>

        <TableRow>

          <TableHead>User</TableHead>

          <TableHead>Email</TableHead>

          <TableHead>Phone</TableHead>

          <TableHead>Role</TableHead>

          <TableHead>Status</TableHead>

          <TableHead>Created</TableHead>

          <TableHead className="w-[70px]" />

        </TableRow>

      </TableHeader>


      <TableBody>

        {Array.from({
          length: 8,
        }).map((_, index) => (

          <TableRow key={index}>

            <TableCell>

              <div className="flex items-center gap-3">

                <Skeleton className="h-10 w-10 rounded-full" />

                <div className="space-y-2">

                  <Skeleton className="h-4 w-[120px]" />

                  <Skeleton className="h-3 w-[75px]" />

                </div>

              </div>

            </TableCell>


            <TableCell>
              <Skeleton className="h-4 w-[170px]" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-[120px]" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-6 w-[80px] rounded-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-6 w-[75px] rounded-full" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-[90px]" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-8 w-8 rounded-md" />
            </TableCell>

          </TableRow>

        ))}

      </TableBody>

    </Table>
  );
}
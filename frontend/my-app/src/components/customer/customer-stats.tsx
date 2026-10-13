
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";
import type { Customer } from "@/types/customer";

interface Props {
  customers: Customer[];
  total: number;
}

export function CustomerStats({ customers, total }: Props) {
  const active = customers.filter((customer) => customer.isActive).length;
  const inactive = customers.length - active;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newThisMonth = customers.filter(
    (customer) => new Date(customer.createdAt) >= startOfMonth
  ).length;

  const stats = [
    {
      label: "Total Customers",
      value: total.toLocaleString(),
      icon: Users,
      color: "text-foreground",
    },
    {
      label: "Active on This Page",
      value: active,
      icon: UserCheck,
      color: "text-emerald-600",
    },
    {
      label: "New This Month (Page)",
      value: newThisMonth,
      icon: UserPlus,
      color: "text-blue-600",
    },
    {
      label: "Inactive on This Page",
      value: inactive,
      icon: UserX,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <Icon className={`size-5 ${color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

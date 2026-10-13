"use client";

import { OrderStatus } from "@/types/dashboard";

interface OrderStatusCardProps {
  data: OrderStatus[];
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-400",
  confirmed: "bg-blue-500",
  preparing: "bg-purple-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
};

export default function OrderStatusCard({
  data,
  loading,
}: OrderStatusCardProps) {
  const total = data.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#202928]">
        Order Status
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {total.toLocaleString("en-IN")} orders
      </p>

      {loading ? (
        <div className="flex h-[250px] items-center justify-center text-sm text-gray-400">
          Loading...
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-gray-400">
              No order status data
            </p>
          ) : (
            data.map((item) => {
              const percentage =
                total > 0
                  ? (item.count / total) * 100
                  : 0;

              return (
                <div key={item.status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-gray-600">
                      {item.status}
                    </span>

                    <span className="font-medium">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full ${
                        statusColors[item.status] ||
                        "bg-gray-400"
                      }`}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
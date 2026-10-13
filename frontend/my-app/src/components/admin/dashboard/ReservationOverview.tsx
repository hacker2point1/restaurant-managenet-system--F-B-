"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DailyOrderTrend } from "@/types/dashboard";

interface ReservationOverviewProps {
  data: DailyOrderTrend[];
  loading?: boolean;
}

export default function ReservationOverview({
  data,
  loading,
}: ReservationOverviewProps) {
  const chartData = data.map((item) => ({
    date: item.date.slice(5),
    completed: item.completed,
    cancelled: item.cancelled,
  }));

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[#202928]">
          Order Trends
        </h2>

        <p className="text-sm text-gray-500">
          Completed vs cancelled orders
        </p>
      </div>

      <div className="h-[300px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading trends...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No trend data available
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Bar
                dataKey="completed"
                name="Completed"
                fill="#3783e9"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="cancelled"
                name="Cancelled"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
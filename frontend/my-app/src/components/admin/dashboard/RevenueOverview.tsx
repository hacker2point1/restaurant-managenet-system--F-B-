"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MonthlyRevenue } from "@/types/dashboard";

interface RevenueOverviewProps {
  data: MonthlyRevenue[];
  loading?: boolean;
}

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function RevenueOverview({
  data,
  loading,
}: RevenueOverviewProps) {
  const chartData = data.map((item) => ({
    month: `${months[item.month - 1]} ${item.year}`,
    revenue: item.revenue,
  }));

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[#202928]">
          Revenue Overview
        </h2>

        <p className="text-sm text-gray-500">
          Monthly revenue
        </p>
      </div>

      <div className="h-[300px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Loading revenue...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No revenue data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `₹${Number(value).toLocaleString(
                    "en-IN"
                  )}`
                }
              />

              <Tooltip
                formatter={(value) => [
                  `₹${Number(value).toLocaleString(
                    "en-IN"
                  )}`,
                  "Revenue",
                ]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#c28b3c"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
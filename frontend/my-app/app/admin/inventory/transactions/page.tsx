"use client";

import { useEffect, useState } from "react";

import axiosInstance from "@/api/axios/axios";
import { endpoints } from "@/api/endpoints/endpoints";
import InventoryTransactionPage from "@/src/components/inventory-transactions/InventoryTransactionPage";

interface BranchOption {
  _id: string;
  name: string;
}

interface InventoryOption {
  _id: string;
  name: string;
  sku?: string;
  unit: string;
  currentQuantity?: number;
  branchName: string;
}

interface InventoryListResponse {
  data?: Omit<InventoryOption, "branchName">[];
  pagination?: {
    totalPages: number;
  };
}

export default function InventoryTransactionsPage() {
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryOption[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    const loadInventoryOptions = async () => {
      try {
        const restaurantsResponse = await axiosInstance.get<{
          data?: { _id: string; name: string }[];
        }>(endpoints.restaurant.getAll);
        const restaurants = restaurantsResponse.data?.data || [];

        const branchLists = await Promise.all(
          restaurants.map(async (restaurant) => {
            try {
              const response = await axiosInstance.get<{
                data?: BranchOption[];
              }>(endpoints.branch.getByRestaurantId(restaurant._id));
              return (response.data?.data || []).map((branch) => ({
                ...branch,
                restaurantName: restaurant.name,
              }));
            } catch {
              return [];
            }
          })
        );
        const availableBranches = branchLists.flat();

        if (isCurrent) {
          setBranches(availableBranches);
        }

        const itemsByBranch = await Promise.all(
          availableBranches.map(async (branch) => {
            try {
              const firstResponse = await axiosInstance.get<InventoryListResponse>(
                endpoints.inventory.getAll(branch._id),
                { params: { page: 1, limit: 100 } }
              );
              const firstPage = firstResponse.data;
              const branchItems = [...(firstPage.data || [])];

              for (let page = 2; page <= (firstPage.pagination?.totalPages || 1); page += 1) {
                const response = await axiosInstance.get<InventoryListResponse>(
                  endpoints.inventory.getAll(branch._id),
                  { params: { page, limit: 100 } }
                );
                branchItems.push(...(response.data?.data || []));
              }

              return branchItems.map((item) => ({
                ...item,
                branchName: branch.name,
              }));
            } catch {
              return [];
            }
          })
        );

        if (isCurrent) setInventoryItems(itemsByBranch.flat());
      } catch {
        if (isCurrent) {
          setBranches([]);
          setInventoryItems([]);
        }
      } finally {
        if (isCurrent) {
          setInventoryLoading(false);
        }
      }
    };

    loadInventoryOptions();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <InventoryTransactionPage
      branches={branches}
      inventoryItems={inventoryItems}
      inventoryLoading={inventoryLoading}
    />
  );
}
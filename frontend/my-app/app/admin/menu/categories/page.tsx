"use client";

import MenuCategoryPage from "@/src/components/menu-categories/MenuCategoryPage";
import {
  useSearchParams,
} from "next/navigation";


export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branchId");

  return (
    <MenuCategoryPage
      branchId={branchId || "all"}
    />
  );
}
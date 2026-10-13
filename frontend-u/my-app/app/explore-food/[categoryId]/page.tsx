"use client";

import { useParams } from "next/navigation";
import MenuCategoryItemsPage from "@/src/components/menu-categories/MenuCategoryItemsPage";

export default function ExploreFoodCategoryRoute() {
  const params = useParams<{ categoryId: string }>();

  return <MenuCategoryItemsPage categoryId={params.categoryId} />;
}
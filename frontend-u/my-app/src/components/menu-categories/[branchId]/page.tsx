"use client";

import { useParams } from "next/navigation";
import MenuCategoriesPage from "../MenuCategoriesPage";



export default function MenuCategoriesRoute() {
  const params = useParams<{ branchId: string }>();

  return <MenuCategoriesPage branchId={params.branchId} />;
}
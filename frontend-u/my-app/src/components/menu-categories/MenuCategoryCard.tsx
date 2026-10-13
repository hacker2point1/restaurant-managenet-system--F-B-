"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { MenuCategory } from "@/redux/slice/menuCategorySlice";

interface MenuCategoryCardProps {
  category: MenuCategory;
  index?: number;
}

export default function MenuCategoryCard({
  category,
  index = 0,
}: MenuCategoryCardProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const imageUrl =
    typeof category.image === "string"
      ? category.image
      : category.image?.url;

  const itemCount = category.menuItemCount ?? 0;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={
        shouldReduceMotion ? undefined : { opacity: 1, y: 0 }
      }
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.3),
      }}
      whileHover={shouldReduceMotion ? undefined : { y: -5 }}
      className="h-full"
    >
      <Card className="group relative h-full overflow-hidden rounded-[24px] border-0 bg-slate-100 p-0 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-violet-950/10">
        <div className="relative aspect-[4/4.1] min-h-[260px] overflow-hidden sm:min-h-[280px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={category.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-100 via-slate-100 to-orange-100">
              <UtensilsCrossed className="h-14 w-14 text-violet-400" />
            </div>
          )}

          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/0" />

          {/* Category information */}
          <div className="absolute inset-x-0 bottom-0 p-5 text-center text-white sm:p-6">
            <h3 className="line-clamp-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {category.name}
            </h3>

            {category.description && (
              <p className="mx-auto mt-2 line-clamp-2 max-w-[240px] text-sm leading-5 text-white/75">
                {category.description}
              </p>
            )}

            <p className="mt-2 text-xs font-medium text-white/80">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        <div className="bg-white p-4">
          <Button
            type="button"
            onClick={() => router.push(`/explore-food/${category._id}`)}
            className="h-11 w-full rounded-xl bg-violet-600 font-semibold text-white hover:bg-violet-700"
          >
            Explore foods
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
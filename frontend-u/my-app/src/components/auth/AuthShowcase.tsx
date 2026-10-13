
"use client";

import { motion } from "framer-motion";
import { Star, UtensilsCrossed } from "lucide-react";

export default function AuthShowcase() {
  return (
    <section className="relative hidden min-h-full overflow-hidden bg-[#17132E] lg:flex lg:w-[45%]">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=85')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#17132E]/70 via-[#17132E]/45 to-[#17132E]/95" />

      <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B4CF4] text-2xl font-bold text-white">
            S
          </span>

          <span className="text-2xl font-bold tracking-tight text-white">
            Savor.
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="max-w-xl pb-8"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
            <Star size={14} fill="currentColor" />
            Built for people who love dining out
          </div>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-[-2px] text-white xl:text-6xl">
            More memorable meals start here.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-white/75 xl:text-lg">
            Save your favorite restaurants, earn rewards, and manage
            every reservation from one beautifully simple place.
          </p>

          <div className="mt-10 flex items-center gap-3 text-sm text-white/80">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <UtensilsCrossed size={18} />
            </span>
            <span>Discover your next favorite table in Kolkata.</span>
          </div>
        </motion.div>

        <p className="text-xs text-white/50">
          Good food. Great company. Memorable moments.
        </p>
      </div>
    </section>
  );
}

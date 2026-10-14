
"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  ShieldCheck,
  Star,
  Ticket,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Effortless reservations",
    description:
      "Find your table in real time and book it in under a minute.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    description:
      "Protected checkout powered by Razorpay, every single time.",
  },
  {
    icon: Star,
    title: "Genuinely curated",
    description:
      "Every restaurant is handpicked, reviewed, and quality checked.",
  },
  {
    icon: Ticket,
    title: "Members-only offers",
    description:
      "Enjoy exclusive dining privileges and loyalty rewards.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#F7F8FC] py-16 font-sans sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Section heading */}
        <div className="mb-10 sm:mb-12 lg:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-[#5B4BFF] sm:text-sm"
          >
            Dining, made delightful
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl text-[36px] font-normal leading-[1.12] tracking-[-0.055em] text-[#1B1B1F] sm:text-5xl lg:text-[54px]"
          >
            Every detail, taken care of
          </motion.h2>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 border-l border-[#E3E3E8] sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                className="group border-r border-b border-[#E3E3E8] px-6 py-8 transition-colors duration-300 hover:bg-white/70 sm:px-7 sm:py-9 lg:border-b-0 lg:px-8 lg:py-10"
              >
                {/* Icon */}
                <div className="mb-7 flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#F0EFFF] transition-transform duration-300 group-hover:scale-105">
                  <Icon
                    className="h-[28px] w-[28px] text-[#5B4BFF]"
                    strokeWidth={1.9}
                  />
                </div>

                {/* Content */}
                <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.035em] text-[#1B1B1F] sm:text-[22px]">
                  {feature.title}
                </h3>

                <p className="mt-4 max-w-[300px] text-[14px] leading-7 text-[#737789] sm:text-[15px]">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

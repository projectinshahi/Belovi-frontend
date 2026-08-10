"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Moment } from "../../lib/moment";

const ease = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    number: "01",
    title: "IT OPENS, NAMED",
    description: "A small, named run — a handful of pieces drawn around one idea. Never a full wardrobe.",
  },
  {
    number: "02",
    title: "IT CLOSES, QUIETLY",
    description: "When it's time, the Moment closes. No sale, no clearance, no urgency manufactured to move stock.",
  },
  {
    number: "03",
    title: "IT BECOMES ARCHIVE",
    description: "Each piece moves into the Archive — same page, same photography, re-tagged — and remains available to buy.",
  },
];

export default function MomentExplainer({ moment }: { moment?: Moment | null }) {
  const reduce = useReducedMotion();
  const steps = moment?.steps?.length ? moment.steps : STEPS;
  const label = moment?.explainerEyebrow ?? "HOW A GENESIS MOMENT WORKS";

  return (
    <section className="bg-[#FAF8F5] py-[24px] sm:py-[30px] md:py-[36px] lg:py-[48px]">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Label */}
        <motion.p
          initial={reduce ? {} : { opacity: 0, y: 10 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.6, ease }}
          className="text-center eyebrow text-bronze-deep mb-[28px] sm:mb-[28px] md:mb-[36px]"
        >
          {label}
        </motion.p>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={reduce ? {} : { opacity: 0, y: 15 }}
              whileInView={reduce ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{
                duration: 0.5,
                ease,
                delay: 0.15 + idx * 0.15,
              }}
              className="flex flex-col items-center text-center"
            >
              {/* Number */}
              <span className="font-display text-[32px] sm:text-[30px] md:text-[38px] lg:text-[40px] text-[#A08060] mb-3 sm:mb-3 md:mb-4 leading-[1.2]">
                {step.number}
              </span>

              {/* Title */}
              <h3 className="font-sans uppercase tracking-[0.08em] text-[11px] sm:text-[11px] md:text-[13px] font-medium text-[#3D352E] mb-4 sm:mb-3 md:mb-5 leading-[1.4]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="font-sans text-[14px] sm:text-[14px] md:text-[15px] text-[#7A6F64] leading-[1.75] max-w-[280px] sm:max-w-[260px] md:max-w-[300px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

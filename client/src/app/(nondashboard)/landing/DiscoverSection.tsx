"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, ClipboardCheck, Home } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const steps = [
  {
    icon: Search,
    title: "Discover Homes",
    description:
      "Browse curated rental listings and find a place that fits your lifestyle.",
  },
  {
    icon: ClipboardCheck,
    title: "Apply Easily",
    description:
      "Submit rental applications and manage everything from one platform.",
  },
  {
    icon: Home,
    title: "Move In Comfort",
    description:
      "Secure your new home and enjoy a smooth renting experience.",
  },
];

const DiscoverSection = () => {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight"
          >
            Renting Made Simple
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-4 text-gray-500 max-w-xl mx-auto"
          >
            A simple journey from discovering homes to moving in.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-secondary-50 text-secondary-600 mb-6">
                  <Icon size={26} strokeWidth={2} />
                </div>

                {/* title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>

                {/* description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* bottom accent */}
                <div className="mt-6 h-[2px] w-10 bg-secondary-500 rounded-full opacity-70 group-hover:w-16 transition-all" />
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default DiscoverSection;
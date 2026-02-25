"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, Search, LayoutDashboard } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.18,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: Building2,
    title: "Verified Property Listings",
    description:
      "Browse reliable rental listings with accurate details and trusted property information.",
  },
  {
    icon: Search,
    title: "Seamless Property Discovery",
    description:
      "Find homes faster with a clean and intuitive browsing experience.",
  },
  {
    icon: LayoutDashboard,
    title: "Smart Rental Management",
    description:
      "Manage listings, applications, and tenants from a single organized platform.",
  },
];

const FeaturesSection = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-28 px-6 sm:px-8 lg:px-12 bg-white"
    >
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight">
            Everything You Need to
            <span className="block text-secondary-500 mt-2">
              Manage Rentals
            </span>
          </h2>

          <p className="mt-5 text-gray-500 max-w-xl mx-auto text-lg">
            A powerful yet simple platform designed for tenants and property managers.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-secondary-50 text-secondary-600 mb-6">
                  <Icon size={26} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Accent */}
                <div className="mt-6 h-[2px] w-10 bg-secondary-500 rounded-full opacity-70 group-hover:w-16 transition-all" />
              </motion.div>
            );
          })}
        </div>

      </div>
    </motion.section>
  );
};

export default FeaturesSection;
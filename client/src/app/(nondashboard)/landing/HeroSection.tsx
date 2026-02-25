"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen">

      {/* background image */}
      <Image
        src="/landing-splash.jpg"
        alt="Real Estate Platform"
        fill
        priority
        className="object-cover object-center"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* content */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center px-6"
      >
        <div className="max-w-5xl text-center">

          <h1 className="
            text-4xl 
            sm:text-5xl 
            md:text-6xl 
            lg:text-7xl 
            xl:text-[72px]
            font-semibold
            text-white
            leading-[1.05]
            tracking-[-0.02em]
          ">
            Discover. Rent. Manage.
            <span className="block mt-4 text-secondary-400 font-bold">
              All-in-One Platform
            </span>
          </h1>

        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
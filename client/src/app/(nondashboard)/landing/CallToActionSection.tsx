"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

const CallToActionSection = () => {
  const router = useRouter();

  return (
    <section className="relative py-32">

      {/* background */}
      <Image
        src="/landing-call-to-action.jpg"
        alt="Rental Platform"
        fill
        className="object-cover object-center"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="relative max-w-5xl mx-auto px-6 text-center"
      >
        {/* headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight">
          Ready to Find Your
          <span className="block text-secondary-400 mt-2">
            Next Home?
          </span>
        </h2>

        {/* description */}
        <p className="mt-5 text-gray-300 text-lg max-w-xl mx-auto">
          Join RENTIFUL and experience a smarter, simpler way to rent and
          manage homes.
        </p>

        {/* actions */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">

          <button
            onClick={() => router.push("/signin")}
            className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white hover:bg-white hover:text-black px-8 py-4 rounded-xl text-lg transition-all duration-200"
          >
            <LogIn size={18} />
            Sign In
            <ArrowRight
              size={16}
              className="opacity-70 group-hover:translate-x-1 transition"
            />
          </button>

          <button
            onClick={() => router.push("/signup")}
            className="group flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white hover:bg-white hover:text-black px-8 py-4 rounded-xl text-lg transition-all duration-200"
          >
            <UserPlus size={18} />
            Create Account
            <ArrowRight
              size={16}
              className="opacity-70 group-hover:translate-x-1 transition"
            />
          </button>

        </div>

      </motion.div>
    </section>
  );
};

export default CallToActionSection;
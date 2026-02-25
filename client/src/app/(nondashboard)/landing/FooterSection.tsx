"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Home,
  Mail,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">

        {/* top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* brand */}
          <div>
            <Link
              href="/"
              className="text-2xl font-semibold tracking-tight text-gray-900"
              scroll={false}
            >
              RENTIFUL
            </Link>

            <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-xs">
              A modern platform for discovering and managing rental homes with
              simplicity and confidence.
            </p>

            {/* socials */}
            <div className="flex gap-4 mt-6 text-gray-500">
              <Facebook className="w-5 h-5 hover:text-black transition cursor-pointer" />
              <Instagram className="w-5 h-5 hover:text-black transition cursor-pointer" />
              <Twitter className="w-5 h-5 hover:text-black transition cursor-pointer" />
              <Linkedin className="w-5 h-5 hover:text-black transition cursor-pointer" />
              <Youtube className="w-5 h-5 hover:text-black transition cursor-pointer" />
            </div>
          </div>

          {/* company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide">
              Company
            </h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex items-center gap-2 hover:text-black transition">
                <Home size={16} />
                <Link href="/about">About</Link>
              </li>
              <li className="flex items-center gap-2 hover:text-black transition">
                <Mail size={16} />
                <Link href="/contact">Contact</Link>
              </li>
              <li className="flex items-center gap-2 hover:text-black transition">
                <HelpCircle size={16} />
                <Link href="/faq">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide">
              Legal
            </h3>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex items-center gap-2 hover:text-black transition">
                <ShieldCheck size={16} />
                <Link href="/terms">Terms</Link>
              </li>
              <li className="flex items-center gap-2 hover:text-black transition">
                <ShieldCheck size={16} />
                <Link href="/privacy">Privacy</Link>
              </li>
              <li className="flex items-center gap-2 hover:text-black transition">
                <ShieldCheck size={16} />
                <Link href="/cookies">Cookies</Link>
              </li>
            </ul>
          </div>

          {/* extra */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide">
              Platform
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Built for tenants and property managers to simplify renting and
              property management.
            </p>
          </div>

        </div>

        {/* bottom */}
        <div className="mt-16 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">

          <span>
            © {new Date().getFullYear()} RENTIFUL. All rights reserved.
          </span>

          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-black transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-black transition">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-black transition">
              Cookies
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
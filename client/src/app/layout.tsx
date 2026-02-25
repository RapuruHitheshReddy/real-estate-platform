import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://main.d237kx43xwjr43.amplifyapp.com"),

  title: {
    default: "RENTIFUL",
    template: "%s | RENTIFUL",
  },

  description:
    "RENTIFUL is a modern platform to discover, rent, and manage homes effortlessly for tenants and property managers.",

  keywords: [
    "rent homes",
    "property management",
    "real estate platform",
    "rental listings",
    "apartments for rent",
    "tenant management",
  ],

  authors: [{ name: "RENTIFUL" }],
  creator: "RENTIFUL",
  publisher: "RENTIFUL",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  openGraph: {
    title: "RENTIFUL",
    description:
      "Discover, rent, and manage homes effortlessly with RENTIFUL.",
    url: "https://main.d237kx43xwjr43.amplifyapp.com",
    siteName: "RENTIFUL",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/landing-splash.jpg",
        width: 1200,
        height: 630,
        alt: "RENTIFUL Rental Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "RENTIFUL",
    description:
      "A smarter way to discover, rent, and manage homes.",
    images: ["/landing-splash.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster closeButton />
      </body>
    </html>
  );
}
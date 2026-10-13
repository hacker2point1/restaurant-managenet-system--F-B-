import type { Metadata } from "next";
import { Suspense } from "react";

import "./globals.css";
import Navbar from "@/src/components/layout/navbar";
import Providers from "@/redux/provider/providers";
import { Toaster } from "sonner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Footer from "@/src/components/layout/footer";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Savor | Discover Great Food",
  description: "Discover restaurants and great food in Kolkata.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <Providers>
          <Suspense fallback={<div className="h-[88px]" aria-hidden="true" />}>
            <Navbar />
          </Suspense>
          {children}
          <Footer currentYear={currentYear} />
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
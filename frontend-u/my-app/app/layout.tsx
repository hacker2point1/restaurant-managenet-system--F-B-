
import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { cacheLife } from "next/cache";

import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/src/components/layout/navbar";
import Footer from "@/src/components/layout/footer";
import Providers from "@/redux/provider/providers";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

async function getCurrentYear() {
  "use cache";
  cacheLife("days");

  return new Date().getFullYear();
}

export const metadata: Metadata = {
  title: "Savor | Discover Great Food",
  description: "Discover restaurants and great food in Kolkata.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = await getCurrentYear();

  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="min-h-screen bg-[#F7F8FC] font-sans antialiased">
        <Providers>
          <Suspense
            fallback={
              <div className="h-[84px]" aria-hidden="true" />
            }
          >
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

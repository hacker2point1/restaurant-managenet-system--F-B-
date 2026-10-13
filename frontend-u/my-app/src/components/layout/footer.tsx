"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Camera,
  UsersRound,
  MessageCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const discoverLinks = [
  {
    label: "Restaurants",
    href: "/restaurants",
  },
  {
    label: "Explore Food",
    href: "/explore",
  },
  {
    label: "Cuisines",
    href: "/cuisines",
  },
  {
    label: "Offers",
    href: "/offers",
  },
];

const accountLinks = [
  {
    label: "Reservations",
    href: "/reservations",
  },
  {
    label: "Loyalty Points",
    href: "/loyalty",
  },
  {
    label: "Reviews",
    href: "/reviews",
  },
  {
    label: "Profile",
    href: "/profile",
  },
];

export default function Footer({ currentYear }: { currentYear: number }) {
  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email");

    console.log("Newsletter email:", email);

    form.reset();
  };

  return (
    <footer className="bg-[#151329] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-[1650px] px-6 py-16 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.6fr] lg:gap-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5b45e8] text-2xl font-bold shadow-lg shadow-[#5b45e8]/20 transition-transform duration-300 group-hover:scale-105">
                S
              </span>

              <span className="text-lg font-semibold tracking-tight">
                Savor<span className="text-[#8b7cf6]">.</span>
              </span>
            </Link>

            <p className="max-w-sm text-[15px] leading-7 text-[#aaa5bc]">
              Exceptional food, thoughtfully discovered.
              <br />
              Memorable tables, effortlessly reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <SocialLink
                href="#"
                label="Instagram"
                icon={<Camera className="h-4 w-4" />}
              />

              <SocialLink
                href="#"
                label="Facebook"
                icon={<UsersRound className="h-4 w-4" />}
              />

              <SocialLink
                href="#"
                label="Twitter"
                icon={<MessageCircle className="h-4 w-4" />}
              />
            </div>
          </div>

          {/* Discover */}
          <FooterColumn title="Discover" links={discoverLinks} />

          {/* Account */}
          <FooterColumn title="Your account" links={accountLinks} />

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              Stay in the know
            </h3>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#aaa5bc]">
              Fresh tables and special offers, straight to your inbox.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="mt-5 flex w-full max-w-[500px] overflow-hidden rounded-xl border border-[#4a455c] bg-[#18162d] transition-colors focus-within:border-[#5b45e8]"
            >
              <Input
                name="email"
                type="email"
                required
                placeholder="Your email address"
                className="h-14 flex-1 rounded-none border-0 bg-transparent px-5 text-sm text-white shadow-none placeholder:text-[#817c91] focus-visible:ring-0"
              />

              <Button
                type="submit"
                size="icon"
                className="m-1 h-12 w-12 shrink-0 rounded-lg bg-[#5b45e8] text-white hover:bg-[#6954f2]"
                aria-label="Subscribe to newsletter"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-[#393449]" />

        {/* Bottom Footer */}
        <div className="flex flex-col gap-6 text-sm text-[#777286] lg:flex-row lg:items-center lg:justify-between">
          {/* Copyright */}
          <p>
            © {currentYear} Savor Technologies Pvt. Ltd.
          </p>

          {/* Legal */}
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>

            <span className="text-[#454052]">·</span>

            <Link
              href="/terms"
              className="transition-colors hover:text-white"
            >
              Terms
            </Link>

            <span className="text-[#454052]">·</span>

            <Link
              href="/help"
              className="transition-colors hover:text-white"
            >
              Help
            </Link>
          </div>

          {/* Payment */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />

            <span>Secure payments by Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==========================================
   FOOTER COLUMN
========================================== */

interface FooterColumnProps {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold tracking-tight">
        {title}
      </h3>

      <nav className="mt-6 flex flex-col gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="w-fit text-[15px] text-[#aaa5bc] transition-all duration-200 hover:translate-x-1 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/* ==========================================
   SOCIAL LINK
========================================== */

interface SocialLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function SocialLink({
  href,
  label,
  icon,
}: SocialLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#393449] text-[#aaa5bc] transition-all duration-200 hover:border-[#5b45e8] hover:bg-[#5b45e8] hover:text-white"
    >
      {icon}
    </Link>
  );
}
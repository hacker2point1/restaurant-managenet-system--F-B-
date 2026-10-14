
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  UserRound,
  Menu,
  X,
  ChevronDown,
  LogOut,
  CircleUserRound,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import type { RootState, AppDispatch } from "@/redux/store/store";
import {
  authLogout,
  getProfile,
  logout,
} from "@/redux/slice/authSlice";

import LoginModal from "@/src/components/auth/LoginModal";
import RegisterModal from "@/src/components/auth/registerModal";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Explore Food", href: "/explore-food" },
  { label: "Offers", href: "/offers" },
];

const C = {
  primary: "#5B4BFF",
  primaryHover: "#4939ED",
  deep: "#302765",
  lavender: "#C2BBFF",
  background: "#F7F8FC",
  border: "#E3E3E8",
  muted: "#737789",
  text: "#1B1B1F",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    user,
    name,
    email,
    profileImage,
    isloggedIn,
    sessionChecked,
  } = useSelector((state: RootState) => state.auth);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const visibleNavLinks =
    user?.role === "admin" || user?.role === "manager"
      ? [...navLinks, { label: "Reservations", href: "/admin/reservations" }]
      : navLinks;

  useEffect(() => {
    if (!sessionChecked) {
      void dispatch(getProfile());
    }
  }, [dispatch, sessionChecked]);

  const displayName =
    name ||
    user?.name ||
    user?.username ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    email ||
    user?.email ||
    "My Account";

  const imageUrl =
    typeof profileImage === "string"
      ? profileImage
      : profileImage?.url;

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await dispatch(authLogout()).unwrap();
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Unable to log out. Please try again.");
    } finally {
      dispatch(logout());
      setProfileMenuOpen(false);
      setMobileMenuOpen(false);
      router.replace("/");
      setLoggingOut(false);
    }
  }

  function handleSignIn() {
    setMobileMenuOpen(false);
    setLoginOpen(true);
  }

  function handleCreateAccount() {
    setLoginOpen(false);
    setRegisterOpen(true);
  }

  function handleSignInFromRegister() {
    setRegisterOpen(false);
    setLoginOpen(true);
  }

  const navLinkClass = (href: string) =>
    `relative flex h-full items-center whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
      isActive(href)
        ? "text-[#5B4BFF]"
        : "text-[#737789] hover:text-[#5B4BFF]"
    }`;

  const mobileLinkClass = (href: string) =>
    `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
      isActive(href)
        ? "bg-[#F0EFFF] text-[#5B4BFF]"
        : "text-[#737789] hover:bg-[#F7F8FC] hover:text-[#5B4BFF]"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#E3E3E8] bg-white/95 font-sans backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:h-[84px] lg:px-12">
          {/* Brand */}
          <Link
            href="/"
            aria-label="Savor home"
            className="group flex shrink-0 items-center gap-2.5"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5B4BFF] text-xl font-semibold text-white shadow-lg shadow-[#5B4BFF]/20 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:h-11 sm:w-11">
              S
            </span>

            <span className="text-[27px] font-semibold tracking-[-1.5px] text-[#1B1B1F] sm:text-[30px]">
              Savor<span className="text-[#5B4BFF]">.</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden h-full items-center gap-6 lg:flex xl:gap-9"
          >
            {visibleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navLinkClass(link.href)}
              >
                {link.label}

                {isActive(link.href) && (
                  <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-[#5B4BFF]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Location */}
            <div className="hidden items-center gap-2 rounded-full bg-[#F7F8FC] px-3 py-2 text-sm font-medium text-[#737789] xl:flex">
              <MapPin className="h-4 w-4 text-[#5B4BFF]" />
              <span>Kolkata</span>
            </div>

            {/* Signed-in user */}
            {isloggedIn ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                  aria-expanded={profileMenuOpen}
                  aria-label="Open account menu"
                  className="flex h-11 items-center gap-2 rounded-xl border border-transparent px-2 transition-colors hover:border-[#E3E3E8] hover:bg-[#F7F8FC]"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={displayName}
                      className="h-9 w-9 rounded-full border border-[#E3E3E8] object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EFFF] text-sm font-semibold text-[#5B4BFF]">
                      {initials || <UserRound className="h-4 w-4" />}
                    </span>
                  )}

                  <span className="hidden max-w-[110px] truncate text-sm font-medium text-[#1B1B1F] md:block">
                    {displayName}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-[#737789] transition-transform ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileMenuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close account menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setProfileMenuOpen(false)}
                    />

                    <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-[#E3E3E8] bg-white p-2 shadow-xl shadow-[#302765]/10">
                      <div className="border-b border-[#E3E3E8] px-3 py-3">
                        <p className="truncate text-sm font-semibold text-[#1B1B1F]">
                          {displayName}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#737789]">
                          {email || user?.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#737789] transition-colors hover:bg-[#F0EFFF] hover:text-[#5B4BFF]"
                      >
                        <CircleUserRound className="h-[18px] w-[18px]" />
                        My Profile
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        disabled={loggingOut}
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <LogOut className="h-[18px] w-[18px]" />
                        {loggingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Sign in */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="hidden h-11 items-center justify-center rounded-xl border border-[#E3E3E8] bg-white px-5 text-sm font-semibold text-[#1B1B1F] transition-colors hover:border-[#C2BBFF] hover:bg-[#F7F8FC] sm:flex"
                >
                  Sign in
                </button>

                {/* Create account */}
                <button
                  type="button"
                  onClick={() => setRegisterOpen(true)}
                  className="hidden h-11 items-center justify-center gap-2 rounded-xl bg-[#5B4BFF] px-5 text-sm font-semibold text-white shadow-lg shadow-[#5B4BFF]/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4939ED] hover:shadow-[#5B4BFF]/25 sm:flex"
                >
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E3E3E8] text-[#302765] transition-colors hover:bg-[#F0EFFF] lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-[#E3E3E8] bg-white px-5 py-4 lg:hidden sm:px-8"
          >
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F7F8FC] px-4 py-3 text-sm text-[#737789]">
              <MapPin className="h-4 w-4 text-[#5B4BFF]" />
              Kolkata, West Bengal
            </div>

            <div className="space-y-1">
              {visibleNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileLinkClass(link.href)}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#5B4BFF]" />
                  )}
                </Link>
              ))}
            </div>

            {isloggedIn ? (
              <div className="mt-4 border-t border-[#E3E3E8] pt-4">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#737789] hover:bg-[#F0EFFF] hover:text-[#5B4BFF]"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={displayName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0EFFF] text-sm font-semibold text-[#5B4BFF]">
                      {initials || <UserRound className="h-4 w-4" />}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {displayName}
                  </span>
                  <CircleUserRound className="h-5 w-5" />
                </Link>

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5" />
                  {loggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E3E3E8] pt-4">
                <button
                  type="button"
                  onClick={handleSignIn}
                  className="flex h-11 items-center justify-center rounded-xl border border-[#E3E3E8] text-sm font-semibold text-[#302765] transition-colors hover:bg-[#F7F8FC]"
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setRegisterOpen(true);
                  }}
                  className="flex h-11 items-center justify-center gap-1 rounded-xl bg-[#5B4BFF] px-2 text-sm font-semibold text-white transition-colors hover:bg-[#4939ED]"
                >
                  Join Savor
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Authentication modals */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onCreateAccount={handleCreateAccount}
      />

      <RegisterModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSignIn={handleSignInFromRegister}
      />
    </>
  );
}

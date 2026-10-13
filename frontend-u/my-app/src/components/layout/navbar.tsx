
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Search,
  UserRound,
  Menu,
  X,
  ChevronDown,
  LogOut,
  CircleUserRound,
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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user, name, email, profileImage, isloggedIn, sessionChecked } =
    useSelector((state: RootState) => state.auth);
  const visibleNavLinks =
    user?.role === "admin" || user?.role === "manager"
      ? [...navLinks, { label: "Reservations", href: "/admin/reservations" }]
      : navLinks;

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // Restore the session from the backend cookie.
  // The backend profile endpoint remains the source of truth.
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

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    router.push(
      `/restaurants?search=${encodeURIComponent(query)}`
    );

    setSearchOpen(false);
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await dispatch(authLogout()).unwrap();
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

  // Open login modal without leaving the current page.
  function handleSignIn() {
    setMobileMenuOpen(false);
    setLoginOpen(true);
  }

  // Open the registration page from the login modal.
  function handleCreateAccount() {
    setLoginOpen(false);
    setRegisterOpen(true);
  }

  function handleSignInFromRegister() {
    setRegisterOpen(false);
    setLoginOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#EDE5DE] bg-[#FFFCF8]">
        <div className="mx-auto flex h-[88px] max-w-[1660px] items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Brand */}
          <Link
            href="/"
            aria-label="Savor home"
            className="flex shrink-0 items-center gap-3"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F0542A] font-serif text-[35px] italic leading-none text-white">
              S
            </span>

            <span className="font-serif text-[32px] font-bold tracking-[-1.5px] text-[#2D211C] sm:text-[36px]">
              Savor<span className="text-[#F0542A]">.</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden h-full items-center gap-7 lg:flex xl:gap-10"
          >
            {visibleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex h-full items-center whitespace-nowrap text-[16px] font-semibold transition-colors xl:text-[17px] ${
                  isActive(link.href)
                    ? "text-[#F0542A]"
                    : "text-[#62574F] hover:text-[#F0542A]"
                }`}
              >
                {link.label}

                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#F0542A]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Location */}
            <div className="hidden items-center gap-2 text-[16px] font-medium text-[#62574F] sm:flex">
              <MapPin size={21} strokeWidth={1.8} />
              <span>Kolkata</span>
            </div>

            {/* Search button */}
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-[#E8DED5] text-[#302721] transition hover:border-[#F0542A] hover:text-[#F0542A]"
            >
              {searchOpen ? (
                <X size={23} />
              ) : (
                <Search size={25} />
              )}
            </button>

            {/* Authenticated user */}
            {isloggedIn ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() =>
                    setProfileMenuOpen((open) => !open)
                  }
                  aria-expanded={profileMenuOpen}
                  className="flex h-[54px] items-center gap-2 rounded-xl px-2 transition hover:bg-[#F5EDE6]"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={displayName}
                      className="h-10 w-10 rounded-full border border-[#E8DED5] object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0542A] text-sm font-bold text-white">
                      {initials || <UserRound size={20} />}
                    </span>
                  )}

                  <span className="max-w-[110px] truncate text-sm font-semibold text-[#302721]">
                    {displayName}
                  </span>

                  <ChevronDown
                    size={17}
                    className="text-[#62574F]"
                  />
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-[#EDE5DE] bg-white p-2 shadow-xl">
                    <div className="border-b border-[#F0E8E1] px-3 py-3">
                      <p className="truncate text-sm font-semibold text-[#302721]">
                        {displayName}
                      </p>

                      <p className="truncate text-xs text-[#8B7D73]">
                        {email || user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#62574F] hover:bg-[#FFF3ED] hover:text-[#F0542A]"
                    >
                      <CircleUserRound size={19} />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      disabled={loggingOut}
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <LogOut size={19} />
                      {loggingOut
                        ? "Signing out..."
                        : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop sign-in opens modal */
              <button
                type="button"
                onClick={handleSignIn}
                className="hidden h-[60px] items-center justify-center gap-3 rounded-[15px] bg-[#F0542A] px-6 font-semibold text-white shadow-[0_8px_20px_rgba(240,84,42,0.12)] transition hover:bg-[#D94720] sm:flex xl:px-7"
              >
                <UserRound size={22} strokeWidth={1.8} />
                Sign in
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              aria-label={
                mobileMenuOpen ? "Close menu" : "Open menu"
              }
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-[#302721] hover:bg-[#F5EDE6] lg:hidden"
            >
              {mobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="border-t border-[#EDE5DE] bg-[#FFFCF8] px-5 py-4">
            <form
              onSubmit={handleSearch}
              className="mx-auto flex max-w-2xl gap-3"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search restaurants or dishes..."
                className="h-12 min-w-0 flex-1 rounded-xl border border-[#E8DED5] bg-white px-4 text-sm outline-none focus:border-[#F0542A] focus:ring-2 focus:ring-[#F0542A]/10"
              />

              <button
                type="submit"
                className="rounded-xl bg-[#F0542A] px-5 font-semibold text-white hover:bg-[#D94720]"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-[#EDE5DE] bg-[#FFFCF8] px-5 py-4 lg:hidden"
          >
            <div className="mb-3 flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#62574F] sm:hidden">
              <MapPin size={19} />
              Kolkata, West Bengal
            </div>

            {visibleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`mb-1 block rounded-xl px-3 py-3 font-semibold ${
                  isActive(link.href)
                    ? "bg-[#F0542A]/10 text-[#F0542A]"
                    : "text-[#62574F] hover:bg-[#F5EDE6]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isloggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-[#62574F] hover:bg-[#F5EDE6]"
                >
                  <CircleUserRound size={20} />
                  {displayName}
                </Link>

                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} />
                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F0542A] font-semibold text-white hover:bg-[#D94720]"
              >
                <UserRound size={20} />
                Sign in
              </button>
            )}
          </nav>
        )}
      </header>

      {/* Shared login modal */}
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

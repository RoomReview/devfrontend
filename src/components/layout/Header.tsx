import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoReview from "../../assets/logoReview.png";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Postcode", path: "/postcode-search" },
    { label: "Borough", path: "/area-search" },
    { label: "Reviews", path: "/reviews" },
    { label: "About Us", path: "/about" },
  ];

  const handleNavClick = () => setIsMenuOpen(false);

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl transition-colors"
          onClick={handleNavClick}
        >
          <div className="flex items-center justify-center rounded-lg bg-[#8B0202] px-2 py-1.5 shadow-sm">
            <img
              src={logoReview}
              alt="RoomReview"
              className="h-7 object-contain md:h-8"
            />
          </div>
          <span className="text-lg font-semibold tracking-[-0.03em] text-slate-900">RoomReview.co.uk</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#8B0202] shadow-sm ring-1 ring-[#8B0202]/20"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          {isAuthenticated ? (
            <>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B0202] text-sm font-bold text-white select-none"
                title={`${user?.firstName} ${user?.lastName}`}
              >
                {`${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`}
              </div>

              <Link
                to="/account"
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:text-slate-600"
              >
                Account
              </Link>

              <button
                onClick={logout}
                className="rounded-full px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:text-slate-600"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-[#8B0202] bg-white px-5 py-2 text-sm font-semibold text-[#8B0202] transition-colors hover:bg-[#8B0202]/5"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-[#8B0202] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6A0101]"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 shadow-sm lg:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[#e8ddd5] bg-[#F3E6DE] px-4 pb-4 sm:px-6 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2 pt-4">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                    isActive
                      ? "bg-[#0B0B0B] text-white"
                      : "bg-white/70 text-[#0B0B0B] hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mx-auto mt-4 flex max-w-7xl flex-col gap-2 sm:flex-row">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={handleNavClick}
                  className="rounded-xl border border-[#1E293B] bg-white px-4 py-3 text-center text-base font-semibold text-[#1E293B] shadow-sm"
                >
                  Account
                </Link>
                <button
                  onClick={() => {
                    handleNavClick();
                    void logout();
                  }}
                  className="rounded-xl bg-[#1E293B] px-4 py-3 text-base font-semibold text-white shadow-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  onClick={handleNavClick}
                  className="rounded-xl bg-[#8B0202] px-4 py-3 text-center text-base font-semibold text-white shadow-sm"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="rounded-xl bg-[#1E293B] px-4 py-3 text-center text-base font-semibold text-white shadow-sm"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;

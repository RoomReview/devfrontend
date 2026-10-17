import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import logoReview from "../../assets/logoReview.png";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    { label: "Postcode", path: "/postcode-search" },
    { label: "Borough", path: "/area-search" },
    { label: "Report", path: "/report" },
    { label: "Pricing", path: "/pricing" },
    { label: "Blog", path: "/blog" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  const handleNavClick = () => setIsMenuOpen(false);
  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    setIsMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      console.error("Could not invalidate the server session during logout", error);
      setLogoutError(true);
    } finally {
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
        accountButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl transition-colors"
          onClick={handleNavClick}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8B0202] shadow-sm md:h-10 md:w-10">
            <img
              src={logoReview}
              alt="RoomReview"
              className="h-5 w-5 object-contain md:h-6 md:w-6"
            />
          </div>
          <span className="text-[1.2rem] font-black leading-none tracking-[-0.05em] text-[#0F1724] md:text-[1.55rem]">
            RoomReview.co.uk
          </span>
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

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                ref={accountButtonRef}
                type="button"
                aria-label={`Account menu for ${user?.firstName ?? "user"}`}
                aria-expanded={isAccountMenuOpen}
                aria-controls="account-menu"
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full p-1 pr-2 text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0202]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8B0202] text-xs font-bold text-white">
                  {`${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`}
                </span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              {isAccountMenuOpen ? (
                <div id="account-menu" className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <Link
                    to="/account"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-xl border border-[#8B0202] bg-white px-5 py-2 text-sm font-semibold text-[#8B0202] transition-colors hover:bg-[#8B0202]/5 sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="hidden rounded-xl bg-[#8B0202] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#6A0101] sm:inline-flex"
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

      {logoutError ? (
        <p role="status" className="border-t border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          You have been signed out on this device, but the server could not confirm session invalidation.
        </p>
      ) : null}

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
                <p className="px-2 py-2 text-sm font-medium text-[#1E293B]">
                  Signed in as {user?.firstName ?? "User"}
                </p>
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

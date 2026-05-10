import { Link, useLocation } from "react-router";
import logoReview from "../../assets/logoReview.png";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: "Reviews", path: "/reviews" },
    { label: "Share Experience", path: "/share-experience" },
    { label: "Boroughs", path: "/" },
    { label: "About", path: "/about" },
    { label: "Blog", path: "/blog" },
  ];

  return (
    <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center bg-[#F3E6DE]">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center justify-center bg-[#8B0202] rounded-xl px-3 py-2 shadow-sm hover:bg-[#6A0101] transition-colors"
      >
        <img
          src={logoReview}
          alt="RoomReview"
          className="h-10 md:h-12 object-contain"
        />
      </Link>

      {/* Navigation Pill */}
      <nav className="hidden lg:flex items-center bg-[#E5DCD5]/60 rounded-md p-0">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.path;
          const maxIndex = navItems.length - 1;
          const minIndex = 0;

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`px-6 py-2.5 ${constructRoundedCorners(index, maxIndex, minIndex)} text-base font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-[#0B0B0B] text-white shadow-md"
                  : "text-[#0B0B0B] hover:text-[#0B0B0B]/70 hover:bg-white/40"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons — conditional on auth state */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {/* User avatar showing initials */}
            <div
              className="w-10 h-10 rounded-full bg-[#8B0202] text-white flex items-center justify-center text-sm font-bold select-none"
              title={`${user?.firstName} ${user?.lastName}`}
            >
              Hi
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="bg-[#1E293B] text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-[#0F172A] transition-colors shadow-sm"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/register"
              className="bg-[#8B0202] text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-[#6A0101] transition-colors shadow-sm"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-[#1E293B] text-white px-8 py-3 rounded-xl text-base font-semibold hover:bg-[#0F172A] transition-colors shadow-sm"
            >
              Log in
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

function constructRoundedCorners(
  currentIndex: number,
  maxIndex: number,
  minIndex: number,
): string {
  if (currentIndex === maxIndex) return "rounded-r-md";
  if (currentIndex === minIndex) return "rounded-l-md";
  return "rounded-md";
}

export default Header;

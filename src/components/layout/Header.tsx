import { Link } from 'react-router';
import { Home, Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">RoomReview</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/reviews" className="text-gray-600 hover:text-primary-600">
              Reviews
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-primary-600">
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/login"
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

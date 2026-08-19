import { Link } from 'react-router-dom';
import roomReviewLogo from '@img/roomreview.png';

const Footer = () => {
  return (
    <footer className="bg-[#071424] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-start">
              <img src={roomReviewLogo} alt="RoomReview logo" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <p className="text-2xl font-semibold">RoomReview.co.uk</p>
              <p className="text-sm text-gray-400">Property intelligence for smarter decisions.</p>
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <p className="font-semibold text-white">ROOMREVIEW LTD</p>
              <p>Company number: 16307644</p>
              <p>Registered office: 51a–53a High Road, London, England, NW10 2SU</p>
              <p>Email: info@roomreview.co.uk</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400 mb-4">All Pages</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/postcode-search" className="hover:text-white">Postcode</Link></li>
              <li><Link to="/borough" className="hover:text-white">Borough</Link></li>
              <li><Link to="/report" className="hover:text-white">Report</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400 mb-4">Reports</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/buyer-report" className="hover:text-white">Buyer Report</Link></li>
              <li><Link to="/investor-report" className="hover:text-white">Investor Report</Link></li>
              <li><Link to="/reviews" className="hover:text-white">RoomReview Score</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400 mb-4">Trust & Data</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/data-sources" className="hover:text-white">Data Sources</Link></li>
              <li><Link to="/methodology" className="hover:text-white">Methodology</Link></li>
              <li><Link to="/how-we-use-public-data" className="hover:text-white">How We Use Public Data</Link></li>
              <li><Link to="/open-government-licence" className="hover:text-white">Open Government Licence</Link></li>
              <li><Link to="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-white">Cookie Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Use</Link></li>
              <li><Link to="/cookies-settings" className="hover:text-white">Cookies Settings</Link></li>
            </ul>
            <div className="mt-8">
              <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-400 mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
                <li><Link to="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-sm text-gray-400 text-center">
          <p>RoomReview uses public and licensed datasets. Information is provided for general research only, is not financial advice, and does not imply government endorsement.</p>
          <p className="mt-4">© {new Date().getFullYear()} RoomReview Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

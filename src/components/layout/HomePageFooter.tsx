import { Link } from 'react-router-dom';
import roomReviewLogo from '@img/roomreview.png';

const HomePageFooter = () => {
  return (
    <footer className="bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex h-28 w-28 items-center justify-center rounded-[1.75rem] border border-[#8B0202] bg-[#8B0202] text-white">
              <img src={roomReviewLogo} alt="RoomReview logo" className="h-28 w-28 object-contain" />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              Read real reviews about properties, landlords, and neighbourhoods. Discover what it is really like to live there through honest feedback and transparent local experiences.
            </p>
            <div className="mt-6 flex items-center gap-4 text-black text-sm font-semibold">
              <span>in</span>
              <span>f</span>
              <span>📷</span>
              <span>T</span>
              <span>X</span>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8B0202]">RULES</h4>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li><Link to="/privacy" className="hover:text-slate-950">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-slate-950">Cookie Policy</Link></li>
              <li><Link to="/data-sources" className="hover:text-slate-950">Data Sources and Methodology</Link></li>
            </ul>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8B0202]">INFORMATION</h4>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li><Link to="/about" className="hover:text-slate-950">About</Link></li>
              <li><Link to="/reviews" className="hover:text-slate-950">Reviews</Link></li>
              <li><Link to="/area-search" className="hover:text-slate-950">Borough</Link></li>
            </ul>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8B0202]">DATA</h4>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li><Link to="/postcode-search" className="hover:text-slate-950">Postcode listing</Link></li>
              <li><Link to="/register" className="hover:text-slate-950">Share Your Experience</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white px-8 py-6 shadow-sm flex flex-col gap-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">RoomReview © 2025</p>
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-[#8B0202]">
            <Link to="/data-sources" className="hover:text-slate-600">Data sources</Link>
            <Link to="/area-search" className="hover:text-slate-600">Boroughs</Link>
            <Link to="/about" className="hover:text-slate-600">About</Link>
            <Link to="/reviews" className="hover:text-slate-600">Reviews</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomePageFooter;

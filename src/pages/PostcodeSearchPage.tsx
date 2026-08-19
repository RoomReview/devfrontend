import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { H1, Body, Small } from '../components/common/Typography';
import Button from '../components/common/Button';
import heroImage from '@img/city.jpg';
import shieldIcon from '@img/shield.png';
import starIcon from '@img/star.png';
import homeIcon from '@img/home.png';
import upIcon from '@img/up.png';

const PostcodeSearchPage = () => {
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [sortType, setSortType] = useState<'alphabetical' | 'crime' | 'price' | 'rating'>('alphabetical');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  const mockResults = [
    {
      postcode: 'E1 6AN',
      borough: 'Tower Hamlets',
      crimeRating: 74,
      avgPrice: 1850,
      rating: 4.6,
      reviews: 42,
      safe: true,
    },
    {
      postcode: 'SW1A 1AA',
      borough: 'Westminster',
      crimeRating: 34,
      avgPrice: 2550,
      rating: 4.9,
      reviews: 114,
      safe: true,
    },
    {
      postcode: 'N1 9GU',
      borough: 'Islington',
      crimeRating: 58,
      avgPrice: 2100,
      rating: 4.3,
      reviews: 28,
      safe: true,
    },
    {
      postcode: 'E2 8AA',
      borough: 'Hackney',
      crimeRating: 81,
      avgPrice: 1750,
      rating: 4.1,
      reviews: 18,
      safe: false,
    },
    {
      postcode: 'SE1 2AA',
      borough: 'Southwark',
      crimeRating: 47,
      avgPrice: 2300,
      rating: 4.7,
      reviews: 61,
      safe: true,
    },
    {
      postcode: 'W1A 1AA',
      borough: 'City of Westminster',
      crimeRating: 29,
      avgPrice: 3200,
      rating: 4.8,
      reviews: 89,
      safe: true,
    },
  ];

  const sortedResults = [...mockResults].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (sortType === 'alphabetical') {
      return a.postcode.localeCompare(b.postcode) * direction;
    }
    if (sortType === 'crime') {
      return (a.crimeRating - b.crimeRating) * direction;
    }
    if (sortType === 'price') {
      return (a.avgPrice - b.avgPrice) * direction;
    }
    return (a.rating - b.rating) * direction;
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = postcode.trim();

    if (!trimmed) {
      setError('Enter a valid UK postcode');
      return;
    }

    setError('');
    navigate(`/postcode/${encodeURIComponent(trimmed.toUpperCase())}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <div>
            <Small className="text-primary uppercase tracking-[0.22em] mb-3 block">
              Postcode search
            </Small>
            <H1 className="text-[#1A2B3C] leading-tight">
              Post Code Listing
            </H1>
            <Body className="mt-6 text-[#0B0B0B] leading-8 max-w-2xl">
              Welcome to the Postcode Listings page, your guide to exploring every London postcode with up-to-date data, local insights, and interactive tools to help you find great places to live, work, and visit.
            </Body>
            <Body className="mt-4 text-[#0B0B0B] leading-8 max-w-2xl">
              Please note that property details can vary within the same postcode, so <span className="font-semibold">always verify key information</span>—such as the exact address, condition, and legitimacy—directly with the landlord or letting agency before making any decisions.
            </Body>

            <form onSubmit={handleSearch} className="mt-10 grid gap-4 sm:grid-cols-[1fr_auto] items-center">
              <label className="sr-only" htmlFor="postcode-search">
                Postcode
              </label>
              <input
                id="postcode-search"
                type="text"
                value={postcode}
                onChange={(event) => setPostcode(event.target.value)}
                placeholder="Search for a postcode (AB1 C23)"
                className="w-full rounded-[18px] border border-[#D9D5D0] bg-white px-5 py-4 text-base text-[#1A2B3C] placeholder:text-gray-400 focus:outline-none shadow-sm"
              />
              <Button type="submit" className="w-full sm:w-auto" variant="primary">
                Search
              </Button>
            </form>

            {error && <p className="mt-4 text-sm text-primary">{error}</p>}
          </div>

          <div className="rounded-[36px] overflow-hidden shadow-[0_24px_60px_rgba(20,22,33,0.08)] border border-[#E5DCD5]">
            <img src={heroImage} alt="London street" className="w-full h-[420px] object-cover" />
          </div>
        </div>

        <div className="mt-16 rounded-[36px] border border-[#E9E6E2] bg-[#FCFBFA] p-8 shadow-[0_20px_48px_rgba(20,22,33,0.06)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <H1 className="text-xl font-semibold text-[#1A2B3C]">Results</H1>
              <Body className="mt-2 text-[#4A4A4A]">Showing postcode results with mock data. Sort by the controls on the right.</Body>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C] shadow-sm">
                <img src={upIcon} alt="Sort direction" className="h-4 w-4" />
                <span className="font-semibold">Sort by</span>
                <select
                  id="sort"
                  value={sortType}
                  onChange={(event) => setSortType(event.target.value as any)}
                  className="appearance-none bg-transparent text-sm text-[#1A2B3C] focus:outline-none"
                >
                  <option value="alphabetical">Alphabetical (A → Z)</option>
                  <option value="crime">Crime Rating</option>
                  <option value="price">Apartment Price</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center gap-2 rounded-full border border-[#D9D5D0] bg-white px-4 py-3 text-sm text-[#1A2B3C] shadow-sm"
              >
                <img src={upIcon} alt="Toggle direction" className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : 'rotate-0'}`} />
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {sortedResults.map((result) => (
              <Link
                key={result.postcode}
                to={`/postcode/${encodeURIComponent(result.postcode)}`}
                className="group rounded-[28px] border border-[#F1ECE7] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[#8B0202] group-hover:text-[#700000]">{result.postcode}</p>
                    <p className="text-sm text-[#6B7280]">{result.borough}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${result.safe ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {result.safe ? 'Safe' : 'Risky'}
                  </span>
                </div>

                <div className="mt-6 grid gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E2DC] bg-[#FCFBFA] px-3 py-2 text-sm text-[#4A4A4A]">
                    <img src={starIcon} alt="Rating" className="h-4 w-4" />
                    <span>★ {result.rating.toFixed(1)}</span>
                    <span className="text-[#6B7280]">{result.reviews} reviews</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E2DC] bg-[#FCFBFA] px-3 py-2 text-sm text-[#4A4A4A]">
                    <img src={homeIcon} alt="Home" className="h-4 w-4" />
                    <span>Avg. Price: £{result.avgPrice.toLocaleString()}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#E7E2DC] bg-[#FCFBFA] px-3 py-2 text-sm text-[#4A4A4A]">
                    <img src={shieldIcon} alt="Crime rating" className="h-4 w-4" />
                    <span>Crime: {result.crimeRating}</span>
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center justify-center rounded-full border border-[#8B0202] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#8B0202] transition-colors group-hover:bg-[#8B0202] group-hover:text-white">
                  View area details
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostcodeSearchPage;

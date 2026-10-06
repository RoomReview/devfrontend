import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, Plus, Shield, Star, TrendingUp } from 'lucide-react';
import { H1, Body, Small } from '../components/common/Typography';
import Button from '../components/common/Button';
import heroImage from '@img/city.jpg';
import { postcodePath } from '@/utils/helpers';
import { postcodeService, type PostcodeListItem } from '@/services/postcode.service';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
}).format(value);

const PostcodeSearchPage = () => {
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [postcodes, setPostcodes] = useState<PostcodeListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPostcodes, setTotalPostcodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();
  const pageSize = 100;

  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setLoadError(null);
    setPostcodes([]);

    void postcodeService.getAll(currentPage, pageSize)
      .then((response) => {
        if (!isCurrent) return;
        setPostcodes(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalPostcodes(response.pagination.total);
      })
      .catch(() => {
        if (!isCurrent) return;
        setPostcodes([]);
        setLoadError('Postcodes could not be loaded. Please try again.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [currentPage, reloadKey]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = postcode.trim();

    if (!trimmed) {
      setError('Enter a valid UK postcode');
      return;
    }

    setError('');
    navigate(postcodePath(trimmed));
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
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

        <div className="mt-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <H1 className="text-xl font-semibold text-[#1A2B3C]">All postcodes</H1>
              <Body className="mt-2 text-[#4A4A4A]">
                {loading
                  ? 'Loading postcodes...'
                  : totalPostcodes > 0
                    ? `${totalPostcodes.toLocaleString('en-GB')} postcodes available. Showing page ${currentPage} of ${totalPages}.`
                    : 'No postcodes are available yet.'}
              </Body>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#6B7280]" aria-live="polite">
              {loading ? 'Loading postcode listings' : `${postcodes.length} on this page`}
            </div>
          </div>

          {loadError && (
            <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p>{loadError}</p>
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            </div>
          )}

          {!loadError && (
            <>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {postcodes.map((result) => (
                  <article
                    key={result.postcodeId}
                    className="group relative flex min-h-[162px] flex-col rounded-xl border border-[#E5E5E5] bg-white p-3.5 shadow-[0_3px_12px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-md"
                  >
                    <Link
                      to={postcodePath(result.code)}
                      aria-label={`View postcode details for ${result.code}`}
                      className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0202]"
                    />
                    <div className="pointer-events-none relative z-10 flex min-h-[132px] flex-col">
                      <h2 className="text-sm font-bold text-[#8B0202] group-hover:text-[#700000]">
                        {result.code}
                      </h2>
                      <p className="mt-0.5 text-[10px] text-[#777]">{result.boroughName ?? 'Borough unavailable'}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      {result.crimeRatePer1000 !== null && result.londonAverageCrimeRatePer1000 !== null ? (
                        <span
                          title={`Recorded crime rate: ${result.crimeRatePer1000.toFixed(1)} per 1,000 residents; London average: ${result.londonAverageCrimeRatePer1000.toFixed(1)}.`}
                          className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#222]"
                        >
                          <Shield
                            className={`h-3 w-3 ${result.crimeRatePer1000 <= result.londonAverageCrimeRatePer1000 ? 'fill-[#087A36] text-[#087A36]' : 'fill-[#B42318] text-[#B42318]'}`}
                            aria-hidden="true"
                          />
                          {result.crimeRatePer1000 <= result.londonAverageCrimeRatePer1000 ? 'Safe' : 'Higher crime'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#555]">
                          <Shield className="h-3 w-3 text-[#777]" aria-hidden="true" />
                          Crime n/a
                        </span>
                      )}
                      <Link
                        to={`${postcodePath(result.code)}#reviews`}
                        className="pointer-events-auto relative z-20 inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#555] hover:border-[#D97706]"
                      >
                        <Star className="h-3 w-3 fill-[#F4B400] text-[#F4B400]" aria-hidden="true" />
                        {result.averageRating !== null
                          ? (
                            <span className="text-[#222]">{result.averageRating.toFixed(1)}</span>
                          ) : <span className="text-[#777]">—</span>}
                        <span className="text-[#777]">· {result.reviewCount} reviews</span>
                      </Link>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        title={result.priceSource === 'borough' ? 'Average price is the latest available borough-wide figure.' : 'Average price is calculated from available sales for this postcode.'}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#555]"
                      >
                        <Home className="h-3 w-3 text-[#111]" aria-hidden="true" />
                        {result.averagePrice !== null
                          ? (
                            <>
                              Avg. Price: <span className="font-semibold text-[#222]">{formatCurrency(result.averagePrice)}</span>
                            </>
                          )
                          : 'Avg. Price: n/a'}
                      </span>
                      <span
                        title={`Year-over-year price trend${result.priceSource === 'borough' ? ' for this borough' : ' for this postcode'}.`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] leading-none text-[#8B0202]"
                      >
                        <TrendingUp className="h-3 w-3" aria-hidden="true" />
                        {result.priceGrowthPct !== null
                          ? `${result.priceGrowthPct > 0 ? '+' : ''}${result.priceGrowthPct.toFixed(1)}%`
                          : 'n/a'}
                      </span>
                    </div>

                    <Link
                      to={postcodePath(result.code)}
                      className="pointer-events-auto relative z-20 mt-auto inline-flex w-fit items-center gap-1 pt-4 text-[10px] text-[#334155] hover:text-[#8B0202]"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      Add review
                    </Link>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-6" aria-label="Postcode pages">
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#8B0202] transition-opacity disabled:opacity-30"
                    disabled={currentPage === 1 || loading}
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    aria-label="Previous postcode page"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <span className="text-sm font-semibold text-[#1A2B3C]" aria-live="polite">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="rounded-full p-2 text-[#8B0202] transition-opacity disabled:opacity-30"
                    disabled={currentPage === totalPages || loading}
                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                    aria-label="Next postcode page"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default PostcodeSearchPage;

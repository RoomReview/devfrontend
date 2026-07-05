import { useState, useMemo } from "react";
import {
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { H1, H2, H3, Body } from "../components/common/Typography";
import BoroughCard from "../components/common/BoroughCard";
import { useBoroughs } from "../hooks/boroughs/useBoroughs";

// Figma Burgundy: #8B0202
// Figma Dark Blue: #1A2B3C
// Figma Warm Beige: #F3E6DE

const ITEMS_PER_PAGE = 12;

type SortOption = "name-asc" | "name-desc";

const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Alphabetical (A → Z)",
  "name-desc": "Alphabetical (Z → A)",
};

/** Skeleton placeholder while boroughs are loading */
const BoroughCardSkeleton = () => (
  <div className="w-full max-w-[392px] rounded-[20px] border border-[#dcd7d7] bg-white shadow-[1px_1px_24.9px_0px_#e9ebed] overflow-hidden flex flex-col animate-pulse">
    <div className="h-[200px] bg-gray-200" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-5/6" />
      <div className="mt-auto pt-3 border-t border-[#f0eded] flex gap-4">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-12" />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  // ── API data ─────────────────────────────────────────────────────────
  const { data: boroughs, isLoading, isError, refetch } = useBoroughs();

  // ── Local UI state ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [page, setPage] = useState(1);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // ── Client-side pipeline: filter → sort → paginate ───────────────────
  const filteredAndSorted = useMemo(() => {
    if (!boroughs) return [];

    let result = [...boroughs];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((b) =>
        b.name.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [boroughs, searchTerm, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedBoroughs = filteredAndSorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
    setPage(1);
  };

  // ── Pagination range (show up to 5 pages) ────────────────────────────
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="w-full relative overflow-hidden bg-white font-montserrat">
      {/* Hero Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] pt-12 lg:pt-[90px] pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="flex flex-col gap-6 max-w-[615px]">
            <H1 className="text-[#1A2B3C] leading-tight tracking-[-0.72px] text-4xl lg:text-[36px] font-bold">
              Find the best London borough <br className="hidden lg:block" />
              to live, rent, or invest
            </H1>

            <Body className="text-[#0b0b0b] text-[16px] leading-[1.4]">
              Explore London boroughs with verified data on housing, safety,
              transport, and local trends.
            </Body>

            <Body className="text-[#0b0b0b] text-[16px] leading-[1.4]">
              <span className="font-bold">RoomReview</span> combines official
              datasets with structured local insights to help you understand
              what is happening in every neighbourhood — from rent levels and
              transport access to crime patterns, planning activity,
              environmental risks, and local voting trends.
            </Body>

            <Body className="text-[#0b0b0b] text-[16px] leading-[1.4]">
              Search a borough for a high-level overview or dive deeper into a
              postcode to access detailed location intelligence and property
              insights.
            </Body>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Using direct hex for primary button to ensure visibility if theme variables fail */}
              <button className="bg-[#8B0202] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-[0.64px] flex items-center justify-center gap-2 hover:bg-[#691313] transition-colors">
                View Boroughs
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
              <button className="border-2 border-[#8B0202] text-[#8B0202] px-6 py-3 rounded-lg font-bold uppercase tracking-[0.64px] hover:bg-[#8B0202]/5 transition-colors">
                Search Postcode
              </button>
            </div>
          </div>

          <div className="relative h-full w-full rounded-[20px] shadow-[1px_1px_24.9px_0px_#e9ebed] overflow-hidden ml-auto lg:max-w-[506px]">
            <img
              src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1470&auto=format&fit=crop"
              alt="London aerial view"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] py-16">
        <H2 className="text-center text-[#0b0b0b] mb-16 tracking-[-0.48px] font-bold text-2xl">
          How it works
        </H2>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[22.5px] left-[150px] right-[150px] h-[1px] border-t border-dashed border-[#dcd7d7] z-0"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative z-10">
            {/* Steps */}
            {[
              {
                num: 1,
                title: "Browse London boroughs",
                desc: "Get a strategic overview and compare areas across London.",
              },
              {
                num: 2,
                title: "Compare key indicators",
                desc: "Check rent levels, affordability, crime, environmental risks, transport, and local voting trends to see how different areas perform.",
              },
              {
                num: 3,
                title: "Explore local intelligence",
                desc: "Discover planning policies, regeneration projects, infrastructure investments, and political dynamics shaping each borough.",
              },
              {
                num: 4,
                title: "Search a postcode",
                desc: "Look up any UK postcode to unlock detailed neighbourhood intelligence.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                <div className="w-[45px] h-[45px] rounded-full border border-[#dcd7d7] bg-white flex items-center justify-center text-[#8B0202] font-medium text-2xl mb-8 shadow-sm shrink-0 mx-auto lg:mx-0">
                  {step.num}
                </div>
                <div className="bg-white border border-[#dcd7d7] rounded-[20px] p-6 w-full h-full flex flex-col gap-3 min-h-[224px]">
                  <H3 className="text-[#1A2B3C] text-[24px] font-medium leading-tight">
                    {step.title}
                  </H3>
                  <Body className="text-[#0b0b0b] text-[16px] leading-[1.4]">
                    {step.desc}
                  </Body>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Boroughs Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] py-16">
        <H2 className="text-center text-[#0b0b0b] mb-12 tracking-[-0.72px] text-[36px] font-bold">
          Explore boroughs
        </H2>

        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 max-w-4xl mx-auto md:max-w-none">
          <div className="w-full md:w-auto md:flex-1 md:max-w-[612px] mx-auto">
            <div className="relative border border-[#dcd7d7] rounded-[10px] shadow-[1px_1px_24.9px_0px_#e9ebed] bg-white flex items-center px-6 py-3 hover:border-gray-300 transition-colors cursor-text">
              <Search className="w-6 h-6 text-[#1A2B3C] shrink-0 mr-3" />
              <input
                id="borough-search-input"
                type="text"
                placeholder="Search boroughs (e.g. Camden, Hackney)"
                className="w-full text-base text-[#1A2B3C] placeholder:text-[#b7adad] focus:outline-none bg-transparent"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="ml-2 text-[#b7adad] hover:text-[#1A2B3C] transition-colors"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="relative flex items-center gap-2 shrink-0">
            <button
              id="borough-sort-toggle"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity font-bold"
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 18H9V16H3V18ZM3 6V8H21V6H3ZM3 13H15V11H3V13Z"
                    fill="#1A2B3C"
                  />
                </svg>
              </div>
              <span className="text-[#0b0b0b] text-base">Sort by:</span>
              <span className="text-[#0b0b0b] text-base font-normal flex items-center gap-1">
                {SORT_LABELS[sortOption]}
                <ChevronDown
                  className={`w-4 h-4 text-[#0b0b0b] transition-transform ${isSortOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {/* Sort Dropdown */}
            {isSortOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-[#dcd7d7] rounded-lg shadow-lg z-20 min-w-[220px]">
                {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(
                  ([value, label]) => (
                    <button
                      key={value}
                      id={`sort-option-${value}`}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        sortOption === value
                          ? "text-[#8B0202] font-semibold"
                          : "text-[#0b0b0b]"
                      }`}
                      onClick={() => handleSortChange(value)}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 justify-items-center">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <BoroughCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <AlertCircle className="w-12 h-12 text-[#8B0202]" />
            <p className="text-[#0b0b0b] text-lg font-medium">
              Failed to load boroughs
            </p>
            <p className="text-[#6b6b6b] text-sm">
              Please check your connection and try again.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 bg-[#8B0202] text-white px-6 py-2 rounded-lg font-bold uppercase tracking-[0.64px] hover:bg-[#691313] transition-colors text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty Search State */}
        {!isLoading &&
          !isError &&
          boroughs &&
          filteredAndSorted.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Search className="w-10 h-10 text-[#b7adad]" />
              <p className="text-[#0b0b0b] text-lg font-medium">
                No boroughs found
              </p>
              <p className="text-[#6b6b6b] text-sm">
                Try a different search term.
              </p>
              <button
                onClick={() => handleSearchChange("")}
                className="mt-2 text-[#8B0202] font-semibold hover:underline text-sm"
              >
                Clear search
              </button>
            </div>
          )}

        {/* Borough Grid */}
        {!isLoading && !isError && paginatedBoroughs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 justify-items-center">
              {paginatedBoroughs.map((borough) => (
                <BoroughCard key={borough.boroughId} borough={borough} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-16 mt-8">
                <button
                  id="pagination-prev"
                  className="p-2 disabled:opacity-30 transition-opacity"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-6 h-6 text-[#8B0202]" />
                </button>
                <div className="flex items-center gap-8">
                  {pageNumbers.map((num) => (
                    <button
                      key={num}
                      id={`pagination-page-${num}`}
                      className={`font-bold text-2xl transition-colors ${
                        num === page
                          ? "text-[#8B0202]"
                          : "text-[#b7adad] hover:text-gray-500"
                      }`}
                      onClick={() => setPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <button
                  id="pagination-next"
                  className="p-2 disabled:opacity-30 transition-opacity"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-6 h-6 text-[#8B0202]" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Insights Section */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] py-16 mb-24">
        <div className="bg-[#F3E6DE] rounded-[20px] p-8 lg:p-16 flex flex-col items-start gap-8 max-w-[1250px] mx-auto lg:h-[476px] justify-center relative overflow-hidden">
          <div className="max-w-[612px] flex flex-col gap-6 relative z-10">
            <H2 className="text-[#0b0b0b] text-[36px] font-bold tracking-[-0.72px] leading-tight">
              Explore insights, guides and real tenant stories
            </H2>

            <div className="flex flex-col gap-4 text-[#0b0b0b] text-[16px] leading-[1.4]">
              <p>
                Go beyond the data and understand what living in London is
                really like.
              </p>
              <p>
                Read expert guides, neighbourhood breakdowns, rental tips, and
                real tenant experiences to make smarter decisions.
              </p>
              <p>
                From hidden red flags to local trends — our blog helps you see
                what property listings don't show.
              </p>
            </div>

            <button className="bg-[#8B0202] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-[0.64px] hover:bg-[#691313] transition-colors w-fit">
              Explore the blog
            </button>
          </div>

          <div className="hidden lg:block absolute right-[-50px] top-[-50px] opacity-10 pointer-events-none">
            <div className="w-[300px] h-[300px] rounded-full border-[40px] border-[#8B0202]"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

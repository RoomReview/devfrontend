import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { H1, H2, H3, Body } from "../components/common/Typography";
import BoroughCard from "../components/common/BoroughCard";
import { MOCK_BOROUGHS } from "../constant/boroughs";

// Figma Burgundy: #8B0202
// Figma Dark Blue: #1A2B3C
// Figma Warm Beige: #F3E6DE

const SORT_OPTIONS = [
  { key: "alphabetical", label: "Alphabetical (A → Z)" },
  { key: "popular", label: "Most popular" },
  { key: "zone", label: "Zone" },
  { key: "safest", label: "Safest" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const parseLeadingZone = (zones: string): number => {
  const match = zones.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const sortBoroughs = (list: typeof MOCK_BOROUGHS, key: SortKey) => {
  const sorted = [...list];
  switch (key) {
    case "alphabetical":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "popular":
      return sorted.sort(
        (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
      );
    case "zone":
      return sorted.sort(
        (a, b) => parseLeadingZone(a.zones) - parseLeadingZone(b.zones)
      );
    case "safest":
      return sorted.sort(
        (a, b) => parseFloat(a.trend) - parseFloat(b.trend)
      );
    default:
      return sorted;
  }
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("alphabetical");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleBoroughs = useMemo(() => {
    const filtered = MOCK_BOROUGHS.filter((borough) =>
      borough.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    return sortBoroughs(filtered, sortKey);
  }, [searchQuery, sortKey]);

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
                type="text"
                placeholder="Search boroughs (e.g. Camden, Hackney)"
                className="w-full text-base text-[#1A2B3C] placeholder:text-[#b7adad] focus:outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="relative flex items-center gap-2 shrink-0" ref={sortRef}>
            <button
              onClick={() => setSortOpen((open) => !open)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity font-bold"
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
                {SORT_OPTIONS.find((option) => option.key === sortKey)?.label}
                <ChevronDown
                  className={`w-4 h-4 text-[#0b0b0b] transition-transform ${
                    sortOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-[#dcd7d7] rounded-[10px] shadow-[1px_1px_12.45px_0px_#e9ebed] px-[10px] py-4 w-[201px] flex flex-col gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSortKey(option.key);
                      setSortOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left text-[#0b0b0b] text-base hover:text-[#8B0202] transition-colors"
                  >
                    <span className="flex-1">{option.label}</span>
                    {sortKey === option.key && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {visibleBoroughs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 justify-items-center">
            {visibleBoroughs.map((borough) => (
              <BoroughCard key={borough.id} {...borough} />
            ))}
          </div>
        ) : (
          <Body className="text-center text-[#b7adad] mb-16">
            No boroughs match "{searchQuery}".
          </Body>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-16 mt-8">
          <button
            className="p-2 disabled:opacity-30 transition-opacity"
            disabled
          >
            <ChevronLeft className="w-6 h-6 text-[#8B0202]" />
          </button>
          <div className="flex items-center gap-8">
            <button className="font-bold text-2xl text-[#8B0202]">1</button>
            <button className="font-bold text-2xl text-[#b7adad] hover:text-gray-500 transition-colors">
              2
            </button>
            <button className="font-bold text-2xl text-[#b7adad] hover:text-gray-500 transition-colors">
              3
            </button>
          </div>
          <button className="p-2 hover:opacity-80 transition-opacity">
            <ChevronRight className="w-6 h-6 text-[#8B0202]" />
          </button>
        </div>
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

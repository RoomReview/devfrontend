import {
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { H1, H2, H3, Body } from "../components/common/Typography";
import BoroughCard from "../components/common/BoroughCard";

// Figma Burgundy: #8B0202
// Figma Dark Blue: #1A2B3C
// Figma Warm Beige: #F3E6DE

const MOCK_BOROUGHS = [
  {
    id: "1",
    name: "Barking and Dagenham",
    zones: "Zones 4–5",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,450",
    trend: "2.1%",
    imageSrc:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Barnet",
    zones: "Zones 3–5",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,850",
    trend: "1.5%",
    imageSrc:
      "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Bexley",
    zones: "Zones 5–6",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,350",
    trend: "0.8%",
    imageSrc:
      "https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Brent",
    zones: "Zones 2–4",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,750",
    trend: "3.2%",
    imageSrc:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "Bromley",
    zones: "Zones 3–6",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,650",
    trend: "1.1%",
    imageSrc:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "6",
    name: "Camden",
    zones: "Zones 1–2",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£2,450",
    trend: "4.5%",
    imageSrc:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "7",
    name: "Croydon",
    zones: "Zones 4–6",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,550",
    trend: "1.9%",
    imageSrc:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "8",
    name: "Ealing",
    zones: "Zones 3–4",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,950",
    trend: "2.8%",
    imageSrc:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "9",
    name: "Hammersmith and Fulham",
    zones: "Zones 1–2",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£2,350",
    trend: "3.1%",
    imageSrc:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "10",
    name: "Haringey",
    zones: "Zones 2–3",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,850",
    trend: "2.4%",
    imageSrc:
      "https://images.unsplash.com/photo-1444464666168-49d633b867ad?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "11",
    name: "Harrow",
    zones: "Zones 4–5",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,650",
    trend: "1.2%",
    imageSrc:
      "https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "12",
    name: "Havering",
    zones: "Zones 6–7",
    rating: 4.9,
    reviewCount: 12,
    avgRent: "£1,450",
    trend: "0.9%",
    imageSrc:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop",
  },
];

const HomePage = () => {
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
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity font-bold">
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
                Alphabetical (A → Z)
                <ChevronDown className="w-4 h-4 text-[#0b0b0b]" />
              </span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 justify-items-center">
          {MOCK_BOROUGHS.map((borough) => (
            <BoroughCard key={borough.id} {...borough} />
          ))}
        </div>

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

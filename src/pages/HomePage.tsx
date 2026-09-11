import { useEffect, useState, type FC } from 'react';
import heroImage from '@img/homepage2.jpg';
import experienceImage from '@img/homepage3.jpg';
import firstImage from '@img/Tenant tips & Area highlights1.jpg';
import secondImage from '@img/Tenant tips & Area highlights2.jpg';
import thirdImage from '@img/Tenant tips & Area highlights3.jpg';
import { BarChart3, Bus, Home, Search, Shield, Star, ThumbsDown, ThumbsUp, TreePine, User, Users } from 'lucide-react';
import { boroughService } from '@/services/borough.service';
import type { BoroughApiResponse } from '@/types/borough.types';

export const LandingPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [boroughData, setBoroughData] = useState<BoroughApiResponse | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const boroughs = await boroughService.getAll();
        const selectedBorough = boroughs.find((borough) => borough.name.toLowerCase() === 'hackney') ?? boroughs[0];

        if (selectedBorough) {
          setBoroughData(await boroughService.getById(selectedBorough.boroughId));
        }
      } catch {
        setBoroughData(null);
      }
    };

    void loadDashboardData();
  }, []);

  const propertyValues = (boroughData?.propertyValueData ?? [])
    .map((item) => ({ label: item.label, value: Number(item.value) }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .slice(-6);
  const latestPropertyValue = propertyValues[propertyValues.length - 1]?.value;
  const averageRent = boroughData?.rentData?.find((item) => item.type.toLowerCase() === 'average')?.rent;
  const crimeRate = boroughData?.crimeData?.find((item) => item.label.toLowerCase().includes('total'))?.value;
  const totalDwellings = boroughData?.housingStockData?.find((item) => item.label === 'Total dwellings')?.value;
  const formatCurrency = (value: number | undefined) => value === undefined
    ? 'Unavailable'
    : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
  const formatNumber = (value: number | undefined) => value === undefined
    ? 'Unavailable'
    : new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(value);
  const chartMin = 450000;
  const chartMax = 600000;
  const chartPlotLeft = 42;
  const chartPlotRight = 500;
  const chartPlotTop = 10;
  const chartPlotBottom = 110;
  const chartTicks = [600000, 530000, 490000, 450000];
  const chartPath = propertyValues.length > 1
    ? propertyValues.map((item, index) => {
        const x = chartPlotLeft + (index / (propertyValues.length - 1)) * (chartPlotRight - chartPlotLeft);
        const boundedValue = Math.min(chartMax, Math.max(chartMin, item.value));
        const y = chartPlotBottom - ((boundedValue - chartMin) / (chartMax - chartMin)) * (chartPlotBottom - chartPlotTop);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ')
    : '';

  const reviews = [
    {
      location: 'SW9 – Brixton',
      rating: 4,
      text: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam. Justo nisi ut auctor faucibus velit. Pharetra ultrices volutpat cras sed turpis urna etiam iaculis a. Et morbi consequat tincidunt ultrices quis.',
      pros: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam.',
      cons: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam.',
      author: 'James Moris',
      time: '2 days ago',
      avatar: null,
    },
    {
      location: 'NW2 4FM – Camden',
      rating: 4,
      text: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam.',
      pros: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam.',
      cons: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam.',
      author: 'Anonymous',
      time: '2 months ago',
      avatar: null,
    },
    {
      location: 'SE22 0RS – Southwark',
      rating: 3,
      text: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam.',
      pros: 'Lorem ipsum dolor sit amet consectetur. In hac velit tellus lorem non nisl arcu sed aliquam.',
      cons: 'Lorem ipsum dolor sit amet consectetur.',
      author: 'Anastasia Kosheva',
      time: '14 February 2025',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  ];

  const blogs = [
    {
      date: 'Jun 9',
      tags: ['Recommendation', 'Tenants'],
      title: 'B2R vs. Traditional Private Landlords: Which is Better?',
      desc: 'The UK rental market is undergoing its biggest shake-up in a generation. Between skyrocketing monthly costs, a severe...',
      image: firstImage,
    },
    {
      date: 'May 22',
      tags: ['Recommendation', 'Tenants'],
      title: 'How RoomReview Is Helping UK Renters Make Smarter Choices',
      desc: 'Finding a place to rent in the UK can be one of the most stressful things you’ve ever...',
      image: secondImage,
    },
    {
      date: 'May 7',
      tags: ['Recommendation', 'Tenants'],
      title: 'Why EPC Ratings are the New "Must-Have" for UK Renters in 2026',
      desc: 'In the UK rental market of 2026, the way people choose their homes has shifted...',
      image: thirdImage,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#2B363B] antialiased">
      
      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-[1100px] px-6 py-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          
          {/* Hero Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1A202C] sm:text-5xl leading-[1.15]">
              Understand the area before you buy or invest
            </h1>
            <p className="text-sm text-[#5F6D7A] leading-relaxed max-w-[460px]">
              RoomReview brings together property data, local area insights and resident experiences to help you understand a postcode, borough or property before making an important decision.
            </p>
            
            {/* Search Box */}
            <div className="space-y-4 pt-2">
              <div className="relative max-w-[440px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search boroughs (e.g. Camden, Hackney)"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-xs shadow-sm transition focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000]"
                />
              </div>
              <button
                type="button"
                className="rounded-xl bg-[#8B0000] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#700000]"
              >
                Explore the Area
              </button>
            </div>
          </div>

          {/* Hero Right Visual Mockup */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-100 group">
            <img
              src={heroImage}
              alt="Property"
              className="h-[360px] w-full object-cover"
            />
            
            {/* Floating Card: RoomReview Score */}
            <div className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <span className="text-xl font-black text-[#8B0000]">78</span>
              <div className="text-[10px] leading-tight text-[#4A5568]">
                <strong className="block font-bold text-[#1A202C]">RoomReview Score</strong>
                <span>out of 100</span>
              </div>
            </div>

            {/* Floating Card: Avg Monthly Rent */}
            <div className="absolute right-6 top-6 rounded-2xl bg-white/95 px-4 py-2.5 text-right shadow-lg backdrop-blur-sm">
              <span className="block text-[9px] font-bold uppercase text-gray-400">Avg. Monthly Rent</span>
              <div className="text-xs font-bold text-[#1A202C]">
                £2,150 <span className="text-[10px] text-emerald-600 font-semibold">+3.2%</span>
              </div>
            </div>

            {/* Floating Card: Resident Rating */}
            <div className="absolute left-6 bottom-6 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
              <span className="block text-[9px] font-bold uppercase text-gray-400">Resident Rating</span>
              <div className="flex items-center gap-1 text-amber-400 text-xs">
                ★ ★ ★ ★ <span className="text-gray-300">★</span>
              </div>
            </div>

            {/* Floating Card: Transport Score */}
            <div className="absolute right-6 bottom-6 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
              <Bus className="h-4 w-4 text-[#8B0000]" />
              <div className="text-[10px] leading-none text-[#4A5568]">
                <span className="block text-[8px] uppercase text-gray-400">Transport Score</span>
                <strong className="text-xs font-bold text-[#1A202C]">91 <span className="text-[9px] font-normal text-gray-500">/ 100</span></strong>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHY ROOMREVIEW? */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A202C] sm:text-3xl">Why RoomReview?</h2>
          <p className="text-xs text-[#5F6D7A] max-w-[600px] leading-relaxed">
            Property decisions should not be based on price alone. RoomReview helps you explore the factors that can influence everyday life, property demand and long-term suitability.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-3 text-left hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF8FF] text-blue-600">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">Area Data</h3>
            <p className="text-[11px] text-[#718096] leading-relaxed">
              Explore property prices, rents, safety, transport, demographics, environmental risks and local development.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-3 text-left hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">Resident Reviews</h3>
            <p className="text-[11px] text-[#718096] leading-relaxed">
              Discover experiences shared by people who know the area and understand what living there can really be like.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-3 text-left hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-[#8B0000]">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">RoomReview Score</h3>
            <p className="text-[11px] text-[#718096] leading-relaxed">
              Compare locations through one clear score supported by a transparent breakdown of the underlying factors.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-3 text-left hover:shadow-md transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Home className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#1A202C] uppercase tracking-wider">Property Insights</h3>
            <p className="text-[11px] text-[#718096] leading-relaxed">
              Enter a property's details to access valuation insights and choose a report designed for buyers or investors.
            </p>
          </div>

        </div>
      </section>

      {/* 3. RESIDENT EXPERIENCES / REVIEWS */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 space-y-10">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A202C] sm:text-3xl max-w-[650px] leading-tight">
            Data tells you what is happening. Residents tell you what it feels like.
          </h2>
          <p className="text-xs text-[#5F6D7A] max-w-[600px] leading-relaxed">
            RoomReview complements official data with experiences shared by residents, helping users understand everyday factors that statistics cannot always explain.
          </p>
        </div>

        {/* Reviews Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((rev, i) => (
            <div key={i} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#8B0000]">{rev.location}</h3>
                <div className="flex text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, starI) => (
                    <span key={starI} className={starI < rev.rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
                  ))}
                </div>
                <p className="text-[11px] text-[#4A5568] leading-relaxed">{rev.text}</p>
                {i === 0 && (
                  <button className="text-[11px] font-semibold text-blue-600 hover:underline">Read more</button>
                )}

                {/* Pros & Cons */}
                <div className="space-y-2 pt-2 border-t border-gray-50 text-[11px]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <ThumbsUp className="h-3 w-3" />
                      <span>Pros</span>
                    </div>
                    <p className="text-[10px] text-[#718096] leading-tight">{rev.pros}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-rose-700">
                      <ThumbsDown className="h-3 w-3" />
                      <span>Cons</span>
                    </div>
                    <p className="text-[10px] text-[#718096] leading-tight">{rev.cons}</p>
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                {rev.avatar ? (
                  <img src={rev.avatar} alt={rev.author} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <div className="text-[11px] leading-tight">
                  <span className="block font-bold text-[#1A202C]">{rev.author}</span>
                  <span className="text-[10px] text-gray-400">{rev.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share Experience Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-white px-0 py-2">
          <div className="grid grid-cols-1 items-center gap-5 md:grid-cols-[190px_minmax(0,1fr)_190px]">
            
            <div className="h-36 overflow-hidden rounded-xl shadow-sm">
              <img
                src={experienceImage}
                alt="London House"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-bold leading-tight text-[#1A202C] sm:text-lg">
                Share your experience.<br />Help others, stay anonymous.
              </h3>
              <p className="max-w-[430px] text-[11px] leading-[1.35] text-[#5F6D7A]">
                Have you had a great (or terrible) renting experience in London? Share your story with RoomReview. We'll turn it into an anonymous social media Reel to spread awareness and protect other tenants from scams, hidden fees, and bad landlords.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button className="rounded-lg bg-[#8B0000] px-4 py-2 text-[11px] font-bold uppercase text-white shadow transition hover:bg-[#700000]">
                  Write a Review
                </button>
                <button className="rounded-lg border-2 border-[#1A2B3C] bg-white px-4 py-2 text-[11px] font-bold uppercase text-[#1A202C] transition hover:bg-gray-50">
                  Read Reviews
                </button>
              </div>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-col items-end justify-center gap-4 pr-2">
              <span className="inline-block -rotate-2 rounded-full bg-[#EAF5FC] px-4 py-2 text-[10px] font-medium text-[#2D3748] shadow-sm">
                very safe area
              </span>
              <span className="inline-block rotate-3 rounded-full bg-[#EAF5FC] px-4 py-2 text-[10px] font-medium text-[#2D3748] shadow-sm">
                good neighborhoods
              </span>
              <span className="inline-block -rotate-1 rounded-full bg-[#EAF5FC] px-4 py-2 text-[10px] font-medium text-[#2D3748] shadow-sm">
                convenient transport
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 4. LOCAL INSIGHTS & CHART DASHBOARD */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A202C] sm:text-3xl max-w-[500px]">
            Local insights supported by reliable data
          </h2>
          <p className="text-xs text-[#5F6D7A] max-w-[600px] leading-relaxed">
            RoomReview brings together relevant public and property datasets in one clear experience, helping users explore the information that matters for a specific area or property.
          </p>
        </div>

        {/* Dashboard Preview Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A202C]">{boroughData?.name ?? 'Area'} — Area Overview</h3>
              <p className="text-[10px] text-gray-400">Latest figures from the RoomReview database</p>
            </div>
            <div className="flex gap-2">
              <span className="rounded-lg bg-[#1A202C] px-3 py-1 text-[10px] font-semibold text-white">Prices</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer">Safety</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer">Transport</span>
              <span className="rounded-lg bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-600 hover:bg-gray-200 cursor-pointer">Development</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Chart Column */}
            <div className="lg:col-span-2 space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400">Property price trend</span>
              
              {/* SVG Line Chart Representation */}
              <div className="h-56 w-full pt-4">
                <svg className="h-full w-full overflow-visible" viewBox="0 0 530 150" role="img" aria-label="Average property price trend">
                  {chartTicks.map((tick) => {
                    const y = chartPlotBottom - ((tick - chartMin) / (chartMax - chartMin)) * (chartPlotBottom - chartPlotTop);

                    return (
                      <g key={tick}>
                        <text x="0" y={y + 3} fill="#94A3B8" fontSize="8">£{tick / 1000}k</text>
                        <line x1={chartPlotLeft} y1={y} x2={chartPlotRight} y2={y} stroke="#F1F5F9" strokeDasharray="2 3" />
                      </g>
                    );
                  })}
                  {chartPath && <path d={chartPath} fill="none" stroke="#8B0000" strokeWidth="3" />}
                </svg>
                <div className="ml-[8%] flex justify-between pt-2 text-[10px] text-gray-400">
                  {propertyValues.length > 0 ? propertyValues.map((item) => <span key={item.label}>{item.label}</span>) : <span>No property price data</span>}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-4">
              <div className="rounded-xl bg-gray-50 p-4 space-y-2">
                <span className="text-[9px] font-bold uppercase text-gray-400">Database snapshot</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Average rent</span><strong className="text-[#1A202C]">{formatCurrency(averageRent)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Latest property price</span><strong className="text-[#1A202C]">{formatCurrency(latestPropertyValue)}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total dwellings</span><strong className="text-[#1A202C]">{formatNumber(totalDwellings)}</strong></div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50/60 p-3 space-y-1 border border-emerald-100">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="block text-xs font-bold text-[#1A202C]">{crimeRate === undefined ? 'Unavailable' : crimeRate.toFixed(1)}</span>
                  <span className="block text-[9px] text-gray-500 leading-tight">Total crimes per 1,000</span>
                </div>

                <div className="rounded-xl bg-blue-50/60 p-3 space-y-1 border border-blue-100">
                  <Bus className="h-4 w-4 text-blue-600" />
                  <span className="block text-xs font-bold text-[#1A202C]">{formatCurrency(averageRent)}</span>
                  <span className="block text-[9px] text-gray-500 leading-tight">Average monthly rent</span>
                </div>

                <div className="rounded-xl bg-emerald-50/60 p-3 space-y-1 border border-emerald-100">
                  <TreePine className="h-4 w-4 text-emerald-600" />
                  <span className="block text-xs font-bold text-[#1A202C]">{formatCurrency(latestPropertyValue)}</span>
                  <span className="block text-[9px] text-gray-500 leading-tight">Latest property price</span>
                </div>

                <div className="rounded-xl bg-purple-50/60 p-3 space-y-1 border border-purple-100">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="block text-xs font-bold text-[#1A202C]">{formatNumber(totalDwellings)}</span>
                  <span className="block text-[9px] text-gray-500 leading-tight">Total dwellings</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button className="rounded-xl bg-[#8B0000] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#700000]">
            Explore Our Data
          </button>
          <p className="text-[10px] text-gray-400 max-w-[300px] leading-tight">
            Data availability, coverage and update frequency may vary by location and source.
          </p>
        </div>
      </section>

      {/* 5. HOW IT WORKS STEPS */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 text-center space-y-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#1A202C] sm:text-3xl">
          From postcode to a clearer decision
        </h2>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-[1px] border-t border-dashed border-gray-300 -z-0" />

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-[#FAF5F0] text-sm font-bold text-[#8B0000]">
              01
            </div>
            <h3 className="text-sm font-bold text-[#1A202C]">Search</h3>
            <p className="text-[11px] text-[#718096] max-w-[220px]">
              Enter a postcode, borough or property address.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-[#FAF5F0] text-sm font-bold text-[#8B0000]">
              02
            </div>
            <h3 className="text-sm font-bold text-[#1A202C]">Explore</h3>
            <p className="text-[11px] text-[#718096] max-w-[220px]">
              Review the RoomReview Score, area data, trends and resident experiences.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-[#FAF5F0] text-sm font-bold text-[#8B0000]">
              03
            </div>
            <h3 className="text-sm font-bold text-[#1A202C]">Decide</h3>
            <p className="text-[11px] text-[#718096] max-w-[220px]">
              Value a property or select a Buyer or Investor Report for deeper analysis.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="mx-auto max-w-[1100px] px-6 py-8">
        <div className="rounded-3xl border border-[#F3E8E2] bg-[#FAF5F0] p-12 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-[#1A202C]">
            Make your next property decision<br />with more context
          </h2>
          <p className="text-xs text-[#5F6D7A]">
            Search an area, explore the evidence and understand the property before you commit.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button className="rounded-xl bg-[#8B0000] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#700000]">
              Explore the Area
            </button>
            <button className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#1A202C] shadow-sm transition hover:bg-gray-50">
              Value a Property
            </button>
          </div>
        </div>
      </section>

      {/* 7. RECENT BLOGS SECTION */}
      <section className="mx-auto max-w-[1100px] px-6 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">Recent blogs</h2>
          <a href="#blogs" className="text-xs font-semibold text-blue-600 hover:underline">View all</a>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {blogs.map((blog, idx) => (
            <div key={idx} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="h-44 w-full overflow-hidden">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>{blog.date}</span>
                    <span>•</span>
                    {blog.tags.map((tag, tI) => (
                      <span key={tI} className="rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-[#1A202C] leading-snug group-hover:text-[#8B0000] transition">
                    {blog.title}
                  </h3>
                  <p className="text-[11px] text-[#718096] leading-relaxed line-clamp-3">
                    {blog.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

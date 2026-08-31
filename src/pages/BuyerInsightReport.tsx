import React from 'react';
import * as Recharts from 'recharts';

const {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} = Recharts as any;

import {
  Check,
  AlertTriangle,
  Printer,
  Home,
  BarChart2,
  Building2,
  Shield,
  GraduationCap,
  ClipboardList,
  Bus,
  Database,
  Folder,
  ExternalLink
} from 'lucide-react';
import {
  BuyerInsightReportProps,
  PostcodeRankingRow,
  DataSourceCard
} from './BuyerInsightReport.types';

const PIE_COLORS = ['#8B0000', '#1C2A39', '#D9C5B2', '#8A9EA7', '#2C3E50'];

const renderSourceIcon = (iconName: string) => {
  const props = { className: 'w-4 h-4 text-[#8B0000]' };
  switch (iconName) {
    case 'land-registry':
      return <Home {...props} />;
    case 'ons':
      return <BarChart2 {...props} />;
    case 'gla':
      return <Building2 {...props} />;
    case 'police':
      return <Shield {...props} />;
    case 'dfe':
      return <GraduationCap {...props} />;
    case 'ofsted':
      return <ClipboardList {...props} />;
    case 'tfl':
      return <Bus {...props} />;
    case 'gov':
      return <Database {...props} />;
    case 'datastore':
      return <Folder {...props} />;
    default:
      return <Database {...props} />;
  }
};

export const BuyerInsightReport: React.FC<BuyerInsightReportProps> = ({
  data,
  onPrintReport,
  onMethodologyClick,
  onSourceClick
}) => {
  const {
    meta,
    summaryOfFindings,
    executiveSummary,
    propertyContext,
    priceTrends,
    rentalContext,
    crimeAndSafety,
    communityProfile,
    transportAndConnectivity,
    localServices,
    planningAndAreaChange,
    scoreBreakdown,
    postcodeComparison,
    bottomLineText,
    dataSources,
    dataAndLicensing
  } = data;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full bg-white text-slate-800 font-sans leading-relaxed selection:bg-red-100 selection:text-red-900">
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            line-height: 1.4;
          }

          .print-report-container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in;
            line-height: 1.4;
          }

          .print-report-container > section {
            page-break-inside: avoid;
            margin-bottom: 1.2rem;
          }

          .print-card,
          .bg-white,
          .bg-\\[\\#FAF3EF\\],
          .bg-\\[\\#FAF8F5\\],
          .bg-sky-50\\/60,
          .rounded-2xl {
            page-break-inside: avoid;
          }

          .print-section-break {
            page-break-after: always;
          }

          header {
            page-break-inside: avoid;
            margin-bottom: 0.8rem;
          }

          h2 {
            page-break-after: avoid;
            margin-bottom: 0.6rem;
          }

          h3 {
            page-break-after: avoid;
            margin-bottom: 0.4rem;
          }

          p {
            line-height: 1.4;
            margin: 0.3rem 0;
          }

          table {
            page-break-inside: avoid;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          tr {
            page-break-inside: avoid;
          }

          .grid {
            page-break-inside: avoid;
          }

          .space-y-12 {
            --tw-space-y-reverse: 0;
            margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(1rem * var(--tw-space-y-reverse));
          }

          .space-y-6 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.6rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.6rem * var(--tw-space-y-reverse));
          }

          .space-y-4 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
          }

          .space-y-3 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.4rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.4rem * var(--tw-space-y-reverse));
          }

          .space-y-2 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.3rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.3rem * var(--tw-space-y-reverse));
          }

          gap-4, .gap-6 {
            gap: 0.8rem;
          }

          .p-5, .p-6 {
            padding: 0.8rem;
          }

          .rounded-2xl {
            border-radius: 0.5rem;
          }

          .print:hidden {
            display: none;
          }

          @page {
            size: A4;
            margin: 0.5in;
            orphans: 3;
            widows: 3;
          }
        }
      `}</style>
      <div className="print-report-container max-w-4xl mx-auto px-4 py-8 space-y-6">

        <header className="border-b border-slate-100 pb-8 relative">
          {onPrintReport && (
            <button
              onClick={onPrintReport}
              className="absolute top-0 right-0 p-2 text-slate-400 hover:text-[#8B0000] transition-colors print:hidden"
              title="Print Report"
            >
              <Printer className="w-5 h-5" />
            </button>
          )}

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#8B0000] border-b-2 border-[#8B0000] inline-block pb-1">
              RoomReview
            </h1>
            <h2 className="text-xl font-bold text-[#1C2A39] mt-3">{meta.reportTitle}</h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              {meta.postcode} &bull; {meta.areaName}
            </p>
          </div>

          <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-slate-100 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#8B0000"
                  strokeWidth="8"
                  strokeDasharray={`${(meta.overallScore / 100) * 251.2} 251.2`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-4xl font-extrabold text-[#1C2A39] leading-none">
                  {meta.overallScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                  RoomReview Score
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-4">
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Safety Score</span>
                <span className="text-lg font-bold text-[#1C2A39]">{meta.safetyScore}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Affordability Context</span>
                <span className="text-xs font-bold text-[#8B0000]">{meta.affordabilityTag}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 text-center shadow-sm">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Livability</span>
                <span className="text-lg font-bold text-[#1C2A39]">{meta.livabilityScore}</span>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 mt-4 italic">
              Generated: {meta.generatedDateText}
            </span>
          </div>
        </header>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Summary of Findings</h2>

          <div className="bg-gradient-to-b from-sky-50/80 to-sky-50/20 p-8 rounded-2xl border border-sky-100 text-center space-y-1">
            <h3 className="text-3xl font-extrabold text-[#8B0000] tracking-tight">
              {summaryOfFindings.overallAssessmentTitle}
            </h3>
            <p className="text-sm font-semibold text-[#1C2A39]">
              {summaryOfFindings.overallAssessmentSubtitle}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-xs text-slate-600 leading-relaxed">
            {summaryOfFindings.narrativeSummary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-100 space-y-4">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Strengths</h3>
              <ul className="space-y-3">
                {summaryOfFindings.strengths.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-[#8B0000] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#1C2A39] font-bold">{item.title}: </strong>
                      <span>{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-100 space-y-4">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Considerations</h3>
              <ul className="space-y-3">
                {summaryOfFindings.considerations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="text-[#8B0000] font-extrabold text-sm leading-none mt-0.5">!</span>
                    <div>
                      <strong className="text-[#1C2A39] font-bold">{item.title}: </strong>
                      <span>{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">May Appeal To</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summaryOfFindings.mayAppealTo.map((card, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-stone-200/60 shadow-sm space-y-1.5">
                  <h4 className="text-xs font-bold text-[#1C2A39]">{card.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Executive Summary</h2>
          
          <div className="bg-[#FAF3EF] p-5 rounded-2xl border-l-4 border-[#8B0000]">
            <h3 className="text-xs font-bold text-[#1C2A39] uppercase tracking-wider mb-1">May Suit Buyers Seeking</h3>
            <p className="text-xs text-slate-700 leading-relaxed">{executiveSummary.maySuitText}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Lifestyle Signals</h3>
              <ul className="space-y-2">
                {executiveSummary.lifestyleSignals.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check className="w-4 h-4 text-[#8B0000] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Key Considerations</h3>
              <ul className="space-y-2">
                {executiveSummary.keyConsiderations.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <AlertTriangle className="w-4 h-4 text-[#8B0000] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-100">
            <h3 className="text-xs font-bold text-[#1C2A39] mb-1">Overall Area Profile</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{executiveSummary.overallAreaProfileText}</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Property Context</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#FAF3EF] p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-3">Property Details</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Property Type</span>
                  <span className="font-bold text-[#1C2A39]">{propertyContext.details.propertyType}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Bedrooms</span>
                  <span className="font-bold text-[#1C2A39]">{propertyContext.details.bedrooms}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Bathrooms</span>
                  <span className="font-bold text-[#1C2A39]">{propertyContext.details.bathrooms}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">Floor Area</span>
                  <span className="font-bold text-[#1C2A39]">{propertyContext.details.floorAreaSqFt.toLocaleString()} sq ft</span>
                </div>
                <div className="flex justify-between border-b border-stone-200/60 pb-1.5">
                  <span className="text-slate-500">EPC Rating</span>
                  <span className="font-bold text-[#1C2A39]">{propertyContext.details.epcRating}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-500">Council Tax Band</span>
                  <span className="font-bold text-[#1C2A39]">{propertyContext.details.councilTaxBand}</span>
                </div>
              </div>
            </div>

            <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-2">Indicative Market Range</h3>
                <div className="text-2xl font-extrabold text-[#8B0000] mb-3">
                  {formatCurrency(propertyContext.marketRange.indicativePrice)}
                </div>
                <div className="space-y-1 text-xs border-t border-sky-100 pt-2 mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Lower Range</span>
                    <span className="font-semibold">{formatCurrency(propertyContext.marketRange.lowerRange)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Upper Range</span>
                    <span className="font-semibold">{formatCurrency(propertyContext.marketRange.upperRange)}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-tight">
                {propertyContext.marketRange.disclaimer}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-4">Comparable Local Sales</h3>
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="pb-2">Address</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Beds</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {propertyContext.comparableSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="py-2.5 font-medium text-[#1C2A39]">{sale.address}</td>
                    <td className="py-2.5 text-slate-500">{sale.type}</td>
                    <td className="py-2.5 text-slate-500">{sale.beds}</td>
                    <td className="py-2.5 font-bold text-[#1C2A39]">{formatCurrency(sale.price)}</td>
                    <td className="py-2.5 text-right text-slate-400">{sale.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Price Trends & Market Context</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">5-Year Growth</span>
              <span className="text-lg font-extrabold text-[#1C2A39]">
                {priceTrends.fiveYearGrowthPercent > 0 ? '+' : ''}{priceTrends.fiveYearGrowthPercent}%
              </span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Annual Growth</span>
              <span className="text-lg font-extrabold text-[#1C2A39]">
                {priceTrends.annualGrowthPercent > 0 ? '+' : ''}{priceTrends.annualGrowthPercent}%
              </span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">vs Borough Avg</span>
              <span className="text-lg font-extrabold text-[#1C2A39]">
                {priceTrends.vsBoroughAvgPercent > 0 ? '+' : ''}{priceTrends.vsBoroughAvgPercent}%
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-4">5-Year Price History (£000s)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceTrends.priceHistory}>
                  <XAxis dataKey="year" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value: number | string | Array<number | string>) => [`£${value}k`, 'Price']} />
                  <Line type="monotone" dataKey="priceThousands" stroke="#8B0000" strokeWidth={2.5} dot={{ fill: '#8B0000' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Market Analysis</h3>
            {priceTrends.marketAnalysisParagraphs.map((p, idx) => (
              <p key={idx} className="text-xs text-slate-700 leading-relaxed">{p}</p>
            ))}
            <div className="bg-white p-3 rounded-xl text-[10px] text-slate-400 border border-stone-200/50 italic">
              {priceTrends.disclaimerText}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Market Activity & Rental Context</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Average Rent (pcm)</span>
              <span className="text-lg font-extrabold text-[#8B0000]">{formatCurrency(rentalContext.avgRentPcm)}</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Demand Level</span>
              <span className="text-lg font-extrabold text-[#8B0000]">{rentalContext.demandLevel}</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avg. Time to Let</span>
              <span className="text-lg font-extrabold text-[#8B0000]">{rentalContext.avgTimeToLetDays} days</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Gross Rental Yield</span>
              <span className="text-2xl font-extrabold text-[#8B0000]">{rentalContext.grossRentalYieldPercent}%</span>
              <p className="text-[10px] text-slate-400 mt-1">{rentalContext.grossYieldSubtitle}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Borough Average Yield</span>
              <span className="text-2xl font-extrabold text-[#1C2A39]">{rentalContext.boroughAvgYieldPercent}%</span>
              <p className="text-[10px] text-slate-400 mt-1">{rentalContext.boroughYieldSubtitle}</p>
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-3">Tenant Profile</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {rentalContext.tenantProfile.map((tp, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{tp.category}</span>
                    <span className="font-bold">{tp.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-3">Market Conditions</h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {rentalContext.marketConditions.map((mc, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#8B0000]" />
                    <span>{mc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-sky-50/60 p-4 rounded-xl text-xs text-slate-500 leading-relaxed space-y-2 border border-sky-100">
            {rentalContext.contextParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
            <p className="text-[10px] italic text-slate-400 border-t border-sky-100 pt-2">{rentalContext.disclaimerText}</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Crime & Safety</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Safety Score</span>
              <span className="text-xl font-extrabold text-[#8B0000]">
                {crimeAndSafety.safetyScore}{typeof crimeAndSafety.safetyScore === 'number' ? '/100' : ''}
              </span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Crime Rate Trend</span>
              <span className="text-xl font-extrabold text-[#8B0000]">
                {crimeAndSafety.crimeRateTrendPercent}%
              </span>
              <span className="text-[9px] text-slate-400 block">Year-on-Year</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">vs Borough</span>
              <span className="text-xl font-extrabold text-[#8B0000]">
                {crimeAndSafety.vsBoroughPercent}%
              </span>
              <span className="text-[9px] text-slate-400 block">Lower</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-4">
              Crime Categories (per 1,000 residents)
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crimeAndSafety.crimeCategories}>
                  <XAxis dataKey="category" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#D9E2EC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-3">Key Highlights</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {crimeAndSafety.keyHighlights.map((kh, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#8B0000] shrink-0 mt-0.5" />
                    <span>{kh}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-3">Nearby Postcode Comparison</h3>
              <div className="space-y-1.5 text-xs">
                {crimeAndSafety.nearbyPostcodeComparisons.map((item, idx) => (
                  <div key={idx} className="flex justify-between bg-white px-3 py-1.5 rounded-lg border border-stone-200/60">
                    <span className="font-semibold text-slate-700">{item.postcode}</span>
                    <span className="font-bold text-[#8B0000]">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic text-center">
            Source: {crimeAndSafety.sourceAttribution}
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Community Profile</h2>

          <div className="bg-sky-50/60 p-4 rounded-xl text-xs text-slate-600 border border-sky-100">
            {communityProfile.disclaimerNotice}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Population Density</span>
              <span className="text-lg font-extrabold text-[#8B0000]">{communityProfile.populationDensityPerKm2.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400 block">per km²</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Employment Rate</span>
              <span className="text-lg font-extrabold text-[#8B0000]">{communityProfile.employmentRatePercent}%</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Median Age</span>
              <span className="text-lg font-extrabold text-[#8B0000]">{communityProfile.medianAge}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-2 text-center">Age Distribution</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={communityProfile.ageDistribution} dataKey="percentage" nameKey="name" cx="50%" cy="50%" outerRadius={55}>
                      {communityProfile.ageDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-2 text-center">Household Composition</h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={communityProfile.householdComposition} dataKey="percentage" nameKey="name" cx="50%" cy="50%" outerRadius={55}>
                      {communityProfile.householdComposition.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-3">Employment Sectors</h3>
              <ul className="space-y-1.5 text-slate-700">
                {communityProfile.employmentSectors.map((es, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{es.sector}</span>
                    <span className="font-bold">{es.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-3">Education Levels</h3>
              <ul className="space-y-1.5 text-slate-700">
                {communityProfile.educationLevels.map((el, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{el.level}</span>
                    <span className="font-bold">{el.percent}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic text-center">
            Source: {communityProfile.sourceAttribution}
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Transport & Connectivity</h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Connectivity Score</span>
              <span className="text-xl font-extrabold text-[#8B0000]">{transportAndConnectivity.connectivityScore}/100</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Nearest Station</span>
              <span className="text-xl font-extrabold text-[#8B0000]">{transportAndConnectivity.nearestStationMi} mi</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Zone</span>
              <span className="text-xl font-extrabold text-[#8B0000]">{transportAndConnectivity.zone}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Nearby Stations</h3>
            <div className="space-y-2">
              {transportAndConnectivity.nearbyStations.map((st, idx) => (
                <div key={idx} className="bg-[#FAF3EF] p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#1C2A39] block">{st.name}</span>
                    <div className="flex gap-1.5 mt-1">
                      {st.lines.map((line, lIdx) => (
                        <span key={lIdx} className="bg-[#8B0000] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {line}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#8B0000] block">{st.distanceMi} miles</span>
                    <span className="text-[10px] text-slate-400">{st.walkTimeMins} min walk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-3">Travel Times to Key Destinations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {transportAndConnectivity.travelTimes.map((tt, idx) => (
                <div key={idx} className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">{tt.destination}</span>
                  <span className="text-sm font-extrabold text-[#8B0000]">{tt.durationMins} minutes</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-2">Bus Routes</h3>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {transportAndConnectivity.busRoutesInfo.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-2">Cycling & Roads</h3>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                {transportAndConnectivity.cyclingAndRoadsInfo.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic text-center">
            Source: {transportAndConnectivity.sourceAttribution}
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Local Services & Amenities</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Schools</h3>
              <div className="space-y-2">
                {localServices.schools.map((sc, idx) => (
                  <div key={idx} className="bg-[#FAF3EF] p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#1C2A39] block">{sc.name}</span>
                      <span className="text-[10px] text-slate-500">{sc.type} &bull; {sc.distanceMi} miles</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                      sc.rating === 'Outstanding' ? 'bg-[#8B0000]' : 'bg-slate-600'
                    }`}>
                      {sc.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Parks & Recreation</h3>
              <div className="space-y-2">
                {localServices.parks.map((pk, idx) => (
                  <div key={idx} className="bg-sky-50/60 p-3 rounded-xl border border-sky-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C2A39]">{pk.name}</span>
                    <span className="text-[10px] text-slate-500">{pk.acres} acres &bull; {pk.distanceMi} miles</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-3">Shopping & Dining</h3>
              {localServices.shoppingAndDining.map((sd, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-600">{sd.label}</span>
                  <span className="font-bold text-[#1C2A39]">{sd.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-3">Healthcare & Leisure</h3>
              {localServices.healthcareAndLeisure.map((hl, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="text-slate-600">{hl.label}</span>
                  <span className="font-bold text-[#1C2A39]">{hl.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl space-y-2 text-xs text-slate-700 leading-relaxed">
            <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-1">Amenity Overview</h3>
            {localServices.amenityOverviewParagraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Planning & Area Change</h2>

          <div className="bg-sky-50/60 p-4 rounded-xl text-xs text-slate-600 border border-sky-100">
            {planningAndAreaChange.disclaimerNotice}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Planning Applications</span>
              <span className="text-xl font-extrabold text-[#8B0000]">{planningAndAreaChange.planningApplicationsLast12Months}</span>
              <span className="text-[9px] text-slate-400 block">Last 12 months (1km)</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Approval Rate</span>
              <span className="text-xl font-extrabold text-[#8B0000]">{planningAndAreaChange.approvalRatePercent}%</span>
            </div>
            <div className="bg-sky-50/60 p-4 rounded-2xl text-center border border-sky-100">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Development Density</span>
              <span className="text-xl font-extrabold text-[#8B0000]">{planningAndAreaChange.developmentDensity}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Housing Growth Overview</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{planningAndAreaChange.housingGrowth.overviewText}</p>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">New Housing Target (Borough)</span>
                <span className="text-sm font-extrabold text-[#8B0000]">{planningAndAreaChange.housingGrowth.boroughTargetText}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Protection Status</span>
                <span className="text-sm font-extrabold text-[#8B0000]">{planningAndAreaChange.housingGrowth.protectionStatusText}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-2">Regeneration Overview</h3>
              <ul className="space-y-1.5 text-slate-700">
                {planningAndAreaChange.regenerationOverview.map((item, idx) => (
                  <li key={idx}>
                    <strong className="text-[#1C2A39]">{item.title}: </strong>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[#8B0000] uppercase tracking-wider mb-2">Transport Improvements</h3>
              <ul className="space-y-1.5 text-slate-700">
                {planningAndAreaChange.transportImprovements.map((item, idx) => (
                  <li key={idx}>
                    <strong className="text-[#1C2A39]">{item.title}: </strong>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-sky-50/60 p-4 rounded-xl text-xs text-slate-600 border border-sky-100">
            <strong className="text-[#1C2A39] block mb-1">Context for Buyers</strong>
            {planningAndAreaChange.contextForBuyersText}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">RoomReview Score Breakdown</h2>

          <div className="bg-[#FAF3EF] p-6 rounded-2xl text-center space-y-2">
            <span className="text-4xl font-extrabold text-[#8B0000] block">{scoreBreakdown.overallScore}</span>
            <span className="text-xs font-bold text-[#1C2A39] uppercase tracking-wider block">Overall RoomReview Score</span>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              The RoomReview Score is a weighted comparative model intended to support postcode and area comparison for buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-2">Category Radar</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={scoreBreakdown.radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" stroke="#64748B" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={8} />
                    <Radar name="Score" dataKey="score" stroke="#8B0000" fill="#8B0000" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-2">Category Scores</h3>
              <div className="space-y-2.5 text-xs">
                {scoreBreakdown.categoryScores.map((cs, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{cs.category}</span>
                      <span className="text-[#8B0000] font-bold">{cs.score}/100</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B0000] rounded-full" style={{ width: `${cs.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">Weighting Explanation</h3>
            <p className="text-xs text-slate-500">
              The RoomReview Score (0–100) is a weighted comparative model intended to support postcode and area comparison for buyers:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {scoreBreakdown.weightings.map((w, idx) => (
                <div key={idx} className="bg-[#FAF3EF] p-2.5 rounded-xl flex justify-between items-center">
                  <span className="text-slate-700 font-medium">{w.category}</span>
                  <span className="font-bold text-[#8B0000]">{w.weightPercent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 space-y-2 text-xs text-slate-600">
            <h3 className="font-bold text-[#1C2A39] uppercase tracking-wider text-[10px]">Methodology Notes</h3>
            <ul className="space-y-1 list-disc list-inside text-[11px]">
              {scoreBreakdown.methodologyNotes.map((mn, idx) => (
                <li key={idx}>{mn}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-[#8B0000] border-b border-slate-100 pb-2">Postcode Comparison</h2>

          <div className="bg-sky-50/60 p-4 rounded-xl text-xs text-slate-600 border border-sky-100">
            {postcodeComparison.disclaimerNotice}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-4">
              RoomReview Score Comparison
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postcodeComparison.chartScores}>
                  <XAxis dataKey="postcode" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8B0000" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider mb-4">Ranking Table</h3>
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Postcode</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Distance (mi)</th>
                  <th className="pb-2 text-right">vs {meta.postcode}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {postcodeComparison.rankingTable.map((row: PostcodeRankingRow) => (
                  <tr
                    key={row.postcode}
                    className={row.isTargetProperty ? 'bg-sky-50/70 font-bold' : ''}
                  >
                    <td className="py-2.5 text-slate-500">{row.rank}</td>
                    <td className="py-2.5 text-[#1C2A39]">
                      {row.postcode} {row.isTargetProperty && '(This Property)'}
                    </td>
                    <td className="py-2.5 font-bold text-[#8B0000]">{row.score}</td>
                    <td className="py-2.5 text-slate-500">{row.distanceMi}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-600">{row.vsTargetScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#FAF3EF] p-5 rounded-2xl space-y-3 text-xs">
            <h3 className="font-bold text-[#8B0000] uppercase tracking-wider">Analysis</h3>
            <p className="text-slate-700 leading-relaxed">{postcodeComparison.analysisPositionText}</p>
            <div className="border-t border-stone-200/60 pt-2 space-y-1">
              <strong className="text-[#1C2A39] block">Key Observations</strong>
              <ul className="space-y-1 text-slate-600 list-disc list-inside">
                {postcodeComparison.keyObservations.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-[#8B0000] text-white p-6 rounded-2xl space-y-2 shadow-md">
            <h2 className="text-lg font-bold tracking-tight">Bottom Line</h2>
            <p className="text-xs text-red-100 leading-relaxed">
              {bottomLineText}
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-[#8B0000] tracking-tight border-b border-slate-100 pb-2">
            Data Sources
          </h2>

          <div className="bg-[#EBF3FA] p-5 rounded-2xl space-y-2 border border-sky-100 text-xs text-slate-700 leading-relaxed">
            <p>{dataSources.introText}</p>
            <p className="text-slate-500">{dataSources.disclaimerText}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dataSources.sources.map((src: DataSourceCard) => (
              <div
                key={src.id}
                className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200/70 flex flex-col justify-between space-y-3 shadow-sm hover:border-[#8B0000]/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                    {renderSourceIcon(src.iconName)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1C2A39]">{src.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{src.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSourceClick && onSourceClick(src.id)}
                  className="text-[11px] font-bold text-[#8B0000] flex items-center gap-1 hover:underline pt-1 text-left"
                >
                  <span>View official source</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="bg-[#FAF3EF] p-6 rounded-2xl border-l-4 border-[#8B0000] space-y-3 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-xs font-bold text-[#8B0000] uppercase tracking-wider">
              Data and licensing
            </h3>

            <p>{dataAndLicensing.introText}</p>

            <p>
              Where applicable, this report contains public-sector information licensed under the{' '}
              <strong className="text-[#1C2A39] font-bold">
                {dataAndLicensing.openGovernmentLicenceText}
              </strong>.
            </p>

            {dataAndLicensing.providerLicencesText && (
              <p>{dataAndLicensing.providerLicencesText}</p>
            )}

            <p>{dataAndLicensing.trademarksText}</p>

            <p>{dataAndLicensing.endorsementText}</p>

            <p>{dataAndLicensing.accuracyText}</p>

            <div className="border-t border-stone-200/80 pt-3">
              <button
                type="button"
                onClick={onMethodologyClick}
                className="text-xs font-bold text-[#8B0000] hover:underline flex items-center gap-1"
              >
                <span>{dataAndLicensing.methodologyLinkText || "Read RoomReview's Data Sources and Methodology"}</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="pt-6 border-t border-slate-100 text-center space-y-1">
          <h3 className="text-2xl font-black text-[#8B0000] tracking-tight">RoomReview</h3>
          <p className="text-xs font-semibold text-slate-400">Data-Driven Property Intelligence</p>
          <p className="text-[10px] text-slate-400 pt-1">
            Report Generated: {meta.generatedDateText} {meta.versionText ? `| Version ${meta.versionText}` : ''}
          </p>
        </footer>

      </div>
    </div>
  );
};

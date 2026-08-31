import React from 'react';
import { Train, CheckCircle2, Printer } from 'lucide-react';

export interface FullInvestorReportData {
  reportDate: string;
  pageCount: number;
  overallScore: number;
  maxScore: number;
  property: {
    address: string;
    postcode: string;
    borough: string;
    type: string;
    bedrooms: number;
    sizeSqFt: number;
    tenure: string;
    modelledEstimate: number;
    areaMedian: number;
    boroughMedian: number;
  };
  metrics: {
    modelledYield: number;
    fiveYearGrowth: number;
    demandLevel: string;
    avgDaysToLet: number;
    scenarioRange: string;
    relativeRisk: string;
  };
  keyDrivers: Array<{ title: string; desc: string }>;
  comparables: Array<{ address: string; type: string; pricePaid: number; date: string }>;
  priceHistory: {
    tenYearGrowth: number;
    cagr: number;
    vsBorough: number;
    priceStability: number;
    points: Array<{ year: number; price: number }>;
    insights: string[];
  };
  rentalAnalysis: {
    grossYield: number;
    monthlyRent: number;
    annualIncome: number;
    timeToLetDays: number;
    occupancyRate: number;
    fiveYearRentGrowth: number;
    tenantProfile: Array<{ category: string; percentage: number }>;
    competitivePosition: string[];
  };
  developmentPipeline: {
    applications1km: number;
    approvalRate: number;
    newUnitsPipeline: number;
    projects: Array<{ name: string; units: number; status: string; distance: string }>;
  };
  strategicPlanning: {
    housingTarget10Yr: number;
    housingStockIncreasePct: number;
    commercialTargets: Array<{ title: string; desc: string }>;
  };
  regenerationZones: Array<{ title: string; desc: string }>;
  transport: {
    connectivityScore: number;
    features: string[];
    stations: Array<{ name: string; lines: string; walkTime: number; destination: string }>;
  };
  demographics: {
    popGrowth10Yr: number;
    medianAge: number;
    universityEducatedPct: number;
    ageDistribution: Array<{ range: string; percentage: number }>;
    employmentSectors: Array<{ sector: string; percentage: number }>;
    economicIndicators: Array<{ label: string; value: string }>;
  };
  governance: {
    boroughControl: string;
    controlSinceYear: number;
    seatsRatio: string;
    policyStability: string;
  };
  scoreBreakdown: Array<{ category: string; weight: number; score: number }>;
  postcodeRanks: Array<{ rank: number; postcode: string; score: number; isCurrent?: boolean }>;
}

export const CompleteInvestorReport: React.FC<{
  data: FullInvestorReportData;
  onPrintReport?: () => void;
}> = ({ data, onPrintReport }) => {
  const fmt = (v: number) => v > 0
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(v)
    : 'No data available';
  const pct = (v: number, prefix = '') => v > 0 ? `${prefix}${v}%` : 'No data available';
  const num = (v: number, suffix = '') => Number.isFinite(v) && v > 0 ? `${v}${suffix}` : 'No data available';

  return (
    <>
      <style>{`
        @media print {
          .investor-report-shell > .print-hidden {
            display: none !important;
          }

          .investor-report-shell {
            max-width: none !important;
            border: 0 !important;
          }

          @page {
            size: A4;
            margin: 0.5in;
          }
        }
      `}</style>
      <div className="investor-report-shell w-full max-w-[1000px] mx-auto bg-white font-sans text-slate-800 antialiased border border-slate-200">
      
      {/* 01. HERO / HEADER */}
      <header className="relative bg-[#8B0000] text-white p-8">
        {onPrintReport && (
          <button
            type="button"
            onClick={onPrintReport}
            className="print-hidden absolute right-8 top-8 rounded p-2 text-rose-100 transition-colors hover:bg-white/10 hover:text-white"
            title="Print or save as PDF"
            aria-label="Print or save investor report as PDF"
          >
            <Printer className="h-5 w-5" />
          </button>
        )}
        <div className="flex justify-between text-xs uppercase text-rose-200 mb-4">
          <span>{data.reportDate}</span>
          <span>RoomReview Investment Score</span>
        </div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-extrabold">{data.property.address}</h1>
            <p className="text-rose-100 text-base">London, {data.property.postcode} - {data.property.borough}</p>
          </div>
          <div className="text-right">
            <span className="text-6xl font-black">{data.overallScore}</span>
            <span className="text-xl text-rose-200">/{data.maxScore}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-rose-800">
          <div className="bg-rose-950/40 p-3 rounded">
            <span className="text-xs uppercase text-rose-200 block">Modelled Yield</span>
            <span className="text-2xl font-bold">{pct(data.metrics.modelledYield)}</span>
          </div>
          <div className="bg-rose-950/40 p-3 rounded">
            <span className="text-xs uppercase text-rose-200 block">5-Year Historical Growth</span>
            <span className="text-2xl font-bold">{pct(data.metrics.fiveYearGrowth, '+')}</span>
          </div>
          <div className="bg-rose-950/40 p-3 rounded">
            <span className="text-xs uppercase text-rose-200 block">Demand Level</span>
            <span className="text-2xl font-bold">{data.metrics.demandLevel}</span>
          </div>
        </div>
      </header>

      {/* 01. EXECUTIVE SUMMARY */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">01 • Executive Summary</span>
        <h2 className="text-2xl font-extrabold mb-6">Investment Overview</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-orange-50/50 rounded border border-orange-100">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Illustrative 5-Year Scenario Range</span>
            <span className="text-3xl font-black text-rose-900">{data.metrics.scenarioRange}</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-700 uppercase block">Relative Risk Context</span>
            <span className="text-2xl font-bold text-emerald-800">{data.metrics.relativeRisk}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {data.keyDrivers.map((driver, i) => (
            <div key={i} className="flex gap-3 p-3 border rounded items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">{driver.title}</h4>
                <p className="text-xs text-slate-500">{driver.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 02. PROPERTY & MARKET CONTEXT */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">02 • Property & Market Context</span>
        <h2 className="text-2xl font-extrabold mb-6">Market Positioning</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 border rounded"><span className="text-xs text-slate-400 block">Type</span><span className="font-bold">{data.property.type}</span></div>
          <div className="p-3 border rounded"><span className="text-xs text-slate-400 block">Bedrooms</span><span className="font-bold">{num(data.property.bedrooms, ' Bed')}</span></div>
          <div className="p-3 border rounded"><span className="text-xs text-slate-400 block">Size</span><span className="font-bold">{num(data.property.sizeSqFt, ' sq ft')}</span></div>
          <div className="p-3 border rounded"><span className="text-xs text-slate-400 block">Tenure</span><span className="font-bold">{data.property.tenure}</span></div>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4 bg-orange-50/60 rounded border border-orange-200">
          <div className="p-4 bg-[#8B0000] text-white rounded"><span className="text-xs block">Modelled Estimate</span><span className="text-xl font-bold">{fmt(data.property.modelledEstimate)}</span></div>
          <div className="p-4 bg-sky-50 rounded border border-sky-100"><span className="text-xs text-sky-700 block">Area Median</span><span className="text-xl font-bold">{fmt(data.property.areaMedian)}</span></div>
          <div className="p-4 bg-sky-50 rounded border border-sky-100"><span className="text-xs text-sky-700 block">Borough Median</span><span className="text-xl font-bold">{fmt(data.property.boroughMedian)}</span></div>
        </div>
      </section>

      {/* 03. PRICE TRENDS */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">03 • Price Trends</span>
        <h2 className="text-2xl font-extrabold mb-6">Historical Performance Analysis</h2>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-sky-50 rounded"><span className="text-xs block text-slate-500">10-Yr Growth</span><span className="text-2xl font-bold text-rose-800">{pct(data.priceHistory.tenYearGrowth, '+')}</span></div>
          <div className="p-3 bg-sky-50 rounded"><span className="text-xs block text-slate-500">Historical CAGR</span><span className="text-2xl font-bold text-rose-800">{pct(data.priceHistory.cagr)}</span></div>
          <div className="p-3 bg-sky-50 rounded"><span className="text-xs block text-slate-500">VS Borough</span><span className="text-2xl font-bold text-emerald-700">{pct(data.priceHistory.vsBorough, '+')}</span></div>
          <div className="p-3 bg-sky-50 rounded"><span className="text-xs block text-slate-500">Stability Score</span><span className="text-2xl font-bold">{num(data.priceHistory.priceStability)}</span></div>
        </div>
      </section>

      {/* 04. RENTAL ANALYSIS */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">04 • Rental Analysis</span>
        <h2 className="text-2xl font-extrabold mb-6">Yield & Demand Fundamentals</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-6 border-2 border-[#8B0000] rounded bg-orange-50/20 col-span-1">
            <span className="text-xs uppercase font-bold text-slate-500">Gross Rental Yield</span>
            <span className="text-5xl font-black text-[#8B0000] block my-2">{pct(data.rentalAnalysis.grossYield)}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 col-span-2">
            <div className="p-4 bg-sky-50 rounded"><span className="text-xs text-slate-500 block">Monthly Rent</span><span className="text-xl font-bold">{fmt(data.rentalAnalysis.monthlyRent)}</span></div>
            <div className="p-4 bg-sky-50 rounded"><span className="text-xs text-slate-500 block">Annual Income</span><span className="text-xl font-bold">{fmt(data.rentalAnalysis.annualIncome)}</span></div>
          </div>
        </div>
      </section>

      {/* 05. DEVELOPMENT PIPELINE */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">05 • Development Pipeline</span>
        <h2 className="text-2xl font-extrabold mb-6">Planning & Regeneration Activity</h2>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-orange-50 text-slate-600 border-b">
              <th className="p-3">Project</th>
              <th className="p-3">Units</th>
              <th className="p-3">Status</th>
              <th className="p-3">Distance</th>
            </tr>
          </thead>
          <tbody>
            {data.developmentPipeline.projects.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 font-bold text-rose-800">{p.units}</td>
                <td className="p-3"><span className="px-2 py-1 text-xs rounded bg-slate-100">{p.status}</span></td>
                <td className="p-3 text-slate-500">{p.distance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 06. LOCAL PLAN ANALYSIS */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">06 • Local Plan Analysis</span>
        <h2 className="text-2xl font-extrabold mb-6">Strategic Planning Context</h2>
        <div className="p-6 bg-orange-50/50 border border-orange-200 rounded mb-6">
          <span className="text-xs font-bold uppercase block text-slate-500">Housing Growth Targets (2024–2034)</span>
          <span className="text-4xl font-black text-rose-900 block my-2">{num(data.strategicPlanning.housingTarget10Yr, ' units')}</span>
          <span className="text-sm font-semibold text-slate-700">{pct(data.strategicPlanning.housingStockIncreasePct)} increase in borough housing stock</span>
        </div>
      </section>

      {/* 07. TRANSPORT & INFRASTRUCTURE */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">07 • Transport & Infrastructure</span>
        <h2 className="text-2xl font-extrabold mb-6">Transport Context & Station Access</h2>
        <div className="space-y-3">
          {data.transport.stations.map((st, i) => (
            <div key={i} className="flex justify-between p-4 bg-sky-50/50 border rounded">
              <div className="flex gap-3 items-center">
                <Train className="w-5 h-5 text-rose-800" />
                <div>
                  <h4 className="font-bold">{st.name}</h4>
                  <p className="text-xs text-slate-500">{st.lines}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold block">{st.walkTime} min walk</span>
                <span className="text-xs text-slate-500">{st.destination}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 08. DEMOGRAPHICS & TENANT DEMAND */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">08 • Demographics & Tenant Demand</span>
        <h2 className="text-2xl font-extrabold mb-6">Population & Employment Profile</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-sky-50 rounded"><span className="text-xs block text-slate-500">10-Yr Pop Growth</span><span className="text-3xl font-black">{pct(data.demographics.popGrowth10Yr, '+')}</span></div>
          <div className="p-4 bg-sky-50 rounded"><span className="text-xs block text-slate-500">Median Age</span><span className="text-3xl font-black">{num(data.demographics.medianAge)}</span></div>
          <div className="p-4 bg-sky-50 rounded"><span className="text-xs block text-slate-500">University Educated</span><span className="text-3xl font-black">{pct(data.demographics.universityEducatedPct)}</span></div>
        </div>
      </section>

      {/* 09. POLICY & GOVERNANCE CONTEXT */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">09 • Policy & Governance Context</span>
        <h2 className="text-2xl font-extrabold mb-6">Local Authority & Governance</h2>
        <div className="p-6 bg-orange-50/50 border rounded flex justify-between items-center">
          <div>
            <span className="text-xs uppercase font-bold text-slate-500 block">Current Borough Control</span>
            <span className="text-3xl font-black text-rose-900">{data.governance.boroughControl}</span>
            <span className="text-xs text-slate-500 block mt-1">{num(data.governance.controlSinceYear, ' election year')} • {data.governance.seatsRatio}</span>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-sm">{data.governance.policyStability}</span>
        </div>
      </section>

      {/* 10. SCORE BREAKDOWN */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">10 • Score Breakdown</span>
        <h2 className="text-2xl font-extrabold mb-6">RoomReview Investor Score Analysis</h2>
        <div className="space-y-4">
          {data.scoreBreakdown.map((sc, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="w-1/3"><span className="font-bold text-sm block">{sc.category}</span><span className="text-xs text-slate-400">Weight: {sc.weight}%</span></div>
              <div className="w-1/2 bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-[#8B0000] h-full" style={{ width: `${sc.score}%` }} />
              </div>
              <span className="font-bold text-lg">{sc.score}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 11. POSTCODE COMPARISON */}
      <section className="p-8 border-b">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">11 • Postcode Comparison</span>
        <h2 className="text-2xl font-extrabold mb-6">Competitive Market Position</h2>
        <div className="space-y-3">
          {data.postcodeRanks.map((item) => (
            <div key={item.postcode} className={`flex items-center justify-between p-3 border rounded ${item.isCurrent ? 'bg-rose-50 border-rose-300' : ''}`}>
              <div className="flex items-center gap-3 w-1/3">
                <span className="font-bold text-slate-400 w-4">{item.rank}</span>
                <span className="font-bold">{item.postcode}</span>
                {item.isCurrent && <span className="bg-[#8B0000] text-white text-[10px] px-2 py-0.5 rounded font-bold">THIS PROPERTY</span>}
              </div>
              <div className="w-1/2 bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className={`h-full ${item.isCurrent ? 'bg-[#8B0000]' : 'bg-emerald-600'}`} style={{ width: `${item.score}%` }} />
              </div>
              <span className="font-bold w-8 text-right">{item.score}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 12 & 13. DATA SOURCES & TRANSPARENCY */}
      <footer className="p-8 bg-slate-50 text-xs text-slate-500 space-y-4">
        <span className="text-xs font-bold text-rose-800 uppercase block mb-1">12 & 13 • Data Sources & Transparency</span>
        <p>RoomReview aggregates information from public data sources including HM Land Registry, ONS, GLA, TfL, and local authority planning portals under Open Government Licence v3.0.</p>
      </footer>
      </div>
    </>
  );
};
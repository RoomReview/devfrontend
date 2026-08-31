import React, { useState } from 'react';
import { Home, Construction, GraduationCap, ShieldAlert } from 'lucide-react';
import * as Recharts from 'recharts';

import type { BoroughDashboardData, MainCategory } from '../types/boroughDashboard';

interface Props {
  data: BoroughDashboardData;
  initialTab?: MainCategory;
  onTabChange?: (tab: MainCategory) => void;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toLowerCase();
  const className =
    normalized.includes('approved')
      ? 'bg-emerald-100 text-emerald-800'
      : normalized.includes('in review')
        ? 'bg-amber-100 text-amber-800'
        : 'bg-slate-200 text-slate-700';

  return <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${className}`}>{status}</span>;
};

export const BoroughTabsDashboard: React.FC<Props> = ({ data, initialTab = 'housing', onTabChange }) => {
  const [activeCategory, setActiveCategory] = useState<MainCategory>(initialTab);
  const [housingSubTab, setHousingSubTab] = useState<'price' | 'history' | 'stock' | 'affordable'>('price');
  const [educationSubTab, setEducationSubTab] = useState<'performance' | 'quality' | 'availability'>('performance');
  const [policingSubTab, setPolicingSubTab] = useState<'trend' | 'ranking'>('trend');
  const [stockMeasure, setStockMeasure] = useState<'total' | 'additions'>('total');

  const boroughName = data.boroughName ?? 'Borough';
  const lastUpdated = data.lastUpdated ?? 'Latest available data';
  const kpiCards = data.kpiCards ?? { housing: [], infrastructure: [], education: [], policing: [] };
  const housingData = data.housing ?? { priceGrowthScatter: [], historicalGrowth: [], stockRanking: [], affordableHousing: [], highlights: {} };
  const infrastructureData = data.infrastructure ?? { projects: [] };
  const educationDataSet = data.education ?? { gcseTrend: [], ofstedRanking: [], schoolAvailability: [] };
  const policingDataSet = data.policing ?? { crimeTrend: [], rankingChanges: [], summaryText: '' };

  return (
    <div className="w-full max-w-[1100px] mx-auto bg-white p-6 font-sans text-slate-800 antialiased">
      <nav className="flex items-center space-x-8 border-b border-slate-200 pb-3 mb-6">
        {[
          { id: 'housing', label: 'Housing', icon: Home },
          { id: 'infrastructure', label: 'Infrastructure', icon: Construction },
          { id: 'education', label: 'Education', icon: GraduationCap },
          { id: 'policing', label: 'Policing', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as MainCategory);
                onTabChange?.(tab.id as MainCategory);
              }}
              className={`flex items-center space-x-2 text-sm font-bold pb-3 -mb-3 transition-colors ${
                isActive ? 'text-[#8B0000] border-b-2 border-[#8B0000]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 capitalize">{activeCategory}</h1>
          <p className="text-sm text-slate-500 mt-1">Data, stats and analytics for {boroughName}.</p>
        </div>
        <span className="px-3 py-1 bg-amber-50 text-amber-900 text-xs font-semibold rounded-full border border-amber-200">
          {lastUpdated}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {kpiCards[activeCategory]?.map((kpi, idx) => (
          <div key={idx} className="p-4 bg-orange-50/40 rounded-xl border border-orange-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-1">{kpi.title}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">{kpi.value}</span>
                {kpi.unit && <span className="text-xs text-slate-500">{kpi.unit}</span>}
              </div>
            </div>
            <div className="mt-3 text-xs">
              <span className="font-semibold text-emerald-700 block">{kpi.subtitlePrimary}</span>
              {kpi.subtitleSecondary && <span className="text-slate-400 block">{kpi.subtitleSecondary}</span>}
            </div>
          </div>
        ))}
      </div>

      {activeCategory === 'housing' && (
        <section>
          <div className="flex space-x-6 border-b border-slate-200 mb-6">
            {[
              { id: 'price', label: 'Property Price Growth' },
              { id: 'history', label: 'Historical Price Growth' },
              { id: 'stock', label: 'Housing Stock & Delivery' },
              { id: 'affordable', label: 'Affordable Housing' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setHousingSubTab(sub.id as 'price' | 'history' | 'stock' | 'affordable')}
                className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${
                  housingSubTab === sub.id
                    ? 'border-[#8B0000] text-[#8B0000]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {housingSubTab === 'price' && (
            <div>
              <div className="h-72 w-full mt-4">
                <Recharts.ResponsiveContainer width="100%" height="100%">
                  <Recharts.LineChart
                    data={housingData.priceGrowthScatter.map((point) => ({
                      xGrowthPct: point.xGrowthPct,
                      yPrice: point.yPrice,
                      borough: point.borough,
                    }))}
                    margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                  >
                    <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <Recharts.XAxis type="number" dataKey="xGrowthPct" name="YoY Growth" unit="%" stroke="#94A3B8" />
                    <Recharts.YAxis type="number" dataKey="yPrice" name="Price" unit="£" stroke="#94A3B8" />
                    <Recharts.Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Recharts.ReferenceLine y={600000} stroke="#CBD5E1" strokeDasharray="4 4" />
                    <Recharts.ReferenceLine x={-2.5} stroke="#CBD5E1" strokeDasharray="4 4" />
                    <Recharts.Line type="monotone" dataKey="yPrice" stroke="#8B0000" strokeWidth={3} dot={{ r: 4 }} />
                  </Recharts.LineChart>
                </Recharts.ResponsiveContainer>
              </div>
            </div>
          )}

          {housingSubTab === 'history' && (
            <div className="h-72 w-full mt-4">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.LineChart data={housingData.historicalGrowth}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <Recharts.XAxis dataKey="quarter" stroke="#94A3B8" />
                  <Recharts.YAxis unit="%" stroke="#94A3B8" />
                  <Recharts.Tooltip />
                  <Recharts.Line type="monotone" dataKey="boroughValue" stroke="#8B0000" strokeWidth={3} dot={{ r: 4 }} />
                </Recharts.LineChart>
              </Recharts.ResponsiveContainer>
            </div>
          )}

          {housingSubTab === 'stock' && (
            <div className="mt-4 border-t border-slate-200 pt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Housing supply across London boroughs</h3>
                  <p className="mt-1 text-[11px] text-slate-500">All available boroughs ranked by the selected housing measure</p>
                </div>
                <div className="flex shrink-0 rounded-lg bg-[#F3EFEC] p-1 text-xs">
                  <button type="button" onClick={() => setStockMeasure('total')} className={`rounded-md px-3 py-2 font-semibold ${stockMeasure === 'total' ? 'bg-[#991B1B] text-white shadow-sm' : 'text-slate-600'}`}>Total Housing Stock</button>
                  <button type="button" onClick={() => setStockMeasure('additions')} className={`rounded-md px-3 py-2 font-semibold ${stockMeasure === 'additions' ? 'bg-[#991B1B] text-white shadow-sm' : 'text-slate-600'}`}>Net Additions</button>
                </div>
              </div>

              {stockMeasure === 'total' ? (
                <>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[#F0D8D2] bg-[#FCF3F0] px-4 py-3">
                    <div>
                      <span className="text-lg font-black text-slate-900">{housingData.stockRanking.find((item) => item.isFocusBorough)?.value.toLocaleString() ?? '—'}</span>
                      <span className="ml-2 text-xs text-slate-600">homes</span>
                      <p className="mt-1 text-[10px] text-slate-500">Current total housing stock from the borough API</p>
                    </div>
                    <div className="rounded-lg border border-[#EED9D3] bg-white px-3 py-2 text-right">
                      <strong className="block text-sm font-black text-[#991B1B]">{housingData.stockRanking.find((item) => item.isFocusBorough)?.rank ?? '—'}{housingData.stockRanking.find((item) => item.isFocusBorough) ? 'th' : ''} of {housingData.stockRanking.length || '—'}</strong>
                      <span className="text-[10px] text-slate-500">for total housing stock</span>
                    </div>
                  </div>

                  <div className="mt-5 max-h-72 space-y-2 overflow-y-auto pr-2">
                    {housingData.stockRanking.map((item) => {
                      const maximum = housingData.stockRanking[0]?.value || 1;
                      return (
                        <div key={item.label} className={`flex items-center gap-3 rounded-md px-2 py-1.5 text-[11px] ${item.isFocusBorough ? 'bg-[#FCF0ED] font-bold text-[#991B1B]' : 'text-slate-700'}`}>
                          <span className="w-40 truncate">{item.rank}. {item.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.isFocusBorough ? 'bg-[#991B1B]' : 'bg-[#B7C9DB]'}`} style={{ width: `${(item.value / maximum) * 100}%` }} /></div>
                          <span className="w-16 text-right font-semibold">{item.value.toLocaleString()}</span>
                        </div>
                      );
                    })}
                    {!housingData.stockRanking.length && <p className="py-8 text-center text-xs text-slate-500">No total housing stock data is available.</p>}
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">Net additions data is not available in the borough API response.</div>
              )}
            </div>
          )}

          {housingSubTab === 'affordable' && (
            <div className="h-72 w-full mt-4">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.BarChart data={housingData.affordableHousing}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <Recharts.XAxis dataKey="year" stroke="#94A3B8" />
                  <Recharts.YAxis stroke="#94A3B8" />
                  <Recharts.Tooltip />
                  <Recharts.Legend />
                  <Recharts.Bar dataKey="starts" fill="#C2B29F" name="Starts" />
                  <Recharts.Bar dataKey="completions" fill="#8B0000" name="Completions" />
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {activeCategory === 'infrastructure' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {infrastructureData.projects.map((proj, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900">{proj.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{proj.description}</p>
              </div>
              <StatusBadge status={proj.status} />
            </div>
          ))}
        </section>
      )}

      {activeCategory === 'education' && (
        <section>
          <div className="flex space-x-6 border-b border-slate-200 mb-6">
            {[
              { id: 'performance', label: 'Academic Performance' },
              { id: 'quality', label: 'School Quality' },
              { id: 'availability', label: 'School Availability' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setEducationSubTab(sub.id as 'performance' | 'quality' | 'availability')}
                className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${
                  educationSubTab === sub.id
                    ? 'border-[#8B0000] text-[#8B0000]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {educationSubTab === 'availability' && (
            <div className="h-72 w-full mt-4">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.BarChart data={educationDataSet.schoolAvailability}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <Recharts.XAxis dataKey="category" stroke="#94A3B8" />
                  <Recharts.YAxis stroke="#94A3B8" />
                  <Recharts.Tooltip />
                  <Recharts.Bar dataKey="stateFunded" stackId="a" fill="#8B0000" name="State-funded" />
                  <Recharts.Bar dataKey="independent" stackId="a" fill="#C2B29F" name="Independent" />
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      {activeCategory === 'policing' && (
        <section>
          <div className="flex space-x-6 border-b border-slate-200 mb-6">
            {[
              { id: 'trend', label: 'Crime Trend' },
              { id: 'ranking', label: 'Borough Ranking' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setPolicingSubTab(sub.id as 'trend' | 'ranking')}
                className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${
                  policingSubTab === sub.id
                    ? 'border-[#8B0000] text-[#8B0000]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {policingSubTab === 'trend' && (
            <div className="h-72 w-full mt-4">
              <Recharts.ResponsiveContainer width="100%" height="100%">
                <Recharts.BarChart data={policingDataSet.crimeTrend}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <Recharts.XAxis dataKey="quarter" stroke="#94A3B8" />
                  <Recharts.YAxis stroke="#94A3B8" />
                  <Recharts.Tooltip />
                  <Recharts.Bar dataKey="boroughValue" fill="#8B0000" name="Borough Rate" />
                  <Recharts.Bar dataKey="londonAverage" fill="#2563EB" name="London Average" />
                </Recharts.BarChart>
              </Recharts.ResponsiveContainer>
            </div>
          )}
        </section>
      )}

      <footer className="mt-12 pt-4 border-t border-slate-200 text-[11px] text-slate-400">
        Source: Data aggregated dynamically across local authority metrics.
      </footer>
    </div>
  );
};

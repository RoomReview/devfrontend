import React, { useState } from 'react';
import { Home, Building2, BookOpen, ShieldAlert } from 'lucide-react';
import * as Recharts from 'recharts';

export type TabType = 'housing' | 'infrastructure' | 'education' | 'policing';

export interface StatMetric {
  label: string;
  value: string | number;
  subtext?: string;
  isPositiveTrend?: boolean;
}

export interface DevelopmentProject {
  id: string;
  title: string;
  status: 'Approved' | 'In Review' | 'Proposed' | string;
  description: string;
}

export interface TimelineStep {
  year: string | number;
  title: string;
  description?: string;
  active?: boolean;
}

export interface HousingData {
  metrics: StatMetric[];
  projects: DevelopmentProject[];
}

export interface InfrastructureData {
  insights: string[];
  newRoadProjects: string[];
  capacityUpgrades: string[];
  timeline?: TimelineStep[];
}

export interface EducationChartPoint {
  category: string;
  primary: number;
  secondary: number;
}

export interface EducationData {
  metrics: StatMetric[];
  chartData: EducationChartPoint[];
}

export interface PolicingChartPoint {
  year: string | number;
  forecast: number;
  target: number;
}

export interface PolicingData {
  metrics: StatMetric[];
  chartData: PolicingChartPoint[];
}

export interface BoroughDashboardData {
  housing?: HousingData;
  infrastructure?: InfrastructureData;
  education?: EducationData;
  policing?: PolicingData;
}

interface BoroughTabsDashboardProps {
  data: BoroughDashboardData;
  initialTab?: TabType;
  onTabChange?: (tab: TabType) => void;
}

const MetricCard: React.FC<{ metric: StatMetric }> = ({ metric }) => {
  const raw = String(metric.value ?? '');
  const isTrend = raw.startsWith('+') || raw.startsWith('-');
  const textColor = isTrend ? (metric.isPositiveTrend !== false ? 'text-emerald-600' : 'text-red-600') : 'text-slate-900';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">{metric.label}</span>
      <div className={`text-3xl md:text-4xl font-extrabold mt-3 ${textColor}`}>{metric.value}</div>
      {metric.subtext && <div className="text-sm text-slate-600 mt-2">{metric.subtext}</div>}
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status?.toLowerCase() ?? '';
  if (normalized.includes('approved')) {
    return <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium bg-emerald-50 text-emerald-700 border-emerald-300">{status}</span>;
  }
  if (normalized.includes('proposed')) {
    return <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium bg-amber-50 text-amber-700 border-amber-300">{status}</span>;
  }
  if (normalized.includes('review')) {
    return <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium bg-slate-100 text-slate-600 border-slate-300">{status}</span>;
  }
  return <span className="text-xs px-2.5 py-0.5 rounded-full border font-medium bg-slate-100 text-slate-700 border-slate-200">{status}</span>;
};

export const BoroughTabsDashboard: React.FC<BoroughTabsDashboardProps> = ({ data, initialTab = 'housing', onTabChange }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'housing', label: 'Housing', icon: <Home className="w-4 h-4" /> },
    { id: 'infrastructure', label: 'Infrastructure', icon: <Building2 className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'policing', label: 'Policing', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  const findMetric = (candidates: string[], fallbackIndex = 0): StatMetric | undefined => {
    const list = data.housing?.metrics ?? [];
    const lowered = candidates.map((c) => c.toLowerCase());
    const found = list.find((m) => lowered.some((c) => m.label.toLowerCase().includes(c)));
    return found ?? list[fallbackIndex];
  };

  const metricA = findMetric(['planned', 'total'], 0);
  const metricB = findMetric(['stock', 'current'], 1);
  const metricC = findMetric(['capacity', 'change'], 2);

  const projects = data.housing?.projects ?? [];

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl w-full max-w-5xl p-6">
        <div className="bg-[#F3F4F6] p-3 rounded-full flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-150 ${
                    active ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'housing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-semibold text-slate-700">{(metricA?.label ?? 'TOTAL PLANNED UNITS').toUpperCase()}</div>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">{metricA?.value ?? '—'}</div>
                <div className="text-sm text-slate-600 mt-1">{metricA?.subtext ?? 'New homes by 2030'}</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-semibold text-slate-700">{(metricB?.label ?? 'CURRENT HOUSING STOCK').toUpperCase()}</div>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">{metricB?.value ?? '—'}</div>
                <div className="text-sm text-slate-600 mt-1">{metricB?.subtext ?? 'Existing units'}</div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-semibold text-slate-700">{(metricC?.label ?? 'CAPACITY CHANGE').toUpperCase()}</div>
                <div className={`text-3xl md:text-4xl font-extrabold mt-2 ${String(metricC?.value ?? '').startsWith('+') ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {metricC?.value ?? '—'}
                </div>
                <div className="text-sm text-slate-600 mt-1">{metricC?.subtext ?? 'Planned increase'}</div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Key development projects list</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-2">{p.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{p.description}</p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'infrastructure' && data.infrastructure && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-3">Key Insights</h4>
              <ul className="space-y-2">
                {(data.infrastructure?.insights ?? []).map((insight, idx) => (
                  <li key={idx} className="flex items-start text-sm text-slate-600"><span className="text-red-700 mr-2 font-bold">•</span><span>{insight}</span></li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h4 className="font-bold text-slate-900 mb-3">New road / bridge projects</h4>
                <ul className="space-y-2">{(data.infrastructure?.newRoadProjects ?? []).map((item, idx) => (<li key={idx} className="flex items-start text-sm text-slate-600"><span className="text-red-700 mr-2 font-bold">•</span><span>{item}</span></li>))}</ul>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
                <h4 className="font-bold text-slate-900 mb-3">Transport capacity upgrades</h4>
                <ul className="space-y-2">{(data.infrastructure?.capacityUpgrades ?? []).map((item, idx) => (<li key={idx} className="flex items-start text-sm text-slate-600"><span className="text-red-700 mr-2 font-bold">•</span><span>{item}</span></li>))}</ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Timeline (major projects)</h3>
              <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 relative py-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-sky-100 -translate-y-1/2 z-0" />
                    <div className="flex justify-between items-center relative z-10">{(data.infrastructure?.timeline ?? []).map((item, idx) => (<div key={idx} className="flex flex-col items-center text-center"><div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center bg-white ${item.active ? 'border-sky-900 bg-sky-900' : 'border-sky-200'}`} /><span className="text-xs font-bold mt-3 text-slate-800">{item.year}</span><span className="text-[11px] text-slate-500 max-w-[70px] mt-0.5 leading-tight">{item.title}</span></div>))}</div>
                  </div>

                  <div className="lg:col-span-5 space-y-3">{(data.infrastructure?.timeline ?? []).map((item, idx) => (<div key={idx} className="flex items-start text-xs text-slate-700"><span className="text-red-700 font-bold mr-1.5">•</span><strong className="font-bold mr-1">{item.year}</strong><span>— {item.description ?? item.title}</span></div>))}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'education' && data.education && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{data.education.metrics.map((m, idx) => (<MetricCard key={idx} metric={m} />))}</div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 mb-6">School places: current vs planned</h3>
              <div className="h-72 w-full max-w-2xl">
                <Recharts.ResponsiveContainer width="100%" height="100%">
                  <Recharts.BarChart data={data.education.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <Recharts.XAxis dataKey="category" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
                    <Recharts.YAxis tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
                    <Recharts.Tooltip cursor={{ fill: 'transparent' }} />
                    <Recharts.Legend verticalAlign="bottom" height={36} />
                    <Recharts.Bar dataKey="primary" name="Primary" fill="#DCEBF8" radius={[4, 4, 0, 0]} barSize={44} />
                    <Recharts.Bar dataKey="secondary" name="Secondary" fill="#F3E5DC" radius={[4, 4, 0, 0]} barSize={44} />
                  </Recharts.BarChart>
                </Recharts.ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policing' && data.policing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{data.policing.metrics.map((m, idx) => (<MetricCard key={idx} metric={m} />))}</div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Crime forecast vs target</h3>
              <div className="h-72 w-full max-w-2xl">
                <Recharts.ResponsiveContainer width="100%" height="100%">
                  <Recharts.LineChart data={data.policing.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <Recharts.XAxis dataKey="year" tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
                    <Recharts.YAxis domain={[50, 100]} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
                    <Recharts.Tooltip />
                    <Recharts.Legend verticalAlign="bottom" height={36} />
                    <Recharts.Line type="monotone" dataKey="forecast" name="Forecast" stroke="#991B1B" strokeWidth={2} dot={{ r: 3 }} />
                    <Recharts.Line type="monotone" dataKey="target" name="Target" stroke="#1E293B" strokeWidth={2} dot={{ r: 3 }} />
                  </Recharts.LineChart>
                </Recharts.ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { useState } from 'react';

type SeriesPoint = { period: string; value: number };
type CrimeTrendPoint = { year: number; totalCrimesPer1000: number; londonAveragePer1000: number | null };
type CrimeProfilePoint = { label: string; value: number; comparisonValue?: number };
type PriceComparisonPoint = { boroughName: string; averagePrice: number; yoyGrowthPct: number };
type AffordableTrendPoint = { period: string; starts: number; completions: number };
type EducationTrendPoint = { label: string; value: number };

type ChartProps =
  | { kind: 'price'; data: SeriesPoint[] }
  | { kind: 'growth'; data: SeriesPoint[]; boroughName?: string; comparisonData?: SeriesPoint[] }
  | { kind: 'price-scatter'; data: PriceComparisonPoint[]; selectedBorough: string; comparisonBorough: string }
  | { kind: 'education-trend'; data: EducationTrendPoint[]; londonData: EducationTrendPoint[]; comparisonData?: EducationTrendPoint[]; measureLabel: string }
  | { kind: 'affordable-trend'; data: AffordableTrendPoint[] }
  | { kind: 'crime-trend'; data: CrimeTrendPoint[]; boroughName?: string; measure?: 'per1000' | 'total'; comparisonLabel?: string; comparisonValue?: number | null }
  | { kind: 'crime-profile'; data: CrimeProfilePoint[]; boroughName?: string };

type LinePoint = { label: string; value: number; comparison?: number | null };

const normalizeQuarterLabel = (label: string) => {
  const yearFirst = label.match(/^(\d{4})\s*Q([1-4])$/i);
  if (yearFirst) return `${yearFirst[1]}Q${yearFirst[2]}`;
  const quarterFirst = label.match(/^([1-4])\s*Q\s*(\d{4})$/i);
  if (quarterFirst) return `${quarterFirst[2]}Q${quarterFirst[1]}`;
  return label;
};

function CrimeTrendBarChart({ data, boroughName = 'Bromley', measure = 'per1000', comparisonLabel = 'London average', comparisonValue = null }: { data: CrimeTrendPoint[]; boroughName?: string; measure?: 'per1000' | 'total'; comparisonLabel?: string; comparisonValue?: number | null }) {
  const displayData = Array.from(new Map(data.map((point) => [point.year, point])).values()).sort((a, b) => a.year - b.year);
  const ESTIMATED_BOROUGH_POPULATION = 337000;
  const getValue = (value: number, londonValue: number | null, isLondon: boolean) => {
    if (measure === 'total') {
      const base = isLondon ? londonValue ?? 0 : value;
      return (base * ESTIMATED_BOROUGH_POPULATION) / 1000;
    }
    return isLondon ? londonValue ?? 0 : value;
  };
  const width = 984;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 42, left: 60 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const allValues = displayData.flatMap((point) => [getValue(point.totalCrimesPer1000, point.londonAveragePer1000, false), getValue(point.totalCrimesPer1000, point.londonAveragePer1000, true)]);
  const maxValue = Math.max(...allValues, measure === 'total' ? 40000 : 140);
  const yMax = Math.max(measure === 'total' ? 40000 : 140, Math.ceil(maxValue / (measure === 'total' ? 5000 : 20)) * (measure === 'total' ? 5000 : 20));
  const tickValues = Array.from({ length: Math.floor(yMax / (measure === 'total' ? 5000 : 20)) + 1 }, (_, index) => index * (measure === 'total' ? 5000 : 20));
  const groupWidth = plotWidth / displayData.length;
  const barWidth = Math.min(32, groupWidth * 0.28);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const formatCrimeValue = (value: number) => Math.round(value).toLocaleString('en-GB');

  return (
    <div className="relative overflow-hidden rounded-md bg-[#f5f5f5]">
      <svg className="block h-[300px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Annual total crime rate compared with London average">
        <rect x="0" y="0" width={width} height={height} fill="#f5f5f5" />
        {tickValues.map((tick) => {
          const y = margin.top + ((yMax - tick) / yMax) * plotHeight;
          return (
            <g key={tick}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke="#dfe2e6" strokeWidth="1" />
              <text x={margin.left - 10} y={y + 4} fill="#6b7280" fontSize="12" textAnchor="end">{measure === 'total' ? tick.toLocaleString('en-GB') : tick}</text>
            </g>
          );
        })}
        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={height - margin.bottom} stroke="#d1d5db" strokeWidth="1.2" />
        <line x1={margin.left} x2={width - margin.right} y1={height - margin.bottom} y2={height - margin.bottom} stroke="#d1d5db" strokeWidth="1.2" />

        {displayData.map((row, index) => {
          const groupX = margin.left + index * groupWidth + groupWidth / 2;
          const boroughValue = getValue(row.totalCrimesPer1000, row.londonAveragePer1000, false);
          const londonValue = getValue(row.totalCrimesPer1000, row.londonAveragePer1000, true);
          const boroughHeight = (boroughValue / yMax) * plotHeight;
          const londonHeight = (londonValue / yMax) * plotHeight;
          const boroughY = margin.top + plotHeight - boroughHeight;
          const londonY = margin.top + plotHeight - londonHeight;
          const isActive = activeIndex === index;

          return (
            <g key={row.year}>
              <rect
                x={groupX - barWidth - 6}
                y={boroughY}
                width={barWidth}
                height={boroughHeight}
                rx={0}
                fill={isActive ? '#7d1d1d' : '#a13a32'}
                stroke={isActive ? '#5a1112' : '#8d2d2b'}
                strokeWidth="0.8"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <title>{`${boroughName}: ${formatCrimeValue(measure === 'total' ? boroughValue : row.totalCrimesPer1000)}`}</title>
              </rect>
              <circle
                cx={groupX - barWidth - 6 + barWidth / 2}
                cy={boroughY}
                r={4}
                fill="#f5f5f5"
                stroke="#a73d35"
                strokeWidth="2"
              />
              <rect
                x={groupX + 6}
                y={londonY}
                width={barWidth}
                height={londonHeight}
                rx={0}
                fill={isActive ? '#1d5fb3' : '#2e6fd0'}
                stroke={isActive ? '#174a8d' : '#235ca5'}
                strokeWidth="0.8"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <title>{`London average: ${formatCrimeValue(measure === 'total' ? londonValue : (row.londonAveragePer1000 ?? 0))}`}</title>
              </rect>
              <circle
                cx={groupX + 6 + barWidth / 2}
                cy={londonY}
                r={4}
                fill="#f5f5f5"
                stroke="#2d71c9"
                strokeWidth="2"
              />
              <text x={groupX} y={height - 16} textAnchor="middle" fill="#4b5563" fontSize="11">{row.year}</text>
            </g>
          );
        })}
        <polyline
          points={displayData.map((row, index) => {
            const groupX = margin.left + index * groupWidth + groupWidth / 2;
            const londonY = margin.top + plotHeight - (getValue(row.totalCrimesPer1000, row.londonAveragePer1000, true) / yMax) * plotHeight;
            return `${groupX + 6 + barWidth / 2},${londonY}`;
          }).join(' ')}
          fill="none"
          stroke="#2d71c9"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
        <polyline
          points={displayData.map((row, index) => {
            const groupX = margin.left + index * groupWidth + groupWidth / 2;
            const boroughY = margin.top + plotHeight - (getValue(row.totalCrimesPer1000, row.londonAveragePer1000, false) / yMax) * plotHeight;
            return `${groupX - barWidth - 6 + barWidth / 2},${boroughY}`;
          }).join(' ')}
          fill="none"
          stroke="#a73d35"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>

      {activeIndex != null ? (
        <div
          className="pointer-events-none absolute z-10 w-[170px] rounded-[10px] bg-[#2d2d2d] px-3 py-2 text-white shadow-[0_10px_25px_rgba(15,23,42,0.15)]"
          style={{
            left: `${Math.min(Math.max((activeIndex + 0.5) * (plotWidth / displayData.length) + margin.left + 28, 170), width - 180)}px`,
            top: '30px',
          }}
        >
          <div className="mb-2 text-[11px] font-semibold leading-none text-white">{displayData[activeIndex]?.year}</div>
          <div className="flex items-center justify-between gap-3 text-[10px] leading-none text-slate-200">
            <span className="text-[#f4d6d2]">{boroughName}</span>
            <span className="font-semibold text-white">{formatCrimeValue(measure === 'total' ? getValue(displayData[activeIndex]?.totalCrimesPer1000 ?? 0, displayData[activeIndex]?.londonAveragePer1000 ?? 0, false) : (displayData[activeIndex]?.totalCrimesPer1000 ?? 0))}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-[10px] leading-none text-slate-200">
            <span className="text-[#cce2ff]">{comparisonLabel}</span>
            <span className="font-semibold text-white">{formatCrimeValue(measure === 'total'
              ? (comparisonValue ?? getValue(displayData[activeIndex]?.totalCrimesPer1000 ?? 0, displayData[activeIndex]?.londonAveragePer1000 ?? 0, true))
              : (comparisonValue ?? (displayData[activeIndex]?.londonAveragePer1000 ?? 0)))}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LineChartSvg({ data, kind, ariaLabel, boroughName = 'Borough', comparisonData = [], measure = 'per1000', comparisonLabel = 'London average', comparisonValue = null }: { data: LinePoint[]; kind: 'price' | 'growth' | 'crime' | 'crime-trend'; ariaLabel: string; boroughName?: string; comparisonData?: LinePoint[]; measure?: 'per1000' | 'total'; comparisonLabel?: string; comparisonValue?: number | null }) {
  if (kind === 'crime-trend') {
    const dedupedSeries = Array.from(new Map(data.map((row) => [String(row.label), row])).values());
    const crimeRows = dedupedSeries.map((row) => {
      const comparison = comparisonData.find((item) => String(item.label) === String(row.label))?.value ?? row.comparison ?? null;
      return {
        year: Number(row.label),
        totalCrimesPer1000: row.value,
        londonAveragePer1000: comparison,
      } satisfies CrimeTrendPoint;
    }).sort((a, b) => a.year - b.year);
    return <CrimeTrendBarChart data={crimeRows} boroughName={boroughName} measure={measure} comparisonLabel={comparisonLabel} comparisonValue={comparisonValue} />;
  }

  const width = 984;
  const height = 270;
  const margin = { top: 18, right: 16, bottom: 38, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const values = data.flatMap((point) => [point.value, ...(point.comparison == null ? [] : [point.comparison])]);
  const comparisonValues = comparisonData.flatMap((point) => [point.value]);
  const allValues = [...values, ...comparisonValues];
  const low = Math.min(...allValues, 0);
  const high = Math.max(...allValues, 10);
  const paddedLow = kind === 'growth' ? Math.min(-6, Math.floor((low - 1) / 2) * 2) : Math.floor((low - 1) / 2) * 2;
  const paddedHigh = kind === 'growth' ? Math.max(10, Math.ceil((high + 1) / 2) * 2) : Math.ceil((high + 1) / 2) * 2;
  const range = Math.max(paddedHigh - paddedLow, 1);
  const growthPeriods = kind === 'growth'
    ? Array.from(new Set([...data, ...comparisonData].map((row) => normalizeQuarterLabel(row.label))))
      .sort((first, second) => first.localeCompare(second, undefined, { numeric: true }))
    : data.map((row) => row.label);
  const periodIndex = new Map(growthPeriods.map((period, index) => [period, index]));
  const point = (value: number, index: number) => ({
    x: margin.left + (index * plotWidth) / Math.max(1, growthPeriods.length - 1),
    y: margin.top + ((paddedHigh - value) / range) * plotHeight,
  });
  const primary = data.map((row) => ({
    ...row,
    ...point(row.value, periodIndex.get(normalizeQuarterLabel(row.label)) ?? 0),
  }));
  const comparison = data.flatMap((row, index) => row.comparison == null ? [] : [{ ...row, ...point(row.comparison, index) }]);
  const secondary = comparisonData.map((row) => ({
    ...row,
    ...point(row.value, periodIndex.get(normalizeQuarterLabel(row.label)) ?? 0),
  }));
  const format = (value: number) => kind === 'price' ? `£${Math.round(value / 1000)}k` : kind === 'growth' ? `${value.toFixed(0)}%` : value.toFixed(0);
  const formatLabel = (label: string) => {
    const match = label.match(/(\d{4})Q(\d)/i);
    if (!match) return label;
    return `Q${match[2]} '${match[1].slice(2)}`;
  };
  const yTicks = Array.from({ length: 6 }, (_, index) => {
    const value = paddedHigh - ((paddedHigh - paddedLow) / 5) * index;
    return Number(value.toFixed(0));
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = hoveredIndex == null ? null : Math.max(0, Math.min(hoveredIndex, data.length - 1));
  const activePoint = activeIndex == null ? null : primary[activeIndex];
  const comparisonPoint = activeIndex == null || !activePoint
    ? null
    : secondary.find((row) => normalizeQuarterLabel(row.label) === normalizeQuarterLabel(activePoint.label)) ?? null;
  const activeTooltip = activePoint
    ? {
        left: Math.min(Math.max(activePoint.x + 18, 154), width - 182),
        top: Math.max(activePoint.y - 78, 18),
      }
    : null;

  return (
    <div className="relative overflow-hidden rounded-md bg-[#f8f6f4]">
      <svg className="h-[270px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        <rect x="0" y="0" width={width} height={height} fill="#f8f6f4" />
        {yTicks.map((value, index) => {
          const y = margin.top + (index / (yTicks.length - 1)) * plotHeight;
          return (
            <g key={`${value}-${index}`}>
              <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e8e1dc" strokeWidth="1" />
              <text x={margin.left - 10} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="12">{value > 0 ? `${value}%` : `${value}%`}</text>
            </g>
          );
        })}
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#d2cec9" strokeWidth="1.1" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#d2cec9" strokeWidth="1.1" />
        <polyline points={primary.map((row) => `${row.x},${row.y}`).join(' ')} fill="none" stroke="#8b1a1a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        {secondary.length > 1 ? <polyline points={secondary.map((row) => `${row.x},${row.y}`).join(' ')} fill="none" stroke="#2f6bb3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" /> : null}
        {comparison.length > 1 ? <polyline points={comparison.map((row) => `${row.x},${row.y}`).join(' ')} fill="none" stroke="#7d9ec2" strokeWidth="2" strokeDasharray="4 4" opacity="0.9" /> : null}
        {primary.map((row, index) => (
          <g key={`${row.label}-${index}`}>
            <line
              x1={row.x}
              y1={margin.top}
              x2={row.x}
              y2={height - margin.bottom}
              stroke="transparent"
              strokeWidth={18}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            />
            <circle
              cx={row.x}
              cy={row.y}
              r={index === activeIndex ? 5.6 : 4.3}
              fill={index === activeIndex ? '#7d1d1d' : '#8b1a1a'}
              stroke={index === activeIndex ? '#ffffff' : '#f6efeb'}
              strokeWidth={index === activeIndex ? 1.8 : 1.2}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              tabIndex={0}
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <title>{`${row.label}: ${format(row.value)}`}</title>
            </circle>
          </g>
        ))}
        {growthPeriods.map((period, index) => index % Math.max(1, Math.ceil(growthPeriods.length / 6)) === 0 || index === growthPeriods.length - 1 ? (
          <text key={`period-${period}`} x={point(0, index).x} y={height - 12} textAnchor="middle" fill="#6b7280" fontSize="11">{formatLabel(period)}</text>
        ) : null)}
        {secondary.length > 0 ? (
          secondary.map((row, index) => (
            <g key={`comparison-${row.label}-${index}`}>
              <line
                x1={row.x}
                y1={margin.top}
                x2={row.x}
                y2={height - margin.bottom}
                stroke="transparent"
                strokeWidth={18}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              />
              <circle
                cx={row.x}
                cy={row.y}
                r={index === activeIndex ? 5.2 : 4}
                fill={index === activeIndex ? '#2c71c4' : '#2f6bb3'}
                stroke={index === activeIndex ? '#ffffff' : '#eef4fb'}
                strokeWidth={index === activeIndex ? 1.7 : 1}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                <title>{`${row.label}: ${format(row.value)}`}</title>
              </circle>
            </g>
          ))
        ) : null}
        <text x={18} y={height / 2} textAnchor="middle" fill="#5f6b76" fontSize="12" transform={`rotate(-90 18 ${height / 2})`}>YoY price growth (%)</text>
        <text x={width / 2} y={height - 4} textAnchor="middle" fill="#5f6b76" fontSize="12">Quarter</text>
      </svg>
      {activePoint && activeTooltip ? (
        <div
          className="pointer-events-none absolute z-10 w-[170px] rounded-md bg-[#1f1f1f] px-3 py-2 text-white shadow-[0_8px_24px_rgba(15,23,42,0.18)]"
          style={{ left: activeTooltip.left, top: activeTooltip.top }}
        >
          <div className="mb-1 text-[11px] font-semibold text-white">{formatLabel(activePoint.label)}</div>
          <div className="flex items-center justify-between gap-3 text-[10px] text-slate-200">
            <span className="text-[#f4d6d2]">{boroughName}</span>
            <span className="font-semibold text-white">{activePoint.value > 0 ? '+' : ''}{activePoint.value.toFixed(1)}%</span>
          </div>
          {comparisonPoint && comparisonData.length > 0 ? (
            <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-slate-200">
              <span className="text-[#c6d9f5]">Comparison</span>
              <span className="font-semibold text-white">{comparisonPoint.value > 0 ? '+' : ''}{comparisonPoint.value.toFixed(1)}%</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PriceScatter({ data, selectedBorough, comparisonBorough }: Extract<ChartProps, { kind: 'price-scatter' }>) {
  const width = 984;
  const height = 270;
  const margin = { top: 18, right: 18, bottom: 36, left: 76 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const [hoveredPoint, setHoveredPoint] = useState<PriceComparisonPoint | null>(null);

  const minPrice = Math.min(...data.map((row) => row.averagePrice), 300000);
  const maxPrice = Math.max(...data.map((row) => row.averagePrice), 1300000);
  const minGrowth = Math.min(...data.map((row) => row.yoyGrowthPct), -12);
  const maxGrowth = Math.max(...data.map((row) => row.yoyGrowthPct), 2);

  const xMin = minGrowth - 1.5;
  const xMax = maxGrowth + 1.5;
  const yMin = minPrice - 25000;
  const yMax = maxPrice + 25000;

  const x = (value: number) => margin.left + ((value - xMin) / (xMax - xMin || 1)) * plotWidth;
  const y = (value: number) => height - margin.bottom - ((value - yMin) / (yMax - yMin || 1)) * plotHeight;

  const averagePrice = data.reduce((total, row) => total + row.averagePrice, 0) / data.length;
  const averageGrowth = data.reduce((total, row) => total + row.yoyGrowthPct, 0) / data.length;

  const xTicks = [-12, -10, -8, -6, -4, -2, 0, 2];
  const yTicks = [300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000];

  const tooltipPosition = hoveredPoint
    ? {
        left: Math.min(Math.max(x(hoveredPoint.yoyGrowthPct) + 18, 116), width - 190),
        top: Math.max(y(hoveredPoint.averagePrice) - 76, 12),
      }
    : null;

  return (
    <div className="relative rounded-md bg-[#f8f6f4]">
      <svg className="h-[270px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Average property price against annual growth for London boroughs">
        <rect x="0" y="0" width={width} height={height} fill="#f8f6f4" />

        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} stroke="#e7e2dd" strokeWidth="1" />
            <text x={margin.left - 10} y={y(tick) + 4} textAnchor="end" fill="#6b7280" fontSize="11">
              £{Math.round(tick / 1000)}k
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} stroke="#ece7e2" strokeWidth="1" />
            <text x={x(tick)} y={height - 14} textAnchor="middle" fill="#6b7280" fontSize="11">{tick}%</text>
          </g>
        ))}

        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#d9d1ca" />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#d9d1ca" />

        <line x1={x(averageGrowth)} y1={margin.top} x2={x(averageGrowth)} y2={height - margin.bottom} stroke="#b7aaa1" strokeDasharray="4 4" strokeWidth="1.2" />
        <line x1={margin.left} y1={y(averagePrice)} x2={width - margin.right} y2={y(averagePrice)} stroke="#b7aaa1" strokeDasharray="4 4" strokeWidth="1.2" />

        <text x={width / 2} y={height - 4} textAnchor="middle" fill="#5f6b76" fontSize="12">YoY price growth qtr to Q1 2026 (%)</text>
        <text x={18} y={height / 2} textAnchor="middle" fill="#5f6b76" fontSize="12" transform={`rotate(-90 18 ${height / 2})`}>Average price (£)</text>

        {data.map((row) => {
          const selected = row.boroughName.toLowerCase() === selectedBorough.toLowerCase();
          const comparison = row.boroughName.toLowerCase() === comparisonBorough.toLowerCase();
          const fill = selected ? '#8b1a1a' : comparison ? '#2d7bc2' : '#d3c7bc';
          const stroke = selected || comparison ? '#f8f6f4' : 'transparent';

          return (
            <g key={row.boroughName}>
              <circle
                cx={x(row.yoyGrowthPct)}
                cy={y(row.averagePrice)}
                r={selected ? 6.5 : comparison ? 5.5 : 5}
                fill={fill}
                fillOpacity={selected ? 1 : comparison ? 0.9 : 0.76}
                stroke={stroke}
                strokeWidth={selected || comparison ? 1.5 : 0}
                onMouseEnter={() => setHoveredPoint(row)}
                onMouseLeave={() => setHoveredPoint(null)}
                onFocus={() => setHoveredPoint(row)}
                onBlur={() => setHoveredPoint(null)}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              />
            </g>
          );
        })}
      </svg>

      {hoveredPoint && tooltipPosition ? (
        <div
          className="pointer-events-none absolute z-10 w-[160px] rounded-md border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm"
          style={{ left: tooltipPosition.left, top: tooltipPosition.top }}
        >
          <div className="mb-1 text-[11px] font-semibold text-slate-900">{hoveredPoint.boroughName}</div>
          <div className="flex items-center justify-between gap-3 text-[10px] text-slate-600">
            <span>Price</span>
            <span className="font-semibold text-slate-900">£{hoveredPoint.averagePrice.toLocaleString('en-GB')}</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3 text-[10px] text-slate-600">
            <span>Growth</span>
            <span className="font-semibold text-slate-900">{hoveredPoint.yoyGrowthPct.toFixed(1)}%</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AffordableTrend({ data }: { data: AffordableTrendPoint[] }) {
  const visibleData = data.slice(-5);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeSeries, setActiveSeries] = useState<'starts' | 'completions' | null>(null);
  const width = 984;
  const height = 270;
  const margin = { top: 16, right: 22, bottom: 30, left: 62 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const axisMax = Math.max(450, Math.ceil(Math.max(...visibleData.flatMap((row) => [row.starts, row.completions]), 1) / 50) * 50);
  const gridValues = Array.from({ length: 10 }, (_, index) => axisMax * (index / 9));
  const groupWidth = plotWidth / visibleData.length;
  const barWidth = Math.min(24, groupWidth * 0.24);
  const tooltipData = activeIndex == null || activeSeries == null ? null : visibleData[activeIndex];
  const tooltipSeries = activeSeries === 'starts' ? 'Starts' : activeSeries === 'completions' ? 'Completions' : null;
  const tooltipValue = tooltipData && activeSeries === 'starts' ? tooltipData.starts : tooltipData && activeSeries === 'completions' ? tooltipData.completions : null;

  return (
    <div className="relative">
      <svg
        className="block w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Affordable housing starts and completions by financial year"
      >
        {gridValues.map((value) => {
          const y = margin.top + plotHeight - (value / axisMax) * plotHeight;
          return (
            <g key={`grid-${value}`}>
              <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e6e1dc" />
              <text x={margin.left - 12} y={y + 4} textAnchor="end" fill="#7b7e82" fontSize="10" fontWeight="500">{Math.round(value).toLocaleString('en-GB')}</text>
            </g>
          );
        })}

        {visibleData.map((row, index) => {
          const groupX = margin.left + index * groupWidth + groupWidth / 2;
          const startsHeight = (row.starts / axisMax) * plotHeight;
          const completionsHeight = (row.completions / axisMax) * plotHeight;
          const startsY = margin.top + plotHeight - startsHeight;
          const completionsY = margin.top + plotHeight - completionsHeight;
          const startsActive = activeIndex === index && activeSeries === 'starts';
          const completionsActive = activeIndex === index && activeSeries === 'completions';

          return (
            <g key={row.period}>
              <rect
                x={groupX - barWidth - 4}
                y={startsY}
                width={barWidth}
                height={startsHeight}
                rx={2}
                fill={startsActive ? '#c7b49d' : '#d8cab7'}
                opacity={startsActive ? 1 : 0.92}
                onMouseEnter={() => { setActiveIndex(index); setActiveSeries('starts'); }}
                onMouseLeave={() => { setActiveIndex(null); setActiveSeries(null); }}
                onFocus={() => { setActiveIndex(index); setActiveSeries('starts'); }}
                onBlur={() => { setActiveIndex(null); setActiveSeries(null); }}
                tabIndex={0}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                <title>{`${row.period} starts: ${row.starts}`}</title>
              </rect>
              <rect
                x={groupX + 4}
                y={completionsY}
                width={barWidth}
                height={completionsHeight}
                rx={2}
                fill={completionsActive ? '#6d1010' : '#8b1a1a'}
                opacity={completionsActive ? 1 : 0.96}
                onMouseEnter={() => { setActiveIndex(index); setActiveSeries('completions'); }}
                onMouseLeave={() => { setActiveIndex(null); setActiveSeries(null); }}
                onFocus={() => { setActiveIndex(index); setActiveSeries('completions'); }}
                onBlur={() => { setActiveIndex(null); setActiveSeries(null); }}
                tabIndex={0}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                <title>{`${row.period} completions: ${row.completions}`}</title>
              </rect>
              <text x={groupX} y={height - 8} textAnchor="middle" fill="#667085" fontSize="11" fontWeight="500">{row.period}</text>
            </g>
          );
        })}
      </svg>

      {tooltipData && tooltipSeries && tooltipValue != null ? (
        <div
          className="pointer-events-none absolute z-10 rounded-md bg-[#1d1d1d] px-2.5 py-1.5 text-[10px] text-white shadow-lg"
          style={{
            left: `${Math.min(width - 110, Math.max(24, margin.left + (activeIndex ?? 0) * groupWidth + groupWidth / 2 - 30))}px`,
            top: `${Math.max(12, margin.top + 6)}px`,
          }}
        >
          <div className="mb-0.5 font-semibold">{tooltipData.period}</div>
          <div className="flex items-center justify-between gap-3">
            <span className={activeSeries === 'starts' ? 'text-[#f3d4cd]' : 'text-[#d0d9f5]'}>{tooltipSeries}</span>
            <span>{tooltipValue}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EducationTrend({ data, londonData, comparisonData = [], measureLabel }: Extract<ChartProps, { kind: 'education-trend' }>) {
  const width = 984;
  const height = 285;
  const margin = { top: 18, right: 18, bottom: 36, left: 58 };
  const values = [...data, ...londonData, ...comparisonData].map((point) => point.value);
  const low = Math.floor(Math.min(...values) * 5) / 5 - 0.2;
  const high = Math.ceil(Math.max(...values) * 5) / 5 + 0.2;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = (index: number) => margin.left + (index * plotWidth) / Math.max(data.length - 1, 1);
  const y = (value: number) => margin.top + ((high - value) / (high - low || 1)) * plotHeight;
  const ticks = Array.from({ length: 6 }, (_, index) => high - ((high - low) / 5) * index);
  const points = (series: EducationTrendPoint[]) => series.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');

  return (
    <svg className="block h-[285px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${measureLabel} five-year trend for London boroughs`}>
      <rect width={width} height={height} fill="#ffffff" />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} stroke="#e8e6e2" />
          <text x={margin.left - 10} y={y(tick) + 4} textAnchor="end" fill="#6b7280" fontSize="11">{tick.toFixed(1)}</text>
        </g>
      ))}
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#d8d5d0" />
      <polyline points={points(londonData)} fill="none" stroke="#626b70" strokeWidth="1.8" strokeDasharray="5 5" />
      {comparisonData.length > 0 ? <polyline points={points(comparisonData)} fill="none" stroke="#2875b8" strokeWidth="2" /> : null}
      <polyline points={points(data)} fill="none" stroke="#8b1a1a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {londonData.map((point, index) => <circle key={`london-${point.label}`} cx={x(index)} cy={y(point.value)} r="3" fill="#fff" stroke="#626b70" strokeWidth="1.5"><title>{`London average, ${point.label}: ${point.value.toFixed(1)}`}</title></circle>)}
      {comparisonData.map((point, index) => <circle key={`comparison-${point.label}`} cx={x(index)} cy={y(point.value)} r="3.5" fill="#2875b8"><title>{`Comparison borough, ${point.label}: ${point.value.toFixed(1)}`}</title></circle>)}
      {data.map((point, index) => (
        <g key={`borough-${point.label}`}>
          <circle cx={x(index)} cy={y(point.value)} r="5" fill="#8b1a1a"><title>{`${point.label}: ${point.value.toFixed(1)}`}</title></circle>
          <text x={x(index)} y={height - 12} textAnchor="middle" fill="#6b7280" fontSize="11">{point.label}</text>
        </g>
      ))}
      <text x="16" y={height / 2} textAnchor="middle" fill="#5f6b76" fontSize="11" transform={`rotate(-90 16 ${height / 2})`}>{measureLabel} score</text>
    </svg>
  );
}

function CrimeProfileChart({ data, boroughName = 'Borough' }: { data: CrimeProfilePoint[]; boroughName?: string }) {
  const [hoveredBar, setHoveredBar] = useState<{ category: string; series: 'borough' | 'london'; value: number; x: number; y: number } | null>(null);
  const rows = [...data].filter((row) => Number.isFinite(row.value)).sort((first, second) => second.value - first.value);
  const rowHeight = 29;
  const width = 984;
  const height = 12 + rows.length * rowHeight + 57;
  const labelWidth = 138;
  const rightMargin = 10;
  const top = 12;
  const plotWidth = width - labelWidth - rightMargin;
  const maxValue = Math.max(...rows.flatMap((row) => [row.value, ...(row.comparisonValue == null ? [] : [row.comparisonValue])]), 90);
  const axisMax = Math.ceil(maxValue / 10) * 10;
  const ticks = Array.from({ length: axisMax / 10 + 1 }, (_, index) => index * 10);
  const xForValue = (value: number) => labelWidth + (value / axisMax) * plotWidth;
  const tooltipWidth = 190;
  const tooltipHeight = 44;
  const tooltipX = hoveredBar
    ? hoveredBar.x < width * 0.68
      ? Math.min(hoveredBar.x + 10, width - tooltipWidth - 4)
      : Math.max(labelWidth + 4, hoveredBar.x - tooltipWidth - 10)
    : 0;
  const tooltipY = hoveredBar
    ? Math.max(4, Math.min(hoveredBar.y < height / 2 ? hoveredBar.y + 12 : hoveredBar.y - tooltipHeight - 8, height - tooltipHeight - 4))
    : 0;

  return (
    <div className="overflow-x-auto">
      <svg className="block min-w-[720px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Recorded offences per 1,000 population by category compared with London average">
        {ticks.map((tick) => {
          const x = xForValue(tick);
          return (
            <g key={tick}>
              <line x1={x} y1={top} x2={x} y2={top + rows.length * rowHeight} stroke="#e8e4e0" strokeWidth="1" />
              <text x={x} y={top + rows.length * rowHeight + 18} textAnchor="middle" fill="#5f5b57" fontSize="11">{tick}</text>
            </g>
          );
        })}
        {rows.map((row, index) => {
          const y = top + index * rowHeight;
          const boroughWidth = Math.max(0, xForValue(row.value) - labelWidth);
          const londonWidth = row.comparisonValue == null ? 0 : Math.max(0, xForValue(row.comparisonValue) - labelWidth);
          return (
            <g key={row.label}>
              <text x={labelWidth - 10} y={y + 19} textAnchor="end" fill="#4d4a47" fontSize="11">{row.label}</text>
              <rect
                x={labelWidth}
                y={y + 3}
                width={boroughWidth}
                height="9"
                rx="3"
                fill="#8b1a1a"
                tabIndex={0}
                aria-label={`${row.label}, ${boroughName}: ${row.value.toFixed(1)} offences per 1,000`}
                onMouseEnter={() => setHoveredBar({ category: row.label, series: 'borough', value: row.value, x: labelWidth + boroughWidth, y: y + 3 })}
                onMouseLeave={() => setHoveredBar(null)}
                onFocus={() => setHoveredBar({ category: row.label, series: 'borough', value: row.value, x: labelWidth + boroughWidth, y: y + 3 })}
                onBlur={() => setHoveredBar(null)}
                style={{ cursor: 'pointer' }}
              >
                <title>{`${row.label}, ${boroughName}: ${row.value.toFixed(1)} offences per 1,000`}</title>
              </rect>
              {row.comparisonValue != null ? (
                <rect
                  x={labelWidth}
                  y={y + 14}
                  width={londonWidth}
                  height="9"
                  rx="3"
                  fill="#2875b8"
                  tabIndex={0}
                  aria-label={`${row.label}, London average: ${row.comparisonValue.toFixed(1)} offences per 1,000`}
                  onMouseEnter={() => setHoveredBar({ category: row.label, series: 'london', value: row.comparisonValue!, x: labelWidth + londonWidth, y: y + 14 })}
                  onMouseLeave={() => setHoveredBar(null)}
                  onFocus={() => setHoveredBar({ category: row.label, series: 'london', value: row.comparisonValue!, x: labelWidth + londonWidth, y: y + 14 })}
                  onBlur={() => setHoveredBar(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{`${row.label}, London average: ${row.comparisonValue.toFixed(1)} offences per 1,000`}</title>
                </rect>
              ) : null}
            </g>
          );
        })}
        {hoveredBar ? (
          <g pointerEvents="none" aria-hidden="true">
            <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx="5" fill="#2d2d2d" />
            <text x={tooltipX + 10} y={tooltipY + 16} fill="#ffffff" fontSize="11" fontWeight="700">{hoveredBar.category}</text>
            <rect x={tooltipX + 10} y={tooltipY + 25} width="8" height="8" rx="1" fill={hoveredBar.series === 'borough' ? '#8b1a1a' : '#2875b8'} />
            <text x={tooltipX + 24} y={tooltipY + 33} fill="#e5e7eb" fontSize="10">{hoveredBar.series === 'borough' ? boroughName : 'London average'} · {hoveredBar.value.toFixed(1)} per 1,000</text>
          </g>
        ) : null}
        <text x={labelWidth + plotWidth / 2} y={height - 2} textAnchor="middle" fill="#5f5b57" fontSize="11" fontWeight="600">Offences per 1,000 population</text>
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-5 rounded-full bg-[#8b1a1a]" />{boroughName}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-5 rounded-full bg-[#2875b8]" />London average</span>
      </div>
    </div>
  );
}

export default function BoroughInsightCharts(props: ChartProps) {
  if (props.kind === 'price-scatter') return <PriceScatter {...props} />;
  if (props.kind === 'education-trend') return <EducationTrend {...props} />;
  if (props.kind === 'growth') return <LineChartSvg data={props.data.map((row) => ({ label: row.period, value: row.value }))} kind={props.kind} ariaLabel="Quarterly year-on-year property price growth" boroughName={props.boroughName ?? 'Borough'} comparisonData={props.comparisonData?.map((row) => ({ label: row.period, value: row.value })) ?? []} />;
  if (props.kind === 'affordable-trend') return <AffordableTrend data={props.data} />;
  if (props.kind === 'crime-profile') return <CrimeProfileChart data={props.data} boroughName={props.boroughName} />;
  if (props.kind === 'crime-trend') return <LineChartSvg data={props.data.map((row) => ({ label: String(row.year), value: row.totalCrimesPer1000, comparison: row.londonAveragePer1000 }))} kind="crime-trend" ariaLabel="Annual total crime rate compared with London average" boroughName={props.boroughName ?? 'Borough'} measure={props.measure ?? 'per1000'} comparisonLabel={props.comparisonLabel ?? 'London average'} comparisonValue={props.comparisonValue ?? null} />;
  return <LineChartSvg data={props.data.map((row) => ({ label: row.period, value: row.value }))} kind={props.kind} ariaLabel={props.kind === 'price' ? 'Quarterly average property price history' : 'Quarterly year-on-year property price growth'} />;
}

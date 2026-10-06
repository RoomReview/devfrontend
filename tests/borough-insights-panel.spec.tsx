import { test, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import BoroughInsightsPanel from '../src/components/borough/BoroughInsightsPanel';
import type { BoroughApiResponse } from '../src/types/borough.types';

const borough: BoroughApiResponse = {
  boroughId: 'borough-1',
  name: 'Bromley',
  slug: 'bromley',
  educationData: [
    { label: 'Total schools', value: 95 },
    { label: 'Publicly funded schools', value: 82 },
    { label: 'Independent schools', value: 13 },
    { label: 'Publicly funded nurseries', value: 4 },
    { label: 'Publicly funded primary schools', value: 58 },
    { label: 'Publicly funded secondary schools', value: 20 },
    { label: 'Education rank', value: 8 },
    { label: 'GCSE attainment 8', value: 58.6 },
    { label: 'Ofsted good or outstanding', value: 82 },
  ],
  housingStockData: [
    { label: 'Total dwellings', value: 143402 },
    { label: 'Net additions', value: 632 },
    { label: 'Affordable starts', value: 356 },
    { label: 'Affordable completions', value: 179 },
    { label: 'Band D', value: 1950 },
  ],
  districtData: [],
  rentData: [{ rent: 1850, type: 'average' }],
  propertyValueData: [
    { label: '1Q 2026', value: 518895 },
    { label: 'YoY growth · 1Q 2026', value: 1.8 },
    { label: '1Q 2025', value: 500000 },
    { label: 'YoY growth · 2025Q4', value: -1.6 },
    { label: 'YoY growth · 2025Q3', value: 2.7 },
  ],
  crimeData: [
    { label: 'Total crimes per 1,000', value: 265 },
    { label: 'Violent crime', value: 82, comparisonValue: 96 },
  ],
  crimeTrendData: [
    { year: 2024, totalCrimesPer1000: 270, londonAveragePer1000: 101 },
    { year: 2025, totalCrimesPer1000: 265, londonAveragePer1000: 95 },
  ],
  crimeHighlight: {
    year: 2025,
    totalCrimesPer1000: 265,
    rank: 8,
    yoyChangePct: -1,
    lowestGapCategory: 'Bicycle theft',
    lowestGapPct: -74,
    largestIncreaseCategory: 'Possession of weapons',
    largestIncreasePct: 36,
  },
  housingPriceComparisonData: [
    { boroughName: 'Bromley', averagePrice: 518895, yoyGrowthPct: 1.8, period: '2026Q1' },
    { boroughName: 'Hounslow', averagePrice: 460000, yoyGrowthPct: 0.7, period: '2026Q1', growthHistory: [
      { period: '2025Q3', value: 4.2 },
      { period: '2025Q4', value: -3.1 },
      { period: '2026Q1', value: 0.7 },
    ] },
    { boroughName: 'Barking and Dagenham', averagePrice: 340000, yoyGrowthPct: -2.5, period: '2026Q1' },
  ],
  housingStockComparisonData: [
    { boroughName: 'Bromley', year: 2025, totalDwellings: 143402, netAdditions: 632, affordableStarts: 356, affordableCompletions: 179, bandD: 1950, bandDRank: 16, totalDwellingsRank: 8, netAdditionsRank: 12, affordableFinancialYear: '2024-25' },
    { boroughName: 'Hounslow', year: 2025, totalDwellings: 113879, netAdditions: 488, affordableStarts: 310, affordableCompletions: 190, bandD: 1900, bandDRank: 14, totalDwellingsRank: 18, netAdditionsRank: 16, affordableFinancialYear: '2024-25' },
    { boroughName: 'Barking and Dagenham', year: 2025, totalDwellings: 81873, netAdditions: 550, affordableStarts: 356, affordableCompletions: 179, bandD: 1800, bandDRank: 10, totalDwellingsRank: 31, netAdditionsRank: 14, affordableFinancialYear: '2024-25' },
  ],
  housingStockHistory: [
    { boroughName: 'Bromley', year: 2024, totalDwellings: 142000, netAdditions: 500, affordableStarts: 300, affordableCompletions: 150, bandD: 1900, bandDRank: 18, totalDwellingsRank: 8, netAdditionsRank: 15, affordableFinancialYear: '2023-24' },
    { boroughName: 'Bromley', year: 2025, totalDwellings: 143402, netAdditions: 632, affordableStarts: 356, affordableCompletions: 179, bandD: 1950, bandDRank: 16, totalDwellingsRank: 8, netAdditionsRank: 12, affordableFinancialYear: '2024-25' },
    { boroughName: 'Bromley', year: 2026, totalDwellings: 146000, netAdditions: 700, affordableStarts: 180, affordableCompletions: 120, bandD: 2000, bandDRank: 12, totalDwellingsRank: 7, netAdditionsRank: 10, affordableFinancialYear: '2025-26' },
  ],
  educationComparisonData: [
    { boroughName: 'Bromley', totalSchools: 95, educationRank: 8, gcseAttainment8: 58.6, ks2ExpectedStandard: 72, ofstedGoodAndOutstanding: 82 },
    { boroughName: 'Hounslow', totalSchools: 86, educationRank: 12, gcseAttainment8: 56.4, ks2ExpectedStandard: 70, ofstedGoodAndOutstanding: 75 },
  ],
  policingComparisonData: [
    { boroughName: 'Bromley', year: 2025, totalCrimesPer1000: 265, safetyRank: 8 },
    { boroughName: 'Hounslow', year: 2025, totalCrimesPer1000: 310, safetyRank: 15 },
  ],
};

test('shows borough dataset metrics in the matching insight tabs', async () => {
  const { getByRole, getByText } = await render(<BoroughInsightsPanel borough={borough} />);

  expect(getByText('£518,895')).toBeInTheDocument();
  expect(getByText('143,402')).toBeInTheDocument();
  await expect.poll(() => document.querySelector('svg[aria-label="Average property price against annual growth for London boroughs"]')).not.toBeNull();

  await getByRole('tab', { name: 'Housing stock & delivery' }).click();
  expect(getByText('Housing supply across London boroughs')).toBeInTheDocument();

  await getByRole('tab', { name: 'Affordable housing' }).click();
  await expect.poll(() => document.querySelector('svg[aria-label="Affordable housing starts and completions by financial year"]')).not.toBeNull();

  await getByRole('tab', { name: 'Education' }).click();
  expect(getByText('95')).toBeInTheDocument();
  expect(getByText('GCSE Attainment 8 — five-year trend')).toBeInTheDocument();

  await getByRole('tab', { name: 'Policing' }).click();
  expect(getByText('265', { exact: true })).toBeInTheDocument();
  await expect.poll(() => document.querySelector('svg[aria-label="Annual total crime rate compared with London average"]')).not.toBeNull();

  await getByRole('tab', { name: 'Crime profile' }).click();
  await expect.poll(() => document.querySelector('svg[aria-label="Recorded offences per 1,000 population by category compared with London average"]')).not.toBeNull();

  await getByRole('tab', { name: 'Infrastructure' }).click();
  expect(getByText(/Infrastructure data is not connected yet/i)).toBeInTheDocument();
});

test('renders the affordable housing chart in the mockup-style grouped bar format', async () => {
  const { getByRole } = await render(<BoroughInsightsPanel borough={borough} />);

  await getByRole('tab', { name: 'Affordable housing' }).click();
  const chart = document.querySelector('svg[aria-label="Affordable housing starts and completions by financial year"]');
  const startsLegend = Array.from(document.querySelectorAll('span')).find((element) => element.textContent === 'Starts');
  const completionsLegend = Array.from(document.querySelectorAll('span')).find((element) => element.textContent === 'Completions');

  expect(chart).not.toBeNull();
  expect(chart?.getAttribute('viewBox')).toBe('0 0 984 270');
  expect(startsLegend).not.toBeNull();
  expect(completionsLegend).not.toBeNull();
});

test('plots the selected borough actual quarterly growth history', async () => {
  const { getByRole } = await render(<BoroughInsightsPanel borough={borough} />);

  await getByRole('tab', { name: 'Historical price growth' }).click();
  await getByRole('combobox', { name: 'Compare historical price growth with borough' }).selectOptions('Hounslow');

  const chart = document.querySelector('svg[aria-label="Quarterly year-on-year property price growth"]');
  const [boroughLine, comparisonLine] = Array.from(chart?.querySelectorAll('polyline') ?? []);
  const comparisonPointTitles = Array.from(chart?.querySelectorAll('circle[fill="#2f6bb3"] title') ?? []).map((title) => title.textContent);

  expect(boroughLine?.getAttribute('points')).not.toBe(comparisonLine?.getAttribute('points'));
  expect(comparisonPointTitles).toEqual(['2025Q3: 4%', '2025Q4: -3%', '2026Q1: 1%']);
});

test('shows the affordable housing status pills under the chart', async () => {
  const { getByRole, getByText } = await render(<BoroughInsightsPanel borough={borough} />);

  await getByRole('tab', { name: 'Affordable housing' }).click();

  expect(getByText(/Peak completions:/i)).toBeInTheDocument();
  expect(getByText(/partial year/i)).toBeInTheDocument();
});

test('renders the education panel in the compact Figma-style layout', async () => {
  const { getByRole, getByText } = await render(<BoroughInsightsPanel borough={borough} />);

  await getByRole('tab', { name: 'Education' }).click();

  expect(getByText(/Performance, quality and school availability at a glance\./i)).toBeInTheDocument();
  expect(getByText(/London comparison · 33 boroughs/i)).toBeInTheDocument();
  expect(getByText('Academic performance')).toBeInTheDocument();
  expect(getByText('GCSE Attainment 8 — five-year trend')).toBeInTheDocument();
  expect(document.querySelector('svg[aria-label="Attainment 8 five-year trend for London boroughs"]')).not.toBeNull();
  expect(getByText(/Illustrative historical values/i)).toBeInTheDocument();
  const educationKpis = Array.from(document.querySelectorAll<HTMLElement>('.education-kpi'));
  expect(educationKpis).toHaveLength(5);
  expect(getComputedStyle(educationKpis[0]).borderRadius).toBe('13px');
  expect(getComputedStyle(educationKpis[0]).backgroundImage).toContain('linear-gradient');
  expect(educationKpis[2].querySelector('p')?.textContent).toBe('1 th');
  expect(educationKpis[3].querySelector('p')?.textContent).toBe('1 th');
  expect(educationKpis[4].querySelector('p')?.textContent).toBe('1 th');
  expect(educationKpis[2].textContent).toContain('Latest academic year');
  expect(educationKpis[3].textContent).toContain('Reading, writing & maths');
  expect(educationKpis[4].textContent).toContain('Good or Outstanding');
});

test('formats Education KPI ranks with the requested th suffix', async () => {
  const rankTwoBorough: BoroughApiResponse = {
    ...borough,
    educationComparisonData: [
      ...(borough.educationComparisonData ?? []),
      { boroughName: 'Barnet', totalSchools: 100, educationRank: 4, gcseAttainment8: 60, ks2ExpectedStandard: 75, ofstedGoodAndOutstanding: 90 },
    ],
  };
  const { getByRole } = await render(<BoroughInsightsPanel borough={rankTwoBorough} />);

  await getByRole('tab', { name: 'Education' }).click();

  const educationKpis = Array.from(document.querySelectorAll<HTMLElement>('.education-kpi'));
  expect(educationKpis[1].querySelector('p')?.textContent).toBe('8 th');
  expect(educationKpis[2].querySelector('p')?.textContent).toBe('2 th');
  expect(educationKpis[3].querySelector('p')?.textContent).toBe('2 th');
  expect(educationKpis[4].querySelector('p')?.textContent).toBe('2 th');
});

test('updates the education comparison line when a different borough is selected', async () => {
  const comparisonBorough: BoroughApiResponse = {
    ...borough,
    educationComparisonData: [
      ...(borough.educationComparisonData ?? []),
      { boroughName: 'Barnet', totalSchools: 100, educationRank: 4, gcseAttainment8: 60, ks2ExpectedStandard: 75, ofstedGoodAndOutstanding: 90 },
    ],
  };
  const { getByRole } = await render(<BoroughInsightsPanel borough={comparisonBorough} />);

  await getByRole('tab', { name: 'Education' }).click();
  const compareSelect = getByRole('combobox', { name: 'Compare education with borough' });
  await compareSelect.selectOptions('Hounslow');
  const hounslowSeries = document.querySelectorAll('svg[aria-label="Attainment 8 five-year trend for London boroughs"] polyline')[1].getAttribute('points');

  await compareSelect.selectOptions('Barnet');
  const barnetSeries = document.querySelectorAll('svg[aria-label="Attainment 8 five-year trend for London boroughs"] polyline')[1].getAttribute('points');

  expect(hounslowSeries).not.toBe(barnetSeries);
});

test('renders School Quality as a scrollable horizontal Ofsted ranking chart', async () => {
  const { getByRole, getByText } = await render(<BoroughInsightsPanel borough={borough} />);

  await getByRole('tab', { name: 'Education' }).click();
  await getByRole('tab', { name: 'School quality' }).click();

  expect(getByText('Ofsted school-quality ranking')).toBeInTheDocument();
  expect(getByText(/London boroughs ranked by the percentage of schools rated Good or Outstanding/i)).toBeInTheDocument();
  expect(document.querySelector('svg[aria-label="London boroughs ranked by Ofsted Good or Outstanding percentage"]')).not.toBeNull();
  expect(getByText(/Illustrative ranking — confirm a consistent inspection period/i)).toBeInTheDocument();
});

test('renders School Availability with real funding totals and phase counts', async () => {
  const { getByRole, getByText } = await render(<BoroughInsightsPanel borough={borough} />);

  await getByRole('tab', { name: 'Education' }).click();
  await getByRole('tab', { name: 'School availability' }).click();

  expect(getByText('School availability by phase and funding type')).toBeInTheDocument();
  expect(getByText('95', { exact: true })).toBeInTheDocument();
  expect(getByText('82', { exact: true })).toBeInTheDocument();
  expect(getByText('13', { exact: true })).toBeInTheDocument();
  expect(document.querySelector('svg[aria-label="Publicly funded schools by phase in Bromley"]')).not.toBeNull();
  expect(getByText('Nursery: 4 publicly funded schools')).toBeInTheDocument();
  expect(getByText('Primary: 58 publicly funded schools')).toBeInTheDocument();
  expect(getByText('Secondary: 20 publicly funded schools')).toBeInTheDocument();
  expect(getByText(/Independent schools are shown as a borough total/i)).toBeInTheDocument();
  const secondaryBar = document.querySelector<SVGRectElement>('rect[aria-label="Secondary: 20 state-funded schools"]');
  expect(secondaryBar).not.toBeNull();
  secondaryBar?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toContain('Independent phase count unavailable');
  await expect.poll(() => document.querySelector('[role="tooltip"]')?.textContent).toContain('Borough independent total: 13');
});

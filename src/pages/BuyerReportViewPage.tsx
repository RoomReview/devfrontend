import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { boroughService } from '../services/borough.service';
import { annualizeQuarterlyData } from '../utils/reportGenerator';
import { BuyerInsightReportFigma } from './BuyerInsightReportFigma';
import type { BuyerInsightReportData } from './BuyerInsightReport.types';

type TrendData = {
  priceHistory: BuyerInsightReportData['priceTrends']['priceHistory'];
  rentHistory: NonNullable<BuyerInsightReportData['rentalContext']['rentHistory']>;
};

export const BuyerReportViewPage: React.FC = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const state = location.state as { reportData?: BuyerInsightReportData; printAfterLoad?: boolean; downloadAfterLoad?: boolean } | undefined;
  const reportData = state?.reportData;
  const [trendData, setTrendData] = useState<TrendData>({ priceHistory: [], rentHistory: [] });
  const preparedForName = !loading && user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '';

  useEffect(() => {
    if (!state?.printAfterLoad || !reportData || loading) return;
    const timeoutId = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timeoutId);
  }, [state?.printAfterLoad, reportData, loading]);

  useEffect(() => {
    if (!reportData) {
      setTrendData({ priceHistory: [], rentHistory: [] });
      return;
    }

    let cancelled = false;
    const reportPriceHistory = reportData.priceTrends?.priceHistory ?? [];
    const reportRentHistory = reportData.rentalContext?.rentHistory ?? [];
    setTrendData({ priceHistory: reportPriceHistory, rentHistory: reportRentHistory });

    const loadTrendData = async () => {
      if (reportPriceHistory.length && reportRentHistory.length) return;

      const areaName = reportData.meta.areaName;
      const boroughs = await boroughService.getAll();
      const normalizedAreaName = areaName.toLowerCase();
      const boroughMatch = boroughs.find((borough) => borough.name.toLowerCase() === normalizedAreaName)
        ?? (normalizedAreaName.includes('canary wharf')
          ? boroughs.find((borough) => borough.name.toLowerCase() === 'tower hamlets')
          : undefined);
      if (!boroughMatch) return;

      const borough = await boroughService.getById(boroughMatch.boroughId);
      const priceHistory = reportPriceHistory?.length
        ? reportPriceHistory
        : annualizeQuarterlyData(borough.priceTrendData ?? []).map(({ year, value }) => ({ year, priceThousands: value / 1000 }));
      const rentHistory = reportRentHistory?.length
        ? reportRentHistory
        : annualizeQuarterlyData(borough.rentTrendData ?? []).map(({ year, value }) => ({ year, avgRentPcm: value }));

      if (!cancelled) setTrendData({ priceHistory, rentHistory });
    };

    void loadTrendData().catch(() => {
      if (!cancelled) setTrendData({ priceHistory: reportPriceHistory, rentHistory: reportRentHistory });
    });

    return () => {
      cancelled = true;
    };
  }, [location.state, reportData]);

  const handlePrintReport = () => {
    window.print();
  };

  const handleMethodologyClick = () => {
    console.log('Methodology clicked');
  };

  const handleSourceClick = (sourceId: string) => {
    console.log('Source clicked:', sourceId);
  };

  if (!reportData) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold text-[#1F2D3D]">No generated area report</h1>
        <p className="max-w-md text-sm text-slate-600">Submit the area report form to see postcode-specific data here.</p>
        <Link to="/report#form" className="text-sm font-semibold text-[#8B0000] underline">Go to area report form</Link>
      </main>
    );
  }

  return (
    <BuyerInsightReportFigma
      data={reportData}
      trendData={trendData}
      preparedForName={preparedForName}
      downloadAfterLoad={state?.downloadAfterLoad}
      onPrintReport={handlePrintReport}
      onMethodologyClick={handleMethodologyClick}
      onSourceClick={handleSourceClick}
    />
  );
};

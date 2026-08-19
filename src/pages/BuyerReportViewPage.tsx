import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BuyerInsightReport } from './BuyerInsightReport';
import type { BuyerInsightReportData } from './BuyerInsightReport.types';

export const BuyerReportViewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<BuyerInsightReportData | null>(null);

  useEffect(() => {
    const state = location.state as { reportData?: BuyerInsightReportData };
    
    if (state?.reportData) {
      setReportData(state.reportData);
    } else {
      navigate('/report', { replace: true });
    }
  }, [location, navigate]);

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
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-[#516078]">No report data available</p>
          <button
            onClick={() => navigate('/report', { replace: true })}
            className="mt-4 rounded-full bg-[#8B0000] px-6 py-2 text-sm font-semibold text-white hover:bg-[#6f0000]"
          >
            Back to Report Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <BuyerInsightReport
      data={reportData}
      onPrintReport={handlePrintReport}
      onMethodologyClick={handleMethodologyClick}
      onSourceClick={handleSourceClick}
    />
  );
};

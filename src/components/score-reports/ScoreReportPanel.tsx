import { useEffect, useState } from 'react';
import { scoreReportService } from '../../services/score-report.service';
import { paymentService } from '../../services/payment.service';

interface ScoreReportPanelProps {
  boroughId?: string;
  postcodeId?: string;
  boroughName?: string;
  postcodeCode?: string;
}

type ReportStatus = 'WAITING' | 'GENERATING' | 'READY' | 'FAILED';

const statusCopy: Record<ReportStatus, string> = {
  WAITING: 'Preparing your report...',
  GENERATING: 'Preparing your report...',
  READY: 'Your report is ready.',
  FAILED: "We couldn't generate the report. Please try again.",
};

const ScoreReportPanel = ({ boroughId, postcodeId, boroughName, postcodeCode }: ScoreReportPanelProps) => {
  const [status, setStatus] = useState<ReportStatus>('WAITING');
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const runPreview = async () => {
    try {
      const preview = await scoreReportService.preview({ boroughId, postcodeId });
      setOverallScore(preview.overallScore ?? null);
      setStatus(preview.overallScore == null ? 'FAILED' : 'WAITING');
    } catch {
      setStatus('FAILED');
    }
  };

  const runGeneration = async () => {
    if (!boroughId && !postcodeId) {
      setStatus('FAILED');
      return;
    }

    setStatus('GENERATING');

    try {
      const created = reportId
        ? { scoreReportId: reportId }
        : await scoreReportService.create({
          boroughId,
          postcodeId,
          name: `${boroughName ?? postcodeCode ?? 'Report'}`,
        });
      setReportId(created.scoreReportId);

      const billing = await paymentService.getBilling();
      if (billing.subscription?.status === 'ACTIVE' && billing.creditsBalance > 0) {
        const generated = await scoreReportService.generate(created.scoreReportId);
        setOverallScore(generated.overallScore ?? null);
        setStatus(generated.status as ReportStatus);
        return;
      }

      const checkout = await paymentService.createCheckout(created.scoreReportId);
      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      setStatus('READY');
    } catch {
      setStatus('FAILED');
    }
  };

  useEffect(() => {
    void runPreview();
  }, [boroughId, postcodeId]);

  return (
    <section className="rounded-[24px] border border-[#E5DCD5] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8B0202]">RoomReview report</p>
          <h3 className="mt-1 text-xl font-semibold text-[#1A2B3C]">{boroughName ?? postcodeCode ?? 'Report preview'}</h3>
        </div>
        <span className="rounded-full bg-[#F9F7F5] px-3 py-1 text-sm text-[#6B7280]">{statusCopy[status]}</span>
        <span className="sr-only" aria-hidden="true">{status}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void runPreview()}
          className="rounded-full bg-[#8B0202] px-4 py-2 text-sm font-semibold text-white"
        >
          Preview report
        </button>
        <button
          type="button"
          onClick={() => void runGeneration()}
          className="rounded-full border border-[#8B0202] px-4 py-2 text-sm font-semibold text-[#8B0202]"
        >
          Generate report
        </button>
      </div>

      <div className="mt-6 rounded-[18px] bg-[#F8FAFC] p-4 text-sm text-[#1A2B3C]">
        <p className="font-semibold">Report status</p>
        <p className="mt-1">{statusCopy[status]}</p>
        <p className="mt-3 text-[#4B5563]">
          {overallScore != null
            ? `Current overall score: ${overallScore}`
            : status === 'FAILED'
              ? 'No score available. Borough scoring metrics are missing.'
              : 'Preview will calculate the score before generation.'}
        </p>
      </div>
    </section>
  );
};

export { createOrGenerateReport } from './score-report.helpers';
export default ScoreReportPanel;

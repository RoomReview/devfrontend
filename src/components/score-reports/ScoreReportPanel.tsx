import { useEffect, useState } from 'react';
import { scoreReportService } from '../../services/score-report.service';
import { createOrGenerateReport } from './score-report.helpers';

interface ScoreReportPanelProps {
  boroughId?: string;
  postcodeId?: string;
  boroughName?: string;
  postcodeCode?: string;
}

type ReportStatus = 'WAITING' | 'GENERATING' | 'READY' | 'FAILED';

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
      const generated = await createOrGenerateReport({
        reportId,
        boroughId,
        postcodeId,
        boroughName,
        postcodeCode,
      });

      setReportId(generated.scoreReportId);
      setOverallScore(generated.overallScore ?? null);
      setStatus(generated.status as ReportStatus);
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
        <span className="rounded-full bg-[#F9F7F5] px-3 py-1 text-sm text-[#6B7280]">{status}</span>
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
        <p className="font-semibold">Status workflow</p>
        <p className="mt-1">Waiting → Generating → Ready → Failed</p>
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

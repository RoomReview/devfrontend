import { describe, it, expect, vi } from 'vitest';
import { createOrGenerateReport } from '../src/components/score-reports/score-report.helpers';

describe('createOrGenerateReport', () => {
  it('uses the newly created report id for the first generation request', async () => {
    const create = vi.fn().mockResolvedValue({ scoreReportId: 'new-report-id' });
    const generate = vi.fn().mockResolvedValue({ scoreReportId: 'new-report-id', status: 'READY' });

    await createOrGenerateReport({
      reportId: null,
      boroughId: 'borough-1',
      postcodeId: undefined,
      service: { create, generate } as unknown as typeof import('../src/services/score-report.service').scoreReportService,
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledWith('new-report-id');
  });
});

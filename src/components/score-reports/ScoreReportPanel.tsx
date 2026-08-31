import { scoreReportService } from '../../services/score-report.service';

export const createOrGenerateReport = async ({
  reportId,
  boroughId,
  postcodeId,
  boroughName,
  postcodeCode,
  service = scoreReportService,
}: {
  reportId: string | null;
  boroughId?: string;
  postcodeId?: string;
  boroughName?: string;
  postcodeCode?: string;
  service?: typeof scoreReportService;
}) => {
  let currentReportId = reportId;

  if (!currentReportId) {
    const created = await service.create({
      boroughId,
      postcodeId,
      name: `${boroughName ?? postcodeCode ?? 'Report'}`,
    });
    currentReportId = created.scoreReportId;
  }

  if (!currentReportId) {
    throw new Error('Unable to create a report');
  }

  return service.generate(currentReportId);
};


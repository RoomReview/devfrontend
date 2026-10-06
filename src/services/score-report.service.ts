import apiClient from '../lib/apiClient';

interface ScoreReportCreatePayload {
  boroughId?: string;
  postcodeId?: string;
  name?: string;
  description?: string;
  reportData?: object;
}

interface ScoreReportCreateResponse {
  scoreReportId: string;
  status: string;
  overallScore?: number | null;
  boroughScore?: number | null;
  postcodeScore?: number | null;
}

interface ScoreReportPreviewResponse {
  borough?: string | null;
  postcode?: string | null;
  overallScore?: number | null;
  boroughScore?: number | null;
  postcodeScore?: number | null;
  scoreBreakdown?: Record<string, unknown>;
  preview?: Record<string, unknown>;
}

interface ScoreReportGenerationResponse extends ScoreReportCreateResponse {}

export interface UserScoreReport {
  scoreReportId: string;
  name: string | null;
  status: 'WAITING' | 'GENERATING' | 'READY' | 'FAILED';
  overallScore: number | null;
  createdAt: string;
  hasFullReport: boolean;
  order: { orderId: string; status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' } | null;
}

export interface UserScoreReportPage {
  reports: UserScoreReport[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface StoredScoreReport {
  scoreReportId: string;
  status: 'WAITING' | 'GENERATING' | 'READY' | 'FAILED';
  reportData: Record<string, unknown> | null;
}

export const scoreReportService = {
  listMine: async (page = 1, limit = 5): Promise<UserScoreReportPage> => {
    const response = await apiClient.get<{ data: UserScoreReportPage }>('/score-reports/mine', {
      params: { page, limit },
    });
    return response.data.data;
  },

  get: async (id: string): Promise<StoredScoreReport> => {
    const response = await apiClient.get<{ data: StoredScoreReport }>(`/score-reports/${id}`);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/score-reports/${id}`);
  },

  create: async (data: ScoreReportCreatePayload): Promise<ScoreReportCreateResponse> => {
    const response = await apiClient.post<{ data: ScoreReportCreateResponse }>('/score-reports', data);
    return response.data.data;
  },

  preview: async (data: { boroughId?: string; postcodeId?: string }): Promise<ScoreReportPreviewResponse> => {
    const response = await apiClient.post<{ data: ScoreReportPreviewResponse }>('/score-reports/preview', data);
    return response.data.data;
  },

  generate: async (id: string): Promise<ScoreReportGenerationResponse> => {
    const response = await apiClient.post<{ data: ScoreReportGenerationResponse }>(`/score-reports/${id}/generate`);
    return response.data.data;
  },

  createAndGenerateForPostcode: async (
    postcodeCode: string,
    reportType: 'buyer' | 'investor',
    reportData: object,
  ): Promise<void> => {
    const normalizedPostcode = postcodeCode.toUpperCase().replace(/\s+/g, '');
    const postcodeResponse = await apiClient.get<{
      data: { postcodeId?: string; postcode_id?: string; boroughId?: string; borough_id?: string };
    }>(`/postcodes/code/${encodeURIComponent(normalizedPostcode)}`);
    const postcode = postcodeResponse.data.data;
    const postcodeId = postcode.postcodeId ?? postcode.postcode_id;
    const boroughId = postcode.boroughId ?? postcode.borough_id;

    if (!postcodeId) {
      throw new Error('Unable to associate the report with a postcode.');
    }

    const report = await scoreReportService.create({
      postcodeId,
      boroughId,
      name: `${reportType === 'buyer' ? 'Area' : 'Investor'} report for ${normalizedPostcode}`,
      reportData: { ...reportData, reportType },
    });
    await scoreReportService.generate(report.scoreReportId);
  },
};

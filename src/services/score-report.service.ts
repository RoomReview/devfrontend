import apiClient from '../lib/apiClient';

interface ScoreReportCreatePayload {
  boroughId?: string;
  postcodeId?: string;
  name?: string;
  description?: string;
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

export const scoreReportService = {
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
};

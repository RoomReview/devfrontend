import apiClient from '@/lib/apiClient';

export interface VotingDataRecord {
  voting_data_id?: string;
  borough: string;
  year: number;
  party: string;
  percentage: number | string;
  source: string;
  seats?: number | null;
}

const councilSeatTotals: Record<string, number> = {
  'barking and dagenham': 51,
  barnet: 63,
  bexley: 45,
  brent: 57,
  bromley: 58,
  camden: 55,
  croydon: 70,
  ealing: 70,
  enfield: 63,
  greenwich: 55,
  hackney: 57,
  'hammersmith and fulham': 50,
  haringey: 57,
  harrow: 55,
  havering: 55,
  hillingdon: 53,
  hounslow: 62,
  islington: 51,
  'kensington and chelsea': 50,
  'kingston upon thames': 48,
  lambeth: 63,
  lewisham: 54,
  merton: 57,
  newham: 66,
  redbridge: 63,
  'richmond upon thames': 54,
  southwark: 63,
  sutton: 55,
  'tower hamlets': 45,
  'waltham forest': 60,
  wandsworth: 58,
  westminster: 54,
};

export const getCouncilSeatTotal = (borough: string): number | undefined =>
  councilSeatTotals[borough.trim().toLowerCase()];

export const votingDataService = {
  getByBorough: async (borough: string): Promise<VotingDataRecord[]> => {
    const response = await apiClient.get<{ data: VotingDataRecord[] | null }>('/data/voting', {
      params: { borough },
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};

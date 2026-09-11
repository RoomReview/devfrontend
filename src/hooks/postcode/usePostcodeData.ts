import { useQuery } from '@tanstack/react-query';
import { postcodeService } from '@/services/postcode.service';
import { queryKeys } from '@/lib/queryKeys';
import type { PostcodeApiResponse } from '@/types/postcode.types';

const mockPostcodeResponses: Record<string, PostcodeApiResponse> = {
  'E1 6AN': {
    postcode: {
      postcode_id: 'e16an',
      code: 'E1 6AN',
      outcode: 'E1',
      incode: '6AN',
      latitude: 51.5195,
      longitude: -0.0713,
      metrics: {
        reviewScore: 86,
        safe: true,
      },
      boroughId: 'tower-hamlets',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    borough: {
      boroughId: 'tower-hamlets',
      name: 'Tower Hamlets',
      slug: 'tower-hamlets',
      description: 'A vibrant east London borough with strong transport links and a diverse local community.',
      image: null,
      latitude: 51.5200,
      longitude: -0.0720,
      metrics: {
        population: 324000,
      },
    },
    crimeData: [
      { label: 'Crime 1', crime_rate: 20 },
      { label: 'Crime 2', crime_rate: 24 },
      { label: 'Crime 3', crime_rate: 40 },
      { label: 'Crime 4', crime_rate: 50 },
      { label: 'Crime 5', crime_rate: 80 },
      { label: 'Crime 6', crime_rate: 70 },
      { label: 'Others', crime_rate: 30 },
    ],
    demography: [
      { age_group: '0-9', percentage: 8 },
      { age_group: '10-19', percentage: 12 },
      { age_group: '20-29', percentage: 18 },
      { age_group: '30-39', percentage: 20 },
      { age_group: '40-49', percentage: 16 },
      { age_group: '50-59', percentage: 12 },
      { age_group: '60+', percentage: 14 },
    ],
    propertyValueData: [],
    rentData: [
      { rent: 1850, type: 'average' },
      { rent: 2150, type: 'high' },
      { rent: 1550, type: 'low' },
    ],
    votingData: [
      { label: 'Turnout', percentage: 64 }],
    educationData: [],
    housingStockData: [],
    districtData: [],
  },
};

export const usePostcodeData = (postcode: string) => {
  const normalizedCode = postcode.trim().toUpperCase();

  return useQuery<PostcodeApiResponse>({
    queryKey: queryKeys.postcode(normalizedCode),
    queryFn: async () => {
      try {
        return await postcodeService.getByCode(normalizedCode);
      } catch (error) {
        if (mockPostcodeResponses[normalizedCode]) {
          return mockPostcodeResponses[normalizedCode];
        }

        throw error;
      }
    },
    enabled: Boolean(normalizedCode),
    staleTime: 1000 * 60 * 5,
  });
};

import { annualizeQuarterlyData } from '@/utils/reportGenerator';
import type { BoroughApiResponse } from '@/types/borough.types';

const rentFieldByPropertyType: Record<string, keyof NonNullable<BoroughApiResponse['rentTrendData']>[number]> = {
  ALL: 'rentAll',
  AVERAGE: 'rentAll',
  '1-BED': 'rentOneBed',
  '2-BED': 'rentTwoBed',
  '3-BED': 'rentThreeBed',
  '4+-BED': 'rentFourPlusBed',
};

export const getBoroughRentTrend = (
  rentTrendData: BoroughApiResponse['rentTrendData'],
  propertyType: string,
) => {
  const selectedRentField = rentFieldByPropertyType[propertyType.toUpperCase()];
  if (!selectedRentField || !rentTrendData?.length) return [];

  return annualizeQuarterlyData(
    rentTrendData.map((point) => ({
      year: point.year,
      value: point[selectedRentField] ?? (selectedRentField === 'rentAll' ? point.value : undefined),
    })),
  );
};

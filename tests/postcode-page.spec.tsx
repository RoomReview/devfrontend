import { test, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostcodePage from '../src/pages/PostcodePage';

const {
  mockUsePostcodeData,
  mockUsePostcodeReviews,
  mockAuth,
  mockCreateReview,
  mockInvalidateQueries,
} = vi.hoisted(() => ({
  mockUsePostcodeData: vi.fn(),
  mockUsePostcodeReviews: vi.fn(),
  mockAuth: { loading: false, isAuthenticated: false },
  mockCreateReview: vi.fn(),
  mockInvalidateQueries: vi.fn(),
}));

vi.mock('@/hooks/postcode/usePostcodeData', () => ({
  usePostcodeData: (...args: unknown[]) => mockUsePostcodeData(...args),
}));

vi.mock('@/hooks/reviews/useReviews', () => ({
  usePostcodeReviews: (...args: unknown[]) => mockUsePostcodeReviews(...args),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('@/services/review.service', () => ({
  reviewService: { create: mockCreateReview },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

beforeEach(() => {
  mockUsePostcodeData.mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  });
  mockUsePostcodeReviews.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  });
  mockAuth.loading = false;
  mockAuth.isAuthenticated = false;
  mockCreateReview.mockReset();
  mockInvalidateQueries.mockReset();
});

test('shows the postcode being reviewed', async () => {
  mockUsePostcodeData.mockReturnValue({
    data: {
      postcode: { postcodeId: 'pc-1', code: 'E1 6AN' },
      rentData: [],
      demography: [],
      crimeData: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  });

  const { getByLabelText } = await render(
    <MemoryRouter initialEntries={['/postcode/E1%206AN']}>
      <Routes>
        <Route path="/postcode/:postcode" element={<PostcodePage />} />
      </Routes>
    </MemoryRouter>,
  );

  await expect(getByLabelText(/postcode for this review/i)).toHaveValue('E1 6AN');
});

test('submits a rated review for the current postcode', async () => {
  mockAuth.isAuthenticated = true;
  mockCreateReview.mockResolvedValue({ review_id: 'review-1' });
  mockUsePostcodeData.mockReturnValue({
    data: {
      postcode: { postcodeId: 'pc-1', code: 'E1 6AN', boroughId: 'borough-1' },
      rentData: [],
      demography: [],
      crimeData: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  });

  const { getByLabelText, getByRole, getByText } = await render(
    <MemoryRouter initialEntries={['/postcode/E1%206AN']}>
      <Routes>
        <Route path="/postcode/:postcode" element={<PostcodePage />} />
      </Routes>
    </MemoryRouter>,
  );

  await getByRole('button', { name: '5 out of 5 for safety' }).click();
  await getByRole('button', { name: '4 out of 5 for transport' }).click();
  await getByRole('button', { name: '3 out of 5 for amenities' }).click();
  await getByRole('button', { name: '4 out of 5 for value for money' }).click();
  await getByLabelText('Review title').fill('A lovely place');
  await getByLabelText('Write your review').fill('I have enjoyed living in this area.');
  await getByLabelText('Stay anonymous').click();
  await getByRole('button', { name: 'Submit review' }).click();

  await expect(getByText(/Your review was submitted and is awaiting moderation/i)).toBeInTheDocument();
  expect(mockCreateReview).toHaveBeenCalledWith(expect.objectContaining({
    title: 'A lovely place',
    content: 'I have enjoyed living in this area.',
    safety_rating: 5,
    transport_rating: 4,
    amenities_rating: 3,
    value_rating: 4,
    anonymous: true,
    postcode_id: 'pc-1',
    borough_id: 'borough-1',
  }));
  expect(mockInvalidateQueries).toHaveBeenCalledWith({
    queryKey: ['reviews', 'postcode', 'pc-1'],
  });
});

test('renders the total crime value with the percentage-style display used by the card', async () => {
  mockUsePostcodeData.mockReturnValue({
    data: {
      postcode: {
        postcodeId: 'pc-1',
        boroughId: 'borough-1',
        outcode: 'E1',
        latitude: 51.515,
        longitude: -0.072,
      },
      rentData: [],
      demography: [],
      crimeData: [
        { label: 'Total crimes per 1,000', crime_rate: 118.7 },
        { label: 'Violent crime', crime_rate: 14.2 },
        { label: 'Burglary', crime_rate: 5.3 },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
  });

  const { getByText } = await render(
    <MemoryRouter initialEntries={['/postcode/E1%206AN']}>
      <Routes>
        <Route path="/postcode/:postcode" element={<PostcodePage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(getByText(/Total crimes per 1,000/i)).toBeInTheDocument();
  expect(document.body.textContent).toContain('11.9%');
  expect(document.body.textContent).toContain('12.0%');
});

test('renders the postcode demographics returned from LSOA data', async () => {
  mockUsePostcodeData.mockReturnValue({
    data: {
      postcode: {
        postcodeId: 'pc-1',
        code: 'E2 8AA',
        outcode: 'E2',
        latitude: 51.527,
        longitude: -0.06,
      },
      rentData: [],
      demography: [
        { age_group: '20-29', female_percentage: 23.1, male_percentage: 23.2, period: null },
        { age_group: '30-39', female_percentage: 13.1, male_percentage: 13.1, period: null },
      ],
      crimeData: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  });

  const { getByText } = await render(
    <MemoryRouter initialEntries={['/postcode/E2%208AA']}>
      <Routes>
        <Route path="/postcode/:postcode" element={<PostcodePage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(getByText('20-29', { exact: true })).toBeInTheDocument();
  expect(getByText('Latest available')).toBeInTheDocument();
  expect(document.querySelector('svg[aria-label="Population by age group and sex"]')).not.toBeNull();
  expect(document.querySelectorAll('svg[aria-label="Population by age group and sex"] rect[fill="#F3E6E1"]')).toHaveLength(2);
  expect(document.querySelectorAll('svg[aria-label="Population by age group and sex"] rect[fill="#8B0000"]')).toHaveLength(2);
  expect(document.body.textContent).not.toContain('Demographic data unavailable for this postcode.');
});

test('renders a signed LSOA image with its generated postcode marker', async () => {
  mockUsePostcodeData.mockReturnValue({
    data: {
      postcode: {
        postcode_id: 'pc-1',
        code: 'E1 6AN',
        outcode: 'E1',
        incode: '6AN',
        latitude: 51.5195,
        longitude: -0.0713,
        image_url: 'https://cdn.example.test/postcode-overlays/E1-6AN.svg',
      },
      lsoaMap: {
        filename: 'E01000001_2026-09.webp',
        mapVersion: '2026-09',
        imageUrl: 'https://roomreview-lsoa-maps.lon1.digitaloceanspaces.com/E01000001_2026-09.webp?X-Amz-Signature=test',
        imageWidthPx: 1280,
        imageHeightPx: 800,
        minLon: -0.08,
        maxLon: -0.06,
        minLat: 51.51,
        maxLat: 51.53,
      },
      rentData: [],
      demography: [],
      crimeData: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  });

  const { getByRole } = await render(
    <MemoryRouter initialEntries={['/postcode/E1%206AN']}>
      <Routes>
        <Route path="/postcode/:postcode" element={<PostcodePage />} />
      </Routes>
    </MemoryRouter>,
  );

  expect(getByRole('img', { name: /LSOA map with searched postcode E1 6AN marked/i })).toBeInTheDocument();
  expect(document.querySelector<HTMLImageElement>('img[src*="X-Amz-Signature=test"]')).not.toBeNull();
});

test('generates a coordinate-aligned postcode SVG when no stored overlay URL exists', async () => {
  mockUsePostcodeData.mockReturnValue({
    data: {
      postcode: {
        postcodeId: 'pc-2',
        code: 'E2 8AA',
        outcode: 'E2',
        incode: '8AA',
        latitude: 51.527,
        longitude: -0.075,
      },
      lsoaMap: {
        filename: 'E01000001_2026-09.webp',
        mapVersion: '2026-09',
        imageUrl: 'https://roomreview-lsoa-maps.lon1.digitaloceanspaces.com/E01000001_2026-09.webp?X-Amz-Signature=test',
        imageWidthPx: 1280,
        imageHeightPx: 800,
        minLon: -0.1,
        maxLon: -0.05,
        minLat: 51.5,
        maxLat: 51.54,
      },
      rentData: [],
      demography: [],
      crimeData: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  });

  await render(
    <MemoryRouter initialEntries={['/postcode/E2%208AA']}>
      <Routes>
        <Route path="/postcode/:postcode" element={<PostcodePage />} />
      </Routes>
    </MemoryRouter>,
  );

  const baseMap = document.querySelector<HTMLImageElement>('img[src*="X-Amz-Signature=test"]');
  const marker = document.querySelector<SVGSVGElement>('svg[viewBox="0 0 1280 800"]');
  expect(baseMap).not.toBeNull();
  expect(marker?.querySelector('g')?.getAttribute('transform')).toBe('translate(640.0,260.0)');
  expect(marker?.querySelector('path')?.getAttribute('fill')).toBe('#3b82f6');
});


import { test, expect, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostcodePage from '../src/pages/PostcodePage';

const mockUsePostcodeData = vi.fn();

vi.mock('@/hooks/postcode/usePostcodeData', () => ({
  usePostcodeData: (...args: unknown[]) => mockUsePostcodeData(...args),
}));

beforeEach(() => {
  mockUsePostcodeData.mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  });
});

test('renders a full postcode dropdown in the review form', async () => {
  const { getByLabelText } = await render(
    <MemoryRouter initialEntries={['/postcode/E1%206AN']}>
      <Routes>
        <Route path="/postcode/:postcode" element={<PostcodePage />} />
      </Routes>
    </MemoryRouter>,
  );

  await expect(getByLabelText(/choose your full postcode/i)).toBeInTheDocument();
});

test('renders the total crime value with the percentage-style display used by the card', async () => {
  mockUsePostcodeData.mockReturnValue({
    data: {
      postcode: {
        postcode_id: 'pc-1',
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

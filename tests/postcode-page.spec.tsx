import { test, expect, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostcodePage from '../src/pages/PostcodePage';

vi.mock('@/hooks/postcode/usePostcodeData', () => ({
  usePostcodeData: () => ({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

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

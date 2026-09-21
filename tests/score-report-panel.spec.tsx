import { test, expect } from 'vitest';
import { render } from 'vitest-browser-react';
import { createElement } from 'react';
import ScoreReportPanel from '../src/components/score-reports/ScoreReportPanel.tsx';

test('renders the score report workflow controls', async () => {
  const { getByText } = await render(
    createElement(ScoreReportPanel, {
      boroughId: 'borough-1',
      postcodeId: 'postcode-1',
      boroughName: 'Brixton',
      postcodeCode: 'SW9 6DE',
    }),
  );

  await expect(getByText(/preview report/i)).toBeInTheDocument();
  await expect(getByText(/generate report/i)).toBeInTheDocument();
  await expect(getByText(/^WAITING$/i)).toBeInTheDocument();
});

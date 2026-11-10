import { screen, waitFor } from '@testing-library/react';
import Analytics from '../Analytics';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import type { ReactNode } from 'react';

vi.mock('recharts', () => {
  const Wrapper = ({ children }: { children: ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: Wrapper,
    AreaChart: Wrapper,
    Area: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
    BarChart: Wrapper,
    Bar: () => null,
  };
});

describe('Analytics Page', () => {
  it('renders analytics metrics from workspace candidates', async () => {
    renderWithProviders(<Analytics />);
    
    await waitFor(() => {
      expect(screen.getByText(/Candidates added by month/i)).toBeInTheDocument();
      expect(screen.getByText(/Most common extracted skills/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state when the workspace has no candidates', async () => {
    server.use(http.get('*/api/v1/candidates', () => HttpResponse.json([])));
    renderWithProviders(<Analytics />);
    expect(await screen.findByText(/Analytics will appear after resumes have been analyzed/i)).toBeInTheDocument();
  });

  it('shows a retry action after analytics data fails to load', async () => {
    server.use(http.get('*/api/v1/candidates', () => HttpResponse.json({ detail: 'unavailable' }, { status: 500 })));
    renderWithProviders(<Analytics />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Analytics could not load/i);
    expect(screen.getByRole('button', { name: /Retry/i })).toBeEnabled();
  });
});

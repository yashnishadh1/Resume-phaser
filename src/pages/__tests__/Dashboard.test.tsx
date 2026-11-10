import { screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('Dashboard Page', () => {
  it('renders dashboard metrics', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for the mocked React Query data to load and render
    await waitFor(() => {
      expect(screen.getByText(/Total Candidates/i)).toBeInTheDocument();
      expect(screen.getByText(/Welcome, there/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state and a working upload action when there are no candidates', async () => {
    server.use(http.get('*/api/v1/candidates', () => HttpResponse.json([])));
    renderWithProviders(<Dashboard />);
    expect(await screen.findByText(/No candidates yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload your first resume/i })).toBeInTheDocument();
  });

  it('shows a retry action after the candidate API fails', async () => {
    server.use(http.get('*/api/v1/candidates', () => HttpResponse.json({ detail: 'unavailable' }, { status: 500 })));
    renderWithProviders(<Dashboard />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load dashboard data/i);
    expect(screen.getByRole('button', { name: /Retry/i })).toBeEnabled();
  });
});

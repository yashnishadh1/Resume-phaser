import { screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect } from 'vitest';

describe('Dashboard Page', () => {
  it('renders dashboard metrics', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for the mocked React Query data to load and render
    await waitFor(() => {
      expect(screen.getByText(/Total Candidates/i)).toBeInTheDocument();
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });
});

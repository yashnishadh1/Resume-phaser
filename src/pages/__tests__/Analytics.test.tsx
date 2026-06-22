import { screen } from '@testing-library/react';
import Analytics from '../Analytics';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect } from 'vitest';

describe('Analytics Page', () => {
  it('renders analytics metrics correctly', () => {
    renderWithProviders(<Analytics />);
    
    expect(screen.getByText(/Candidate Growth/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Skills Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Parsing Accuracy/i)).toBeInTheDocument();
    expect(screen.getByText(/98.5%/i)).toBeInTheDocument();
  });
});

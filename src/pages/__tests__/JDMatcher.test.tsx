import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JDMatcher from '../JDMatcher';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect, vi } from 'vitest';

describe('JDMatcher Page', () => {
  it('handles matching workflow and API success', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JDMatcher />);
    
    const textArea = screen.getByPlaceholderText(/Paste the full job description here/i);
    await user.type(textArea, 'test');
    
    const matchButton = screen.getByRole('button', { name: /Find Matches/i });
    await user.click(matchButton);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles API failure state', async () => {
    const user = userEvent.setup();
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithProviders(<JDMatcher />);
    
    const textArea = screen.getByPlaceholderText(/Paste the full job description here/i);
    await user.type(textArea, 'error');
    
    const matchButton = screen.getByRole('button', { name: /Find Matches/i });
    await user.click(matchButton);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to analyze Job Description. Please try again.');
    });
    
    alertMock.mockRestore();
  });
});

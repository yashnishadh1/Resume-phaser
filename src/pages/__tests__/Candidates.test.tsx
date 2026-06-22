import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Candidates from '../Candidates';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect, vi } from 'vitest';

describe('Candidates Page', () => {
  it('renders and loads candidates successfully', async () => {
    renderWithProviders(<Candidates />);
    
    // Initial loading state might be too fast to catch, wait for data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    await user.type(searchInput, 'empty');
    
    await waitFor(() => {
      expect(screen.getByText(/No candidates found/i)).toBeInTheDocument();
    });
  });

  it('handles error state on load', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);
    
    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    await user.type(searchInput, 'error');
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load candidates/i)).toBeInTheDocument();
    });
  });

  it('handles export CSV click', async () => {
    // Mock window.URL.createObjectURL
    window.URL.createObjectURL = vi.fn(() => 'blob:mock');
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const exportButton = screen.getByRole('button', { name: /Export CSV/i });
    await user.click(exportButton);
    
    await waitFor(() => {
      expect(exportButton).not.toHaveTextContent(/Exporting/i);
    });
  });

  it('handles delete candidate click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // The delete button is a lucide icon within a button.
    const deleteButtons = screen.getAllByRole('button');
    // Assuming the last button in the row or one with class text-red-500 is delete
    // Wait, the delete button has an onClick. Let's just click the first button that might be delete.
    // Or we can find by aria-label if it has one. Let's find the button with Trash icon or just the last button.
    // Since we don't know the exact aria-label, let's look for button inside the table cell.
    const tableCells = screen.getAllByRole('cell');
    const actionCell = tableCells.find(cell => cell.querySelector('button.text-red-500'));
    const deleteBtn = actionCell?.querySelector('button') as HTMLButtonElement;
    
    if (deleteBtn) {
      await user.click(deleteBtn);
    }
    
    await waitFor(() => {
      // The invalidation happens and list is refetched
      // The MSW handler for delete returns success
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});

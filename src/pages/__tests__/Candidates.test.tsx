import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Candidates from '../Candidates';
import { renderWithProviders } from '../../test/utils';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

afterEach(() => vi.restoreAllMocks());

describe('Candidates Page', () => {
  it('renders and loads candidates successfully', async () => {
    renderWithProviders(<Candidates />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles search input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);

    await user.type(screen.getByPlaceholderText(/Search by name/i), 'empty');
    await waitFor(() => expect(screen.getByText(/No candidates found/i)).toBeInTheDocument());
  });

  it('handles error state on load', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);

    await user.type(screen.getByPlaceholderText(/Search by name/i), 'error');
    await waitFor(() => expect(screen.getByText(/Failed to load candidates/i)).toBeInTheDocument());
  });

  it('exports candidates as CSV', async () => {
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock');
    const downloadClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    const exportButton = screen.getByRole('button', { name: /Export CSV/i });
    await user.click(exportButton);
    await waitFor(() => expect(exportButton).not.toHaveTextContent(/Exporting/i));
    expect(downloadClick).toHaveBeenCalledOnce();
  });

  it('renders the requested columns and filters candidates by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('columnheader').map((header) => header.textContent?.replace(/Sort by .*/, '').trim())).toEqual([
      '', 'Candidate Info', 'Applied Role', 'Experience', 'Match', 'Status', 'Actions',
    ]);
    const johnRow = within(table).getByRole('row', { name: /John Doe/ });
    expect(within(johnRow).getAllByRole('cell')).toHaveLength(7);
    expect(within(johnRow).getByText('Engineer')).toBeInTheDocument();
    expect(within(johnRow).getByText('5 years')).toBeInTheDocument();
    expect(within(johnRow).getByText('95%')).toBeInTheDocument();
    expect(within(johnRow).getByText('Completed')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.selectOptions(screen.getByRole('combobox', { name: /filter candidates by status/i }), 'Processing');
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('sorts rows and allows column visibility, page size and selection controls', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('Jane Smith');
    await user.click(screen.getByRole('button', { name: /Sort by candidate name/i }));
    expect(within(table).getAllByRole('row')[1]).toHaveTextContent('John Doe');
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('checkbox', { name: 'Match' }));
    expect(within(table).queryByRole('columnheader', { name: /Match/i })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '25');
    await user.click(screen.getByRole('checkbox', { name: 'Select Jane Smith' }));
    expect(screen.getByText('1 candidate selected')).toBeInTheDocument();
  });

  it('opens and closes a candidate profile from its row actions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Candidates />);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for John Doe' }));
    await user.click(screen.getByRole('button', { name: /View Profile/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent('John Doe');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('confirms a candidate delete action', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleteRequest = vi.fn();
    server.use(http.delete('*/api/v1/candidates/:id', ({ params }) => {
      deleteRequest(params.id);
      return HttpResponse.json({ status: 'success' });
    }));
    renderWithProviders(<Candidates />);

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for John Doe' }));
    await user.click(screen.getByRole('button', { name: /^Delete$/i }));
    expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete this candidate?');
    await waitFor(() => expect(deleteRequest).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  });
});

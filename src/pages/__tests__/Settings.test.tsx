import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('Settings Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates profile and shows success state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);
    
    const firstNameInput = await screen.findByLabelText(/First name/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Alice');
    
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
      expect(localStorage.getItem('userFirstName')).toBe('Alice');
    }, { timeout: 3000 });
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);
    
    await screen.findByLabelText(/First name/i);
    const securityTab = screen.getByRole('button', { name: /Security/i });
    await user.click(securityTab);
    
    expect(screen.getByText(/Change password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current password/i)).toBeInTheDocument();
  });

  it('rejects mismatched passwords and updates password after a successful server response', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);
    await user.click(screen.getByRole('button', { name: /Security/i }));
    await user.type(screen.getByLabelText(/Current password/i), 'OldP@ssword1');
    await user.type(screen.getByLabelText(/^New password/i), 'NewP@ssword1');
    await user.type(screen.getByLabelText(/Confirm new password/i), 'DifferentP@ss1');
    await user.click(screen.getByRole('button', { name: /Update password/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/do not match/i);

    await user.clear(screen.getByLabelText(/Confirm new password/i));
    await user.type(screen.getByLabelText(/Confirm new password/i), 'NewP@ssword1');
    await user.click(screen.getByRole('button', { name: /Update password/i }));
    expect(await screen.findByText(/Password changed/i)).toBeInTheDocument();
  });

  it('shows API errors when profile updates fail', async () => {
    server.use(http.patch('*/api/v1/auth/me', () => HttpResponse.json({ detail: 'Profile service unavailable' }, { status: 500 })));
    const user = userEvent.setup();
    renderWithProviders(<Settings />);
    const firstName = await screen.findByLabelText(/First name/i);
    await user.clear(firstName);
    await user.type(firstName, 'Taylor');
    await user.click(screen.getByRole('button', { name: /Save changes/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Profile service unavailable/i);
    expect(localStorage.getItem('userFirstName')).toBe('Jane');
  });
});

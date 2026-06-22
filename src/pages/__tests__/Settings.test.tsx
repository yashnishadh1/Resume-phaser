import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../Settings';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect, beforeEach } from 'vitest';

describe('Settings Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('updates profile and shows success state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);
    
    const firstNameInput = screen.getAllByRole('textbox')[0];
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Alice');
    
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveButton);
    
    expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
    
    // Wait for the simulated API call (1000ms)
    await waitFor(() => {
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
      expect(localStorage.getItem('userFirstName')).toBe('Alice');
    }, { timeout: 3000 });
  });

  it('switches between tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Settings />);
    
    const securityTab = screen.getByRole('button', { name: /Security/i });
    await user.click(securityTab);
    
    expect(screen.getByText(/Password Settings/i)).toBeInTheDocument();
    
    const notificationsTab = screen.getByRole('button', { name: /Notifications/i });
    await user.click(notificationsTab);
    
    expect(screen.getByText(/Notification Preferences/i)).toBeInTheDocument();
  });
});

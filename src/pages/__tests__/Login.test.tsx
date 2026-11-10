import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';
import { renderWithProviders } from '../../test/utils';
import { beforeEach, describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('Login Page', () => {
  beforeEach(() => localStorage.clear());
  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/name@company.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    });
  });

  it('shows an API authentication error without saving a session', async () => {
    server.use(http.post('*/api/v1/auth/login', () => HttpResponse.json({ detail: 'Incorrect email or password' }, { status: 400 })));
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    await user.type(screen.getByLabelText(/Email Address/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Incorrect email or password/i);
    expect(localStorage.getItem('token')).toBeNull();
  });
});

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../Register';
import { renderWithProviders } from '../../test/utils';
import { beforeEach, describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

describe('Register Page', () => {
  beforeEach(() => localStorage.clear());
  it('renders register form', () => {
    renderWithProviders(<Register />);
    
    expect(screen.getByPlaceholderText(/Jane Doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('handles successful registration submission', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Register />);
    
    const nameInput = screen.getByPlaceholderText(/Jane Doe/i);
    const emailInput = screen.getByPlaceholderText(/name@company.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(nameInput, 'Jane Doe');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
      expect(localStorage.getItem('userFirstName')).toBe('Jane');
    });
  });

  it('shows a useful registration validation error', async () => {
    server.use(http.post('*/api/v1/auth/register', () => HttpResponse.json({ detail: 'Email is already registered' }, { status: 400 })));
    const user = userEvent.setup();
    renderWithProviders(<Register />);
    await user.type(screen.getByLabelText(/Full Name/i), 'Taylor Example');
    await user.type(screen.getByLabelText(/Email Address/i), 'used@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'StrongP@ssw0rd1');
    await user.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Email is already registered/i);
    expect(localStorage.getItem('token')).toBeNull();
  });
});

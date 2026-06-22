import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import { describe, it, expect, beforeEach } from 'vitest';

describe('App Routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to login when unauthenticated', async () => {
    window.history.pushState({}, 'Dashboard', '/dashboard');
    render(<App />);
    
    // AuthLayout redirects to /login if there's no token
    // The App is lazy loaded, wait for the spinner to disappear and Login to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Initialize Session/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('allows access to protected routes when authenticated', async () => {
    localStorage.setItem('token', 'fake-token');
    window.history.pushState({}, 'Dashboard', '/dashboard');
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

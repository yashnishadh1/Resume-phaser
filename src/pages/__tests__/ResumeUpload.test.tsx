import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeUpload from '../ResumeUpload';
import { renderWithProviders } from '../../test/utils';
import { describe, it, expect } from 'vitest';

describe('ResumeUpload Page', () => {
  it('renders upload interface', () => {
    renderWithProviders(<ResumeUpload />);
    
    expect(screen.getByText(/Drag and drop resumes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select files/i })).toBeInTheDocument();
  });

  it('handles file drop', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResumeUpload />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello'], 'resume.pdf', { type: 'application/pdf' });
    
    if (fileInput) {
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(screen.getByText('resume.pdf')).toBeInTheDocument();
      });
    }
  });
});

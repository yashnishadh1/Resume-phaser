import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';
import { Badge } from '../badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../card';
import { Input } from '../input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../table';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../dialog';
import { describe, it, expect } from 'vitest';

describe('Shared UI Components', () => {
  it('renders Button correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button', { name: /Delete/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('text-destructive');
  });

  it('renders Input correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders Badge correctly', () => {
    render(<Badge variant="outline">Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders Card correctly', () => {
    render(
      <Card>
        <CardHeader><CardTitle>Card Title</CardTitle></CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders Table correctly', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('handles Dialog open/close interaction', async () => {
    const user = userEvent.setup();
    render(
      <Dialog>
        <DialogTrigger>
          Open Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Content</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open Dialog');
    await user.click(trigger);
    
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });
});

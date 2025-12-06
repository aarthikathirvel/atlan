import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultsTable from './ResultsTable';

// Mock @tanstack/react-virtual
const mockGetVirtualItems = vi.fn(() => [
  { index: 0, start: 0, size: 40, key: 0 },
  { index: 1, start: 40, size: 40, key: 1 },
]);

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: vi.fn(() => ({
    getVirtualItems: mockGetVirtualItems,
    getTotalSize: () => 80,
  })),
}));

describe('ResultsTable', () => {
  it('should render empty state when no data', () => {
    render(<ResultsTable columns={[]} rows={[]} />);
    expect(screen.getByText(/No results to display/)).toBeInTheDocument();
  });

  it('should render table with columns and rows', () => {
    const columns = ['id', 'name', 'email'];
    const rows = [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' },
    ];

    render(<ResultsTable columns={columns} rows={rows} />);

    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('should display execution info', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];
    
    mockGetVirtualItems.mockReturnValue([
      { index: 0, start: 0, size: 40, key: 0 },
    ]);

    render(
      <ResultsTable
        columns={columns}
        rows={rows}
        executionTime={123.45}
        rowsAffected={1}
      />
    );

    expect(screen.getByText(/Rows:/)).toBeInTheDocument();
    expect(screen.getByText(/Columns:/)).toBeInTheDocument();
    expect(screen.getByText(/Execution Time:/)).toBeInTheDocument();
    expect(screen.getByText(/Rows Affected:/)).toBeInTheDocument();
  });

  it('should format row count with locale string', () => {
    const columns = ['id'];
    const rows = Array.from({ length: 1000 }, (_, i) => ({ id: i }));

    render(<ResultsTable columns={columns} rows={rows} />);

    expect(screen.getByText(/1,000/)).toBeInTheDocument();
  });

  it('should handle null and undefined values', () => {
    const columns = ['id', 'name', 'value'];
    const rows = [
      { id: 1, name: 'John', value: null },
      { id: 2, name: 'Jane', value: undefined },
    ];

    mockGetVirtualItems.mockReturnValue([
      { index: 0, start: 0, size: 40, key: 0 },
      { index: 1, start: 40, size: 40, key: 1 },
    ]);

    render(<ResultsTable columns={columns} rows={rows} />);

    expect(screen.getByText('id')).toBeInTheDocument();
  });
});


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButtons from './ExportButtons';

// Mock the export utilities
vi.mock('../utils/exportUtils', () => ({
  exportToCSV: vi.fn(),
  exportToJSON: vi.fn(),
}));

import { exportToCSV, exportToJSON } from '../utils/exportUtils';

describe('ExportButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when no data', () => {
    const { container } = render(<ExportButtons columns={[]} rows={[]} disabled={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render export buttons when data is available', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={false} />);

    expect(screen.getByText(/Export CSV/)).toBeInTheDocument();
    expect(screen.getByText(/Export JSON/)).toBeInTheDocument();
  });

  it('should call exportToCSV when CSV button is clicked', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={false} />);

    const csvButton = screen.getByText(/Export CSV/);
    fireEvent.click(csvButton);

    expect(exportToCSV).toHaveBeenCalledWith(columns, rows);
  });

  it('should call exportToJSON when JSON button is clicked', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={false} />);

    const jsonButton = screen.getByText(/Export JSON/);
    fireEvent.click(jsonButton);

    expect(exportToJSON).toHaveBeenCalledWith(columns, rows);
  });

  it('should disable buttons when disabled prop is true', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={true} />);

    const csvButton = screen.getByText(/Export CSV/);
    const jsonButton = screen.getByText(/Export JSON/);

    expect(csvButton).toBeDisabled();
    expect(jsonButton).toBeDisabled();
  });
});

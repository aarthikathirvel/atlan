import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButtons from './ExportButtons';

// Mock the export utilities
vi.mock('../utils/exportUtils', () => ({
  exportToCSV: vi.fn(),
  exportToJSON: vi.fn(),
  exportToExcel: vi.fn(),
}));

import { exportToCSV, exportToJSON, exportToExcel } from '../utils/exportUtils';

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

  it('should render export button when data is available', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={false} />);

    expect(screen.getByText(/Export/)).toBeInTheDocument();
  });

  it('should call exportToCSV when CSV button is clicked', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={false} />);

    const exportButton = screen.getByText(/Export/);
    fireEvent.click(exportButton);

    const csvButton = screen.getByText(/Export CSV/);
    fireEvent.click(csvButton);

    expect(exportToCSV).toHaveBeenCalledWith(columns, rows);
  });

  it('should call exportToJSON when JSON button is clicked', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={false} />);

    const exportButton = screen.getByText(/Export/);
    fireEvent.click(exportButton);

    const jsonButton = screen.getByText(/Export JSON/);
    fireEvent.click(jsonButton);

    expect(exportToJSON).toHaveBeenCalledWith(columns, rows);
  });

  it('should disable button when disabled prop is true', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={true} />);

    const exportButton = screen.getByText(/Export/);
    expect(exportButton).toBeDisabled();
  });

  it('should call exportToExcel when Excel button is clicked', () => {
    const columns = ['id', 'name'];
    const rows = [{ id: 1, name: 'John' }];

    render(<ExportButtons columns={columns} rows={rows} disabled={false} />);

    const exportButton = screen.getByText(/Export/);
    fireEvent.click(exportButton);

    const excelButton = screen.getByText(/Export Excel/);
    fireEvent.click(excelButton);

    expect(exportToExcel).toHaveBeenCalledWith(columns, rows);
  });
});

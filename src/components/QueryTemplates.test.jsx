import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QueryTemplates from './QueryTemplates';

describe('QueryTemplates', () => {
  const mockOnSelectTemplate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render query templates', () => {
    render(<QueryTemplates onSelectTemplate={mockOnSelectTemplate} />);

    expect(screen.getByText('Query Templates')).toBeInTheDocument();
    expect(screen.getByText('Get All Users')).toBeInTheDocument();
    expect(screen.getByText('Get All Orders')).toBeInTheDocument();
  });

  it('should call onSelectTemplate when template is clicked', () => {
    render(<QueryTemplates onSelectTemplate={mockOnSelectTemplate} />);

    const template = screen.getByText('Get All Users');
    fireEvent.click(template.closest('.query-template-item'));

    expect(mockOnSelectTemplate).toHaveBeenCalledWith('SELECT * FROM users');
  });

  it('should render all template queries', () => {
    render(<QueryTemplates onSelectTemplate={mockOnSelectTemplate} />);

    expect(screen.getByText(/SELECT \* FROM users/)).toBeInTheDocument();
    expect(screen.getByText(/SELECT \* FROM orders/)).toBeInTheDocument();
    expect(screen.getByText(/SELECT \* FROM products/)).toBeInTheDocument();
    expect(screen.getByText(/SELECT \* FROM employees/)).toBeInTheDocument();
    expect(screen.getByText(/SELECT \* FROM transactions/)).toBeInTheDocument();
  });
});


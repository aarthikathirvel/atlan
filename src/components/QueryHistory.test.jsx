import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QueryHistory from './QueryHistory';

describe('QueryHistory', () => {
  const mockOnSelectQuery = vi.fn();
  const mockOnClearHistory = vi.fn();
  const mockOnRemoveFromHistory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no history', () => {
    render(
      <QueryHistory
        history={[]}
        onSelectQuery={mockOnSelectQuery}
        onClearHistory={mockOnClearHistory}
        onRemoveFromHistory={mockOnRemoveFromHistory}
      />
    );

    expect(screen.getByText(/No query history yet/)).toBeInTheDocument();
  });

  it('should render history items', () => {
    const history = [
      {
        id: 1,
        query: 'SELECT * FROM users',
        timestamp: '2024-01-01T00:00:00.000Z',
        rowsAffected: 10,
        executionTime: 100,
      },
    ];

    render(
      <QueryHistory
        history={history}
        onSelectQuery={mockOnSelectQuery}
        onClearHistory={mockOnClearHistory}
        onRemoveFromHistory={mockOnRemoveFromHistory}
      />
    );

    expect(screen.getByText('SELECT * FROM users')).toBeInTheDocument();
    expect(screen.getByText(/10 rows/)).toBeInTheDocument();
  });

  it('should call onSelectQuery when history item is clicked', () => {
    const history = [
      {
        id: 1,
        query: 'SELECT * FROM users',
        timestamp: '2024-01-01T00:00:00.000Z',
        rowsAffected: 10,
        executionTime: 100,
      },
    ];

    render(
      <QueryHistory
        history={history}
        onSelectQuery={mockOnSelectQuery}
        onClearHistory={mockOnClearHistory}
        onRemoveFromHistory={mockOnRemoveFromHistory}
      />
    );

    const queryElement = screen.getByText('SELECT * FROM users');
    fireEvent.click(queryElement);

    expect(mockOnSelectQuery).toHaveBeenCalledWith('SELECT * FROM users');
  });

  it('should call onClearHistory when clear button is clicked', () => {
    const history = [
      {
        id: 1,
        query: 'SELECT * FROM users',
        timestamp: '2024-01-01T00:00:00.000Z',
        rowsAffected: 10,
        executionTime: 100,
      },
    ];

    render(
      <QueryHistory
        history={history}
        onSelectQuery={mockOnSelectQuery}
        onClearHistory={mockOnClearHistory}
        onRemoveFromHistory={mockOnRemoveFromHistory}
      />
    );

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(mockOnClearHistory).toHaveBeenCalled();
  });

  it('should call onRemoveFromHistory when remove button is clicked', () => {
    const history = [
      {
        id: 1,
        query: 'SELECT * FROM users',
        timestamp: '2024-01-01T00:00:00.000Z',
        rowsAffected: 10,
        executionTime: 100,
      },
    ];

    render(
      <QueryHistory
        history={history}
        onSelectQuery={mockOnSelectQuery}
        onClearHistory={mockOnClearHistory}
        onRemoveFromHistory={mockOnRemoveFromHistory}
      />
    );

    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    expect(mockOnRemoveFromHistory).toHaveBeenCalledWith(1);
  });

  it('should show expand/collapse functionality', () => {
    const history = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      query: `SELECT * FROM table${i}`,
      timestamp: '2024-01-01T00:00:00.000Z',
      rowsAffected: 10,
      executionTime: 100,
    }));

    render(
      <QueryHistory
        history={history}
        onSelectQuery={mockOnSelectQuery}
        onClearHistory={mockOnClearHistory}
        onRemoveFromHistory={mockOnRemoveFromHistory}
      />
    );

    const expandButton = screen.getByText('Expand');
    expect(expandButton).toBeInTheDocument();

    fireEvent.click(expandButton);

    expect(screen.getByText('Collapse')).toBeInTheDocument();
  });

  it('should show "Show more" when history has more than 5 items', () => {
    const history = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      query: `SELECT * FROM table${i}`,
      timestamp: '2024-01-01T00:00:00.000Z',
      rowsAffected: 10,
      executionTime: 100,
    }));

    render(
      <QueryHistory
        history={history}
        onSelectQuery={mockOnSelectQuery}
        onClearHistory={mockOnClearHistory}
        onRemoveFromHistory={mockOnRemoveFromHistory}
      />
    );

    expect(screen.getByText(/Show 2 more/)).toBeInTheDocument();
  });
});


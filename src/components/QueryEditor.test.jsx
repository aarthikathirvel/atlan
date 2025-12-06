import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QueryEditor from './QueryEditor';

// Mock react-ace
vi.mock('react-ace', () => ({
  default: ({ value, onChange, onKeyDown }) => (
    <textarea
      data-testid="ace-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
    />
  ),
}));

describe('QueryEditor', () => {
  const mockOnChange = vi.fn();
  const mockOnExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render query editor', () => {
    render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    expect(screen.getByText('SQL Query Editor')).toBeInTheDocument();
    expect(screen.getByTestId('ace-editor')).toBeInTheDocument();
  });

  it('should display execute button', () => {
    render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    expect(screen.getByText(/Execute Query/)).toBeInTheDocument();
  });

  it('should call onChange when editor value changes', () => {
    render(
      <QueryEditor
        value=""
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    const editor = screen.getByTestId('ace-editor');
    fireEvent.change(editor, { target: { value: 'SELECT * FROM orders' } });

    expect(mockOnChange).toHaveBeenCalledWith('SELECT * FROM orders');
  });

  it('should call onExecute when execute button is clicked', () => {
    render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    const executeButton = screen.getByText(/Execute Query/);
    fireEvent.click(executeButton);

    expect(mockOnExecute).toHaveBeenCalled();
  });

  it('should disable execute button when loading', () => {
    render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={true}
      />
    );

    const executeButton = screen.getByText('Executing...');
    expect(executeButton).toBeDisabled();
  });

  it('should disable execute button when query is empty', () => {
    render(
      <QueryEditor
        value=""
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    const executeButton = screen.getByText(/Execute Query/);
    expect(executeButton).toBeDisabled();
  });

  it('should call onExecute on Ctrl+Enter', async () => {
    const { container } = render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    // Wait for editor to load
    await new Promise(resolve => setTimeout(resolve, 10));

    // Focus the editor container
    const editorContainer = container.querySelector('.query-editor-container');
    if (editorContainer) {
      editorContainer.focus();
    }

    // Simulate Ctrl+Enter keydown on document
    fireEvent.keyDown(document, { key: 'Enter', ctrlKey: true });

    expect(mockOnExecute).toHaveBeenCalled();
  });

  it('should call onExecute on Cmd+Enter', async () => {
    const { container } = render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    // Wait for editor to load
    await new Promise(resolve => setTimeout(resolve, 10));

    // Focus the editor container
    const editorContainer = container.querySelector('.query-editor-container');
    if (editorContainer) {
      editorContainer.focus();
    }

    // Simulate Cmd+Enter keydown on document
    fireEvent.keyDown(document, { key: 'Enter', metaKey: true });

    expect(mockOnExecute).toHaveBeenCalled();
  });

  it('should clear editor when clear button is clicked', () => {
    const { rerender } = render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should update value when prop changes', () => {
    const { rerender } = render(
      <QueryEditor
        value="SELECT * FROM users"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    const editor = screen.getByTestId('ace-editor');
    expect(editor.value).toBe('SELECT * FROM users');

    rerender(
      <QueryEditor
        value="SELECT * FROM orders"
        onChange={mockOnChange}
        onExecute={mockOnExecute}
        isLoading={false}
      />
    );

    expect(editor.value).toBe('SELECT * FROM orders');
  });
});


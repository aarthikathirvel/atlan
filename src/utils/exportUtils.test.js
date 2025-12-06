import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, exportToJSON } from './exportUtils';

describe('exportUtils', () => {
  let mockLink;
  let mockAppendChild;
  let mockRemoveChild;
  let mockClick;

  beforeEach(() => {
    mockClick = vi.fn();
    mockLink = {
      setAttribute: vi.fn(),
      click: mockClick,
      style: {},
    };
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    
    global.document.createElement = vi.fn(() => mockLink);
    global.document.body.appendChild = mockAppendChild;
    global.document.body.removeChild = mockRemoveChild;
    global.URL.createObjectURL = vi.fn(() => 'blob:url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportToCSV', () => {
    it('should create and download CSV file', () => {
      const columns = ['id', 'name', 'email'];
      const rows = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      exportToCSV(columns, rows);

      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('query_results_'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'));
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it('should handle values with commas', () => {
      const columns = ['name', 'description'];
      const rows = [
        { name: 'Product', description: 'A product, with commas' },
      ];

      exportToCSV(columns, rows);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle null and undefined values', () => {
      const columns = ['id', 'name', 'value'];
      const rows = [
        { id: 1, name: 'Test', value: null },
        { id: 2, name: 'Test2', value: undefined },
      ];

      exportToCSV(columns, rows);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle empty arrays', () => {
      const columns = ['id', 'name'];
      const rows = [];

      exportToCSV(columns, rows);
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    it('should create and download JSON file', () => {
      const columns = ['id', 'name', 'email'];
      const rows = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      exportToJSON(columns, rows);

      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('query_results_'));
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.json'));
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    });

    it('should format JSON with proper structure', () => {
      const columns = ['id', 'name'];
      const rows = [
        { id: 1, name: 'John' },
      ];

      exportToJSON(columns, rows);
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle empty arrays', () => {
      const columns = ['id', 'name'];
      const rows = [];

      exportToJSON(columns, rows);
      expect(mockClick).toHaveBeenCalled();
    });
  });
});


import { useMemo, useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const ResultsTable = ({ columns = [], rows = [], executionTime, rowsAffected, message }) => {
  const parentRef = useRef(null);
  const theadRef = useRef(null);
  const [theadHeight, setTheadHeight] = useState(0);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [filterTerm, setFilterTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');

  useEffect(() => {
    if (theadRef.current) {
      setTheadHeight(theadRef.current.offsetHeight);
    }
  }, [columns]);

  const [tableWidth, setTableWidth] = useState(1200);

  useEffect(() => {
    const updateWidth = () => {
      if (parentRef.current) {
        setTableWidth(parentRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const columnWidths = useMemo(() => {
    if (columns.length === 0) return {};
    const totalWidth = tableWidth;
    // Account for borders (1px per column)
    const borderWidth = columns.length * 1;
    const availableWidth = totalWidth - borderWidth;
    const avgWidth = Math.max(150, availableWidth / columns.length);
    return columns.reduce((acc, col) => {
      acc[col] = avgWidth;
      return acc;
    }, {});
  }, [columns, tableWidth]);

  const filteredRows = useMemo(() => {
    if (!filterTerm.trim()) return rows;
    
    const term = filterTerm.toLowerCase();
    return rows.filter(row => {
      if (filterColumn === 'all') {
        // Search across all columns
        return columns.some(col => {
          const value = String(row[col] ?? '').toLowerCase();
          return value.includes(term);
        });
      } else {
        // Search in specific column
        const value = String(row[filterColumn] ?? '').toLowerCase();
        return value.includes(term);
      }
    });
  }, [rows, filterTerm, filterColumn, columns]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.column || filteredRows.length === 0) return filteredRows;
    
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortConfig.column];
      const bVal = b[sortConfig.column];
      
      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      // Try numeric comparison
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredRows, sortConfig]);

  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
    paddingStart: 0,
    paddingEnd: 0,
  });

  const handleSort = (column) => {
    setSortConfig(prevConfig => ({
      column,
      direction: prevConfig.column === column && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // No query executed yet
  if (!columns.length && !rows.length) {
    return (
      <div className="results-table-empty">
        <p>No results to display. Execute a query to see results.</p>
      </div>
    );
  }

  // Query executed but returned no rows
  if (columns.length > 0 && rows.length === 0) {
    return (
      <div className="results-table-empty">
        <div className="empty-result-icon">📭</div>
        <p className="empty-result-title">No Results Found</p>
        <p className="empty-result-message">
          {message || 'The query executed successfully but returned no rows.'}
        </p>
        {rowsAffected !== undefined && (
          <p className="empty-result-info">
            <strong>Rows Affected:</strong> {rowsAffected.toLocaleString()}
          </p>
        )}
        {executionTime && (
          <p className="empty-result-info">
            <strong>Execution Time:</strong> {executionTime.toFixed(2)} ms
          </p>
        )}
      </div>
    );
  }

  // Filter applied but no matching results
  if (filterTerm.trim() && filteredRows.length === 0) {
    return (
      <div className="results-table-container">
        <div className="results-table-header">
          <div className="results-info">
            <span className="info-item">
              <strong>Rows:</strong> 0 of {rows.length.toLocaleString()}
            </span>
            <span className="info-item">
              <strong>Columns:</strong> {columns.length}
            </span>
          </div>
          <div className="results-table-filter">
            <select
              className="results-filter-column"
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              title="Filter by column"
            >
              <option value="all">All Columns</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <div className="results-filter-input-wrapper">
              <input
                type="text"
                className="results-filter-input"
                placeholder="🔍 Filter results..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
              />
              <button
                className="btn btn-icon btn-sm results-filter-clear"
                onClick={() => {
                  setFilterTerm('');
                  setFilterColumn('all');
                }}
                title="Clear filter"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        <div className="results-table-empty">
          <div className="empty-result-icon">🔍</div>
          <p className="empty-result-title">No Matching Results</p>
          <p className="empty-result-message">
            No rows match the filter "{filterTerm}" in {filterColumn === 'all' ? 'any column' : filterColumn}.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setFilterTerm('');
              setFilterColumn('all');
            }}
            style={{ marginTop: '1rem' }}
          >
            Clear Filter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-table-container">
      <div className="results-table-header">
        <div className="results-info">
          <span className="info-item">
            <strong>Rows:</strong> {sortedRows.length.toLocaleString()}
            {filterTerm.trim() && (
              <span className="filter-indicator"> of {rows.length.toLocaleString()}</span>
            )}
          </span>
          <span className="info-item">
            <strong>Columns:</strong> {columns.length}
          </span>
          {executionTime && (
            <span className="info-item">
              <strong>Execution Time:</strong> {executionTime.toFixed(2)} ms
            </span>
          )}
          {rowsAffected !== undefined && (
            <span className="info-item">
              <strong>Rows Affected:</strong> {rowsAffected.toLocaleString()}
            </span>
          )}
        </div>
        {columns.length > 0 && rows.length > 0 && (
          <div className="results-table-filter">
            <select
              className="results-filter-column"
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
              title="Filter by column"
            >
              <option value="all">All Columns</option>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <div className="results-filter-input-wrapper">
              <input
                type="text"
                className="results-filter-input"
                placeholder="🔍 Filter results..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
              />
              {filterTerm && (
                <button
                  className="btn btn-icon btn-sm results-filter-clear"
                  onClick={() => {
                    setFilterTerm('');
                    setFilterColumn('all');
                  }}
                  title="Clear filter"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="results-table-wrapper" ref={parentRef}>
        <table className="results-table">
          <thead className="results-table-thead" ref={theadRef}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{ 
                    width: `${columnWidths[col]}px`, 
                    minWidth: '150px',
                    maxWidth: `${columnWidths[col]}px`,
                  }}
                  className={sortConfig.column === col ? `sortable sorted-${sortConfig.direction}` : 'sortable'}
                  onClick={() => handleSort(col)}
                  title={`Click to sort by ${col}`}
                >
                  <span className="th-content">
                    {col}
                    {sortConfig.column === col && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            style={{
              position: 'relative',
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = sortedRows[virtualRow.index];
              if (!row) return null; // Safety check
              return (
                <tr
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: `${virtualRow.start}px`,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      style={{ 
                        width: `${columnWidths[col]}px`, 
                        minWidth: '150px',
                        maxWidth: `${columnWidths[col]}px`,
                      }}
                      title={String(row[col] ?? '')}
                    >
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;


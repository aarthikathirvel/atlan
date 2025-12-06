import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const ResultsTable = ({ columns = [], rows = [], executionTime, rowsAffected, message }) => {
  const parentRef = useRef(null);
  const theadRef = useRef(null);
  const [theadHeight, setTheadHeight] = useState(0);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const [filterTerm, setFilterTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState('all');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [copiedCell, setCopiedCell] = useState(null);

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
    let resizeObserver;
    if (parentRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(updateWidth);
      resizeObserver.observe(parentRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateWidth);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [isFullScreen]);

  const columnWidths = useMemo(() => {
    if (columns.length === 0) return {};
    const totalWidth = tableWidth;
    // Account for checkbox column (50px) and borders (1px per column + checkbox)
    const checkboxColumnWidth = 50;
    const borderWidth = (columns.length + 1) * 1; // +1 for checkbox column
    const availableWidth = totalWidth - checkboxColumnWidth - borderWidth;
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

  const handleCopyCell = useCallback((value, rowIndex, col) => {
    const cellValue = String(value ?? '');
    navigator.clipboard.writeText(cellValue).then(() => {
      const cellKey = `${rowIndex}-${col}`;
      setCopiedCell(cellKey);
      setTimeout(() => setCopiedCell(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = cellValue;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      const cellKey = `${rowIndex}-${col}`;
      setCopiedCell(cellKey);
      setTimeout(() => setCopiedCell(null), 2000);
    });
  }, []);

  const toggleRowSelection = useCallback((rowIndex) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  }, []);

  const selectAllRows = useCallback(() => {
    if (selectedRows.size === sortedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedRows.map((_, index) => index)));
    }
  }, [selectedRows.size, sortedRows.length]);

  const copySelectedRows = useCallback(() => {
    if (selectedRows.size === 0) return;
    
    const selectedData = Array.from(selectedRows)
      .sort((a, b) => a - b)
      .map(index => sortedRows[index])
      .map(row => columns.map(col => String(row[col] ?? '')).join('\t'))
      .join('\n');
    
    const headerRow = columns.join('\t');
    const fullText = `${headerRow}\n${selectedData}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      // Show feedback
      const originalSize = selectedRows.size;
      setSelectedRows(new Set());
      setTimeout(() => {
        alert(`Copied ${originalSize} row(s) to clipboard`);
      }, 100);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      const originalSize = selectedRows.size;
      setSelectedRows(new Set());
      setTimeout(() => {
        alert(`Copied ${originalSize} row(s) to clipboard`);
      }, 100);
    });
  }, [selectedRows, sortedRows, columns]);

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
          <div className="results-table-controls">
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
            <div className="results-table-actions">
              {selectedRows.size > 0 && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={copySelectedRows}
                  title={`Copy ${selectedRows.size} selected row(s)`}
                >
                  📋 Copy {selectedRows.size} Row{selectedRows.size > 1 ? 's' : ''}
                </button>
              )}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
              >
                {isFullScreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={`results-table-wrapper ${isFullScreen ? 'fullscreen' : ''}`}>
        {isFullScreen && (
          <div className="fullscreen-header">
            <div className="fullscreen-header-left">
              <h3>Query Results - Full Screen</h3>
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
            </div>
            <div className="fullscreen-header-right">
              <div className="results-table-controls">
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
                <div className="results-table-actions">
                  {selectedRows.size > 0 && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={copySelectedRows}
                      title={`Copy ${selectedRows.size} selected row(s)`}
                    >
                      📋 Copy {selectedRows.size} Row{selectedRows.size > 1 ? 's' : ''}
                    </button>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsFullScreen(false)}
                    title="Exit full screen"
                  >
                    ⤓ Exit Fullscreen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={isFullScreen ? 'fullscreen-table-container' : ''} ref={parentRef}>
          <table className="results-table">
            <thead className="results-table-thead" ref={theadRef}>
              <tr>
                <th className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === sortedRows.length && sortedRows.length > 0}
                    onChange={selectAllRows}
                    title="Select all rows"
                  />
                </th>
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
                const rowIndex = virtualRow.index;
                const isSelected = selectedRows.has(rowIndex);
                return (
                  <tr
                    key={virtualRow.index}
                    data-index={virtualRow.index}
                    className={isSelected ? 'row-selected' : ''}
                    style={{
                      position: 'absolute',
                      top: `${virtualRow.start}px`,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                    }}
                  >
                    <td className="select-cell">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelection(rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    {columns.map((col) => {
                      const cellKey = `${rowIndex}-${col}`;
                      const isCopied = copiedCell === cellKey;
                      return (
                        <td
                          key={col}
                          style={{ 
                            width: `${columnWidths[col]}px`, 
                            minWidth: '150px',
                            maxWidth: `${columnWidths[col]}px`,
                          }}
                          title={String(row[col] ?? '')}
                          className={isCopied ? 'cell-copied' : 'cell-clickable'}
                          onClick={() => handleCopyCell(row[col], rowIndex, col)}
                        >
                          {isCopied ? '✓ Copied!' : String(row[col] ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;


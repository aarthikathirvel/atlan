import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import ExportButtons from './ExportButtons';

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
  const [isCopyingRows, setIsCopyingRows] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(new Set(columns));

  useEffect(() => {
    if (theadRef.current) {
      setTheadHeight(theadRef.current.offsetHeight);
    }
  }, [columns]);

  useEffect(() => {
    setVisibleColumns(new Set(columns));
  }, [columns]);

  const visibleColumnsArray = useMemo(() => {
    return columns.filter(col => visibleColumns.has(col));
  }, [columns, visibleColumns]);

  const toggleColumnVisibility = useCallback((col) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(col)) {
        newSet.delete(col);
      } else {
        newSet.add(col);
      }
      return newSet;
    });
  }, []);

  const showAllColumns = useCallback(() => {
    setVisibleColumns(new Set(columns));
  }, [columns]);

  const hideAllColumns = useCallback(() => {
    setVisibleColumns(new Set());
  }, []);

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
    if (visibleColumnsArray.length === 0) return {};
    const totalWidth = tableWidth;
    // Account for checkbox column (50px)
    const checkboxColumnWidth = 50;
    // Account for borders: 1px right border per column (including checkbox)
    const borderWidth = (visibleColumnsArray.length + 1) * 1;
    const availableWidth = totalWidth - checkboxColumnWidth - borderWidth;
    const avgWidth = Math.floor(availableWidth / visibleColumnsArray.length);
    // Calculate total width used
    const totalUsedWidth = (avgWidth * visibleColumnsArray.length) + checkboxColumnWidth + borderWidth;
    // Distribute any remaining pixels to first columns
    const remainder = totalWidth - totalUsedWidth;
    return visibleColumnsArray.reduce((acc, col, index) => {
      acc[col] = avgWidth + (index < remainder ? 1 : 0);
      return acc;
    }, {});
  }, [visibleColumnsArray, tableWidth]);

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
      .map(row => visibleColumnsArray.map(col => String(row[col] ?? '')).join('\t'))
      .join('\n');
    
    const headerRow = visibleColumnsArray.join('\t');
    const fullText = `${headerRow}\n${selectedData}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      // Show visual feedback on button only
      setIsCopyingRows(true);
      setTimeout(() => {
        setIsCopyingRows(false);
      }, 2000);
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
      // Show visual feedback on button only
      setIsCopyingRows(true);
      setTimeout(() => {
        setIsCopyingRows(false);
      }, 2000);
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
              <strong>Columns:</strong> {visibleColumnsArray.length}
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
              {visibleColumnsArray.map(col => (
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
      {!isFullScreen && (
        <div className="results-table-header">
          <div className="results-header-top">
            <div className="results-title-section">
              <h2 className="results-title">Query Results</h2>
              <div className="results-info">
              <span className="info-item">
                <strong>Rows:</strong> {sortedRows.length.toLocaleString()}
                {filterTerm.trim() && (
                  <span className="filter-indicator"> of {rows.length.toLocaleString()}</span>
                )}
              </span>
              <span className="info-item">
                <strong>Columns:</strong> {visibleColumnsArray.length}
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
          {columns.length > 0 && rows.length > 0 && (
            <div className="results-header-actions">
              <ExportButtons columns={visibleColumnsArray} rows={sortedRows} />
            </div>
          )}
          </div>
        </div>
      )}
      {!isFullScreen && columns.length > 0 && rows.length > 0 && (
        <div className="results-table-header">
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
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const modal = document.getElementById('column-visibility-modal');
                  if (modal) modal.style.display = 'flex';
                }}
                title="Show/Hide Columns"
              >
                👁️ Show/Hide Columns
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
              >
                {isFullScreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
              </button>
              <div className="copy-rows-button-container">
                {selectedRows.size > 0 && (
                  <button
                    className={`btn btn-secondary btn-sm copy-rows-button ${isCopyingRows ? 'copy-rows-button-copied' : ''}`}
                    onClick={copySelectedRows}
                    title={`Copy ${selectedRows.size} selected row(s)`}
                  >
                    {isCopyingRows ? '✓ Copied!' : `📋 Copy ${selectedRows.size} Row${selectedRows.size > 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`results-table-wrapper ${isFullScreen ? 'fullscreen' : ''}`}>
        {isFullScreen && (
          <div className="fullscreen-header">
            <div className="fullscreen-header-left">
              <h3>Query Results</h3>
              <div className="results-info">
                <span className="info-item">
                  <strong>Rows:</strong> {sortedRows.length.toLocaleString()}
                  {filterTerm.trim() && (
                    <span className="filter-indicator"> of {rows.length.toLocaleString()}</span>
                  )}
                </span>
                <span className="info-item">
                  <strong>Columns:</strong> {visibleColumnsArray.length}
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
                  <ExportButtons columns={visibleColumnsArray} rows={sortedRows} />
                  <div className="copy-rows-button-container">
                    {selectedRows.size > 0 && (
                      <button
                        className={`btn btn-secondary btn-sm copy-rows-button ${isCopyingRows ? 'copy-rows-button-copied' : ''}`}
                        onClick={copySelectedRows}
                        title={`Copy ${selectedRows.size} selected row(s)`}
                      >
                        {isCopyingRows ? '✓ Copied!' : `📋 Copy ${selectedRows.size} Row${selectedRows.size > 1 ? 's' : ''}`}
                      </button>
                    )}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const modal = document.getElementById('column-visibility-modal');
                      if (modal) modal.style.display = 'flex';
                    }}
                    title="Show/Hide Columns"
                  >
                    👁️ Show/Hide Columns
                  </button>
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
                <th 
                  className="select-column"
                  style={{
                    width: '50px',
                    minWidth: '50px',
                    maxWidth: '50px',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    paddingTop: '0.75rem',
                    paddingBottom: '0.75rem',
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedRows.size === sortedRows.length && sortedRows.length > 0}
                    onChange={selectAllRows}
                    title="Select all rows"
                  />
                </th>
                {visibleColumnsArray.map((col) => (
                  <th
                    key={col}
                    style={{ 
                      width: `${columnWidths[col]}px`, 
                      minWidth: `${columnWidths[col]}px`,
                      maxWidth: `${columnWidths[col]}px`,
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                    }}
                    className={sortConfig.column === col ? `sortable sorted-${sortConfig.direction}` : 'sortable'}
                    onClick={() => handleSort(col)}
                    title={`Click to sort by ${col}`}
                  >
                    <div className="th-content-wrapper">
                      <span className="th-content">
                        {col}
                        {sortConfig.column === col ? (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'asc' ? (
                              <span className="sort-icon sort-asc">▲</span>
                            ) : (
                              <span className="sort-icon sort-desc">▼</span>
                            )}
                          </span>
                        ) : (
                          <span className="sort-indicator sort-inactive">
                            <span className="sort-icon sort-both">⇅</span>
                          </span>
                        )}
                      </span>
                    </div>
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
                    <td 
                      className="select-cell"
                      style={{
                        width: '50px',
                        minWidth: '50px',
                        maxWidth: '50px',
                        paddingLeft: '0.5rem',
                        paddingRight: '0.5rem',
                        paddingTop: '0.75rem',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelection(rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    {visibleColumnsArray.map((col) => {
                      const cellKey = `${rowIndex}-${col}`;
                      const isCopied = copiedCell === cellKey;
                      return (
                        <td
                          key={col}
                          style={{ 
                            width: `${columnWidths[col]}px`, 
                            minWidth: `${columnWidths[col]}px`,
                            maxWidth: `${columnWidths[col]}px`,
                            paddingLeft: '1rem',
                            paddingRight: '1rem',
                            paddingTop: '0.75rem',
                            paddingBottom: '0.75rem',
                          }}
                          title={String(row[col] ?? '')}
                          className={isCopied ? 'cell-copied' : 'cell-clickable'}
                          onClick={() => handleCopyCell(row[col], rowIndex, col)}
                        >
                          <div className="cell-content-wrapper">
                            {isCopied ? '✓ Copied!' : String(row[col] ?? '')}
                          </div>
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
      {/* Column Visibility Modal */}
      <div id="column-visibility-modal" className="column-visibility-modal" onClick={(e) => {
        if (e.target.id === 'column-visibility-modal') {
          e.currentTarget.style.display = 'none';
        }
      }}>
        <div className="column-visibility-content" onClick={(e) => e.stopPropagation()}>
          <div className="column-visibility-header">
            <h3>Show/Hide Columns</h3>
            <button 
              className="btn btn-icon" 
              onClick={() => {
                const modal = document.getElementById('column-visibility-modal');
                if (modal) modal.style.display = 'none';
              }}
            >
              ×
            </button>
          </div>
          <div className="column-visibility-list">
            {columns.map(col => (
              <label key={col} className="column-visibility-item">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(col)}
                  onChange={() => toggleColumnVisibility(col)}
                />
                <span>{col}</span>
              </label>
            ))}
          </div>
          <div className="column-visibility-actions">
            <button className="btn btn-secondary btn-sm" onClick={hideAllColumns}>Hide All</button>
            <button className="btn btn-primary btn-sm" onClick={showAllColumns}>Show All</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;


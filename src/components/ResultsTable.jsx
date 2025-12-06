import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

const ResultsTable = ({ columns = [], rows = [], executionTime, rowsAffected, message }) => {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  const columnWidths = useMemo(() => {
    if (columns.length === 0) return {};
    const totalWidth = parentRef.current?.clientWidth || 1200;
    const avgWidth = Math.max(150, totalWidth / columns.length);
    return columns.reduce((acc, col) => {
      acc[col] = avgWidth;
      return acc;
    }, {});
  }, [columns]);

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

  return (
    <div className="results-table-container">
      <div className="results-table-header">
        <div className="results-info">
          <span className="info-item">
            <strong>Rows:</strong> {rows.length.toLocaleString()}
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
      <div className="results-table-wrapper" ref={parentRef}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          <table className="results-table">
            <thead className="results-table-thead">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    style={{ width: `${columnWidths[col]}px`, minWidth: '150px' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <tr
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        style={{ width: `${columnWidths[col]}px`, minWidth: '150px' }}
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
    </div>
  );
};

export default ResultsTable;


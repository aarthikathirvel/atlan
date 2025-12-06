import { useState, useMemo } from 'react';

const QueryHistory = ({ history, onSelectQuery, onClearHistory, onRemoveFromHistory }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Always call hooks at the top level
  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const term = searchTerm.toLowerCase();
    return history.filter(entry => 
      entry.query.toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  const displayHistory = isExpanded ? filteredHistory : filteredHistory.slice(0, 5);

  if (history.length === 0) {
    return (
      <div className="query-history">
        <div className="query-history-header">
          <h3>Query History</h3>
        </div>
        <div className="query-history-empty">
          <p>No query history yet. Execute queries to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="query-history">
      <div className="query-history-header">
        <h3>Query History ({history.length})</h3>
        <div className="query-history-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={onClearHistory}
          >
            Clear All
          </button>
        </div>
      </div>
      {history.length > 0 && (
        <div className="query-history-search">
          <input
            type="text"
            placeholder="🔍 Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="query-history-search-input"
          />
          {searchTerm && (
            <button
              className="btn btn-icon btn-sm"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
      )}
      <div className={`query-history-list ${isExpanded ? 'expanded' : ''}`}>
        {displayHistory.length === 0 && searchTerm ? (
          <div className="query-history-empty">
            <p>No queries found matching "{searchTerm}"</p>
          </div>
        ) : (
          displayHistory.map((entry) => (
          <div 
            key={entry.id} 
            className="query-history-item"
            onClick={() => onSelectQuery(entry.query)}
          >
            <div className="query-history-item-content">
              <div className="query-history-query">
                <code>{entry.query}</code>
              </div>
              <div className="query-history-meta">
                <span className="meta-item">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                <span className="meta-item">
                  {entry.rowsAffected.toLocaleString()} rows
                </span>
                <span className="meta-item">
                  {entry.executionTime.toFixed(2)} ms
                </span>
              </div>
            </div>
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromHistory(entry.id);
              }}
              title="Remove from history"
            >
              ×
            </button>
          </div>
          ))
        )}
        {!isExpanded && filteredHistory.length > 5 && (
          <div className="query-history-more">
            <button
              className="btn btn-link"
              onClick={() => setIsExpanded(true)}
            >
              Show {filteredHistory.length - 5} more...
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryHistory;


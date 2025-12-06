import { useState, useMemo } from 'react';

const QuerySuggestions = ({ query, onApplySuggestion }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const suggestionsList = [];
    const upperQuery = query.toUpperCase();

    // Check for SELECT * and suggest specific columns
    if (upperQuery.includes('SELECT *')) {
      const tableMatch = upperQuery.match(/FROM\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1].toLowerCase();
        suggestionsList.push({
          type: 'optimization',
          title: '💡 Optimize SELECT',
          description: `Consider selecting specific columns instead of * for better performance`,
          suggestion: query.replace(/SELECT \*/i, `SELECT id, name, email`),
          priority: 'high',
        });
      }
    }

    // Check for missing WHERE clause on large tables
    if (upperQuery.includes('SELECT') && !upperQuery.includes('WHERE') && !upperQuery.includes('LIMIT')) {
      suggestionsList.push({
        type: 'performance',
        title: '⚡ Add WHERE or LIMIT',
        description: 'Consider adding a WHERE clause or LIMIT to reduce result set size',
        suggestion: query + (query.trim().endsWith(';') ? '' : ';') + '\n-- Add: WHERE condition OR LIMIT 100',
        priority: 'medium',
      });
    }

    // Check for missing indexes hint
    if (upperQuery.includes('JOIN')) {
      suggestionsList.push({
        type: 'optimization',
        title: '🔍 Index Optimization',
        description: 'Ensure JOIN columns are indexed for better performance',
        suggestion: query,
        priority: 'low',
      });
    }

    // Check for ORDER BY without LIMIT
    if (upperQuery.includes('ORDER BY') && !upperQuery.includes('LIMIT')) {
      suggestionsList.push({
        type: 'performance',
        title: '⚡ Add LIMIT with ORDER BY',
        description: 'Consider adding LIMIT when using ORDER BY to improve performance',
        suggestion: query + (query.trim().endsWith(';') ? '' : ';') + '\n-- Add: LIMIT 100',
        priority: 'medium',
      });
    }

    // Suggest using EXPLAIN
    if (!upperQuery.includes('EXPLAIN') && upperQuery.includes('SELECT')) {
      suggestionsList.push({
        type: 'analysis',
        title: '🔬 Analyze Query Plan',
        description: 'Use EXPLAIN to understand query execution plan',
        suggestion: 'EXPLAIN ' + query,
        priority: 'low',
      });
    }

    // Check for potential SQL injection
    if (query.includes("'") && !query.includes("'") && query.includes('WHERE')) {
      suggestionsList.push({
        type: 'security',
        title: '🔒 Parameterize Query',
        description: 'Consider using parameterized queries to prevent SQL injection',
        suggestion: query,
        priority: 'high',
      });
    }

    return suggestionsList;
  }, [query]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="query-suggestions">
      <button
        className="btn btn-secondary btn-sm query-suggestions-toggle"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        💡 Smart Suggestions ({suggestions.length})
        <span className="suggestions-arrow">{showSuggestions ? '▲' : '▼'}</span>
      </button>
      {showSuggestions && (
        <div className="query-suggestions-list">
          {suggestions.map((suggestion, index) => (
            <div key={index} className={`suggestion-item suggestion-${suggestion.priority}`}>
              <div className="suggestion-header">
                <span className="suggestion-title">{suggestion.title}</span>
                <span className={`suggestion-priority priority-${suggestion.priority}`}>
                  {suggestion.priority}
                </span>
              </div>
              <p className="suggestion-description">{suggestion.description}</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onApplySuggestion(suggestion.suggestion);
                  setShowSuggestions(false);
                }}
              >
                Apply Suggestion
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuerySuggestions;


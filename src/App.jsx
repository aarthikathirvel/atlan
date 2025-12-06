import { useState, useCallback } from 'react';
import QueryEditor from './components/QueryEditor';
import ResultsTable from './components/ResultsTable';
import QueryHistory from './components/QueryHistory';
import QueryTemplates from './components/QueryTemplates';
import QueryFavorites from './components/QueryFavorites';
import ExportButtons from './components/ExportButtons';
import { executeQuery } from './data/mockData';
import { useQueryHistory } from './hooks/useQueryHistory';
import { useFavorites } from './hooks/useFavorites';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { history, addToHistory, clearHistory, removeFromHistory } = useQueryHistory();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleExecuteQuery = useCallback(() => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate async query execution
    setTimeout(() => {
      try {
        const queryResult = executeQuery(query);
        setResult(queryResult);
        addToHistory(query, queryResult);
      } catch (err) {
        setError(err.message || 'An error occurred while executing the query');
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    }, 100); // Small delay to show loading state
  }, [query, addToHistory]);

  const handleSelectTemplate = useCallback((templateQuery) => {
    setQuery(templateQuery);
    setError(null);
  }, []);

  const handleSelectHistoryQuery = useCallback((historyQuery) => {
    setQuery(historyQuery);
    setError(null);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 SQL Query Runner</h1>
        <p className="app-subtitle">Execute SQL queries and view results instantly</p>
      </header>

      <main className="app-main">
        <div className="app-sidebar">
          <QueryTemplates onSelectTemplate={handleSelectTemplate} />
          <QueryFavorites
            favorites={favorites}
            onSelectQuery={handleSelectHistoryQuery}
            onRemoveFavorite={removeFromFavorites}
            onAddFavorite={addToFavorites}
            currentQuery={query}
            isFavorite={isFavorite(query)}
          />
          <QueryHistory
            history={history}
            onSelectQuery={handleSelectHistoryQuery}
            onClearHistory={clearHistory}
            onRemoveFromHistory={removeFromHistory}
          />
        </div>

        <div className="app-content">
          <div className="query-section">
            <QueryEditor
              value={query}
              onChange={setQuery}
              onExecute={handleExecuteQuery}
              isLoading={isLoading}
            />
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>

          <div className="results-section">
            <div className="results-section-header">
              <h2>Query Results</h2>
              {result && (
                <ExportButtons
                  columns={result.data.columns}
                  rows={result.data.rows}
                  disabled={isLoading}
                />
              )}
            </div>
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Executing query...</p>
              </div>
            ) : result ? (
              <ResultsTable
                columns={result.data.columns}
                rows={result.data.rows}
                executionTime={result.executionTime}
                rowsAffected={result.rowsAffected}
                message={result.message}
              />
            ) : (
              <div className="no-results">
                <p>No results to display. Execute a query to see results here.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>SQL Query Runner - Built with React & Vite</p>
      </footer>
    </div>
  );
}

export default App;

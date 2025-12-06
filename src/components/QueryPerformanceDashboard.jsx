import { useMemo } from 'react';
import { useQueryHistory } from '../hooks/useQueryHistory';

const QueryPerformanceDashboard = () => {
  const { history } = useQueryHistory();

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        totalQueries: 0,
        avgExecutionTime: 0,
        totalRowsReturned: 0,
        fastestQuery: null,
        slowestQuery: null,
        queriesByTime: [],
      };
    }

    const totalQueries = history.length;
    const avgExecutionTime = history.reduce((sum, h) => sum + h.executionTime, 0) / totalQueries;
    const totalRowsReturned = history.reduce((sum, h) => sum + h.rowsAffected, 0);
    const fastestQuery = history.reduce((min, h) => 
      h.executionTime < min.executionTime ? h : min, history[0]);
    const slowestQuery = history.reduce((max, h) => 
      h.executionTime > max.executionTime ? h : max, history[0]);

    // Last 10 queries for timeline
    const queriesByTime = history.slice(-10).map(h => ({
      time: new Date(h.timestamp).toLocaleTimeString(),
      executionTime: h.executionTime,
      rowsAffected: h.rowsAffected,
    }));

    return {
      totalQueries,
      avgExecutionTime,
      totalRowsReturned,
      fastestQuery,
      slowestQuery,
      queriesByTime,
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="performance-dashboard">
        <div className="performance-dashboard-header">
          <h3>⚡ Performance Dashboard</h3>
        </div>
        <div className="performance-dashboard-empty">
          <p>Execute queries to see performance metrics</p>
        </div>
      </div>
    );
  }

  const maxExecutionTime = Math.max(...stats.queriesByTime.map(q => q.executionTime), 1);

  return (
    <div className="performance-dashboard">
      <div className="performance-dashboard-header">
        <h3>⚡ Performance Dashboard</h3>
      </div>
      <div className="performance-stats-grid">
        <div className="performance-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.totalQueries}</div>
          <div className="stat-label">Total Queries</div>
        </div>
        <div className="performance-stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-value">{stats.avgExecutionTime.toFixed(2)}ms</div>
          <div className="stat-label">Avg Execution Time</div>
        </div>
        <div className="performance-stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">{stats.totalRowsReturned.toLocaleString()}</div>
          <div className="stat-label">Total Rows Returned</div>
        </div>
        <div className="performance-stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-value">{stats.fastestQuery.executionTime.toFixed(2)}ms</div>
          <div className="stat-label">Fastest Query</div>
        </div>
      </div>
      <div className="performance-timeline">
        <h4>Recent Query Performance</h4>
        <div className="timeline-chart">
          {stats.queriesByTime.map((query, index) => {
            const height = (query.executionTime / maxExecutionTime) * 100;
            return (
              <div key={index} className="timeline-bar-container">
                <div
                  className="timeline-bar"
                  style={{ height: `${height}%` }}
                  title={`${query.executionTime.toFixed(2)}ms - ${query.rowsAffected} rows`}
                >
                  <span className="timeline-value">{query.executionTime.toFixed(0)}ms</span>
                </div>
                <div className="timeline-label">{query.time}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="performance-extremes">
        <div className="extreme-card fast">
          <h4>⚡ Fastest Query</h4>
          <code>{stats.fastestQuery.query.substring(0, 100)}{stats.fastestQuery.query.length > 100 ? '...' : ''}</code>
          <div className="extreme-metrics">
            <span>{stats.fastestQuery.executionTime.toFixed(2)}ms</span>
            <span>{stats.fastestQuery.rowsAffected.toLocaleString()} rows</span>
          </div>
        </div>
        <div className="extreme-card slow">
          <h4>🐌 Slowest Query</h4>
          <code>{stats.slowestQuery.query.substring(0, 100)}{stats.slowestQuery.query.length > 100 ? '...' : ''}</code>
          <div className="extreme-metrics">
            <span>{stats.slowestQuery.executionTime.toFixed(2)}ms</span>
            <span>{stats.slowestQuery.rowsAffected.toLocaleString()} rows</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryPerformanceDashboard;


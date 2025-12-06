import { useMemo } from 'react';

const ResultStatistics = ({ columns, rows }) => {
  const statistics = useMemo(() => {
    if (!rows.length) return {};

    const stats = {};
    columns.forEach(col => {
      const values = rows.map(row => row[col]).filter(v => v != null);
      if (values.length === 0) return;

      const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
      const stringValues = values.filter(v => typeof v === 'string' || isNaN(parseFloat(v)));

      if (numericValues.length > 0) {
        const sorted = [...numericValues].sort((a, b) => a - b);
        stats[col] = {
          type: 'numeric',
          count: numericValues.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          sum: numericValues.reduce((a, b) => a + b, 0),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          median: sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)],
        };
      } else if (stringValues.length > 0) {
        const unique = new Set(stringValues);
        const frequencies = {};
        stringValues.forEach(v => {
          frequencies[v] = (frequencies[v] || 0) + 1;
        });
        const topValues = Object.entries(frequencies)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        stats[col] = {
          type: 'categorical',
          count: stringValues.length,
          unique: unique.size,
          topValues,
        };
      }
    });
    return stats;
  }, [columns, rows]);

  if (!rows.length) {
    return (
      <div className="result-statistics-empty">
        <p>No data available for statistics</p>
      </div>
    );
  }

  return (
    <div className="result-statistics">
      <div className="result-statistics-header">
        <h3>📈 Data Statistics</h3>
        <span className="statistics-badge">{Object.keys(statistics).length} columns analyzed</span>
      </div>
      <div className="statistics-grid">
        {Object.entries(statistics).map(([col, stat]) => (
          <div key={col} className="statistics-card">
            <div className="statistics-card-header">
              <h4>{col}</h4>
              <span className={`statistics-type-badge ${stat.type}`}>
                {stat.type === 'numeric' ? '🔢 Numeric' : '📝 Text'}
              </span>
            </div>
            <div className="statistics-content">
              {stat.type === 'numeric' ? (
                <>
                  <div className="stat-row">
                    <span className="stat-label">Count:</span>
                    <span className="stat-value">{stat.count.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Min:</span>
                    <span className="stat-value">{stat.min.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Max:</span>
                    <span className="stat-value">{stat.max.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Average:</span>
                    <span className="stat-value">{stat.avg.toFixed(2)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Median:</span>
                    <span className="stat-value">{stat.median.toFixed(2)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Sum:</span>
                    <span className="stat-value">{stat.sum.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-row">
                    <span className="stat-label">Count:</span>
                    <span className="stat-value">{stat.count.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Unique Values:</span>
                    <span className="stat-value">{stat.unique.toLocaleString()}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Top Values:</span>
                    <div className="top-values-list">
                      {stat.topValues.map(([value, count], idx) => (
                        <div key={idx} className="top-value-item">
                          <span className="top-value">{value.length > 20 ? value.substring(0, 20) + '...' : value}</span>
                          <span className="top-value-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultStatistics;


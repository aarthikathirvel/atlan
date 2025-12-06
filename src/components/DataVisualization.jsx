import { useState, useMemo } from 'react';

const DataVisualization = ({ columns, rows }) => {
  const [selectedChart, setSelectedChart] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');

  // Detect numeric columns
  const numericColumns = useMemo(() => {
    if (!rows.length) return [];
    return columns.filter(col => {
      const sample = rows[0][col];
      return typeof sample === 'number' || !isNaN(parseFloat(sample));
    });
  }, [columns, rows]);

  // Detect categorical columns
  const categoricalColumns = useMemo(() => {
    if (!rows.length) return [];
    return columns.filter(col => {
      const sample = rows[0][col];
      return typeof sample === 'string' || (typeof sample !== 'number' && isNaN(parseFloat(sample)));
    });
  }, [columns, rows]);

  // Auto-detect best chart configuration
  const autoDetectChart = useMemo(() => {
    if (numericColumns.length >= 2) {
      return {
        type: 'line',
        xAxis: categoricalColumns[0] || columns[0],
        yAxis: numericColumns[0],
      };
    }
    if (numericColumns.length === 1 && categoricalColumns.length >= 1) {
      return {
        type: 'bar',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
      };
    }
    return null;
  }, [numericColumns, categoricalColumns, columns]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!selectedChart || !xAxis || !yAxis) return [];
    
    const grouped = {};
    rows.forEach(row => {
      const key = String(row[xAxis] ?? 'N/A');
      const value = parseFloat(row[yAxis]) || 0;
      grouped[key] = (grouped[key] || 0) + value;
    });

    return Object.entries(grouped)
      .map(([key, value]) => ({ label: key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20); // Limit to top 20
  }, [rows, selectedChart, xAxis, yAxis]);

  const maxValue = useMemo(() => {
    return chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 1;
  }, [chartData]);

  const renderBarChart = () => {
    const barWidth = 100 / chartData.length;
    return (
      <div className="chart-container">
        <svg viewBox="0 0 800 400" className="chart-svg">
          {chartData.map((item, index) => {
            const height = (item.value / maxValue) * 300;
            const x = (index * 800) / chartData.length + 20;
            const y = 350 - height;
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={800 / chartData.length - 10}
                  height={height}
                  fill="url(#barGradient)"
                  className="chart-bar"
                />
                <text
                  x={x + (800 / chartData.length - 10) / 2}
                  y={370}
                  textAnchor="middle"
                  fontSize="12"
                  fill="currentColor"
                  className="chart-label"
                >
                  {item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label}
                </text>
                <text
                  x={x + (800 / chartData.length - 10) / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="11"
                  fill="currentColor"
                  className="chart-value"
                >
                  {item.value.toLocaleString()}
                </text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const renderLineChart = () => {
    const points = chartData.map((item, index) => {
      const x = (index * 760) / (chartData.length - 1 || 1) + 40;
      const y = 350 - (item.value / maxValue) * 300;
      return { x, y, label: item.label, value: item.value };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="chart-container">
        <svg viewBox="0 0 800 400" className="chart-svg">
          <path
            d={pathData}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            className="chart-line"
          />
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#4f46e5"
                className="chart-point"
              />
              <text
                x={point.x}
                y={370}
                textAnchor="middle"
                fontSize="10"
                fill="currentColor"
                className="chart-label"
              >
                {point.label.length > 8 ? point.label.substring(0, 8) + '...' : point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const renderPieChart = () => {
    let currentAngle = -90;
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const radius = 120;
    const centerX = 400;
    const centerY = 200;

    return (
      <div className="chart-container">
        <svg viewBox="0 0 800 400" className="chart-svg">
          {chartData.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;

            const colors = [
              '#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981',
              '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
            ];

            return (
              <g key={index}>
                <path
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  className="chart-pie-slice"
                />
                <text
                  x={centerX + (radius * 1.3) * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                  y={centerY + (radius * 1.3) * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                  textAnchor="middle"
                  fontSize="11"
                  fill="white"
                  fontWeight="bold"
                  className="chart-pie-label"
                >
                  {percentage.toFixed(1)}%
                </text>
              </g>
            );
          })}
          <circle cx={centerX} cy={centerY} r="60" fill="white" />
          <text x={centerX} y={centerY} textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">
            Total
          </text>
          <text x={centerX} y={centerY + 20} textAnchor="middle" fontSize="12" fill="currentColor">
            {total.toLocaleString()}
          </text>
        </svg>
        <div className="chart-legend">
          {chartData.map((item, index) => {
            const colors = [
              '#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981',
              '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
            ];
            return (
              <div key={index} className="chart-legend-item">
                <span className="chart-legend-color" style={{ backgroundColor: colors[index % colors.length] }}></span>
                <span className="chart-legend-label">{item.label}</span>
                <span className="chart-legend-value">{item.value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!rows.length || numericColumns.length === 0) {
    return (
      <div className="data-visualization-empty">
        <p>📊 No numeric data available for visualization</p>
      </div>
    );
  }

  if (!selectedChart) {
    return (
      <div className="data-visualization-panel">
        <div className="data-visualization-header">
          <h3>📊 Data Visualization</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (autoDetectChart) {
                setSelectedChart(true);
                setChartType(autoDetectChart.type);
                setXAxis(autoDetectChart.xAxis);
                setYAxis(autoDetectChart.yAxis);
              } else {
                setSelectedChart(true);
                setChartType('bar');
                setXAxis(categoricalColumns[0] || columns[0]);
                setYAxis(numericColumns[0]);
              }
            }}
          >
            Create Chart
          </button>
        </div>
        <div className="data-visualization-suggestions">
          <p>Auto-detect available:</p>
          <ul>
            {numericColumns.length > 0 && (
              <li>✅ {numericColumns.length} numeric column(s) detected</li>
            )}
            {categoricalColumns.length > 0 && (
              <li>✅ {categoricalColumns.length} categorical column(s) detected</li>
            )}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="data-visualization-panel">
      <div className="data-visualization-header">
        <h3>📊 Data Visualization</h3>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setSelectedChart(null)}
        >
          ← Back
        </button>
      </div>
      <div className="chart-controls">
        <div className="chart-control-group">
          <label>Chart Type:</label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
        <div className="chart-control-group">
          <label>X-Axis (Category):</label>
          <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
        <div className="chart-control-group">
          <label>Y-Axis (Value):</label>
          <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="chart-wrapper">
        {chartType === 'bar' && renderBarChart()}
        {chartType === 'line' && renderLineChart()}
        {chartType === 'pie' && renderPieChart()}
      </div>
    </div>
  );
};

export default DataVisualization;


import { useMemo } from 'react';

const QueryExplainPlan = ({ query, executionTime, rowsAffected }) => {
  const explainPlan = useMemo(() => {
    if (!query) return null;

    const upperQuery = query.toUpperCase();
    const plan = {
      query: query,
      estimatedCost: Math.random() * 1000 + 100,
      operations: [],
    };

    // Parse query to create execution plan
    if (upperQuery.includes('SELECT')) {
      plan.operations.push({
        type: 'Scan',
        table: upperQuery.match(/FROM\s+(\w+)/i)?.[1] || 'table',
        rows: rowsAffected || 100,
        cost: Math.random() * 200 + 50,
        description: 'Full table scan',
      });
    }

    if (upperQuery.includes('WHERE')) {
      plan.operations.push({
        type: 'Filter',
        condition: 'WHERE clause',
        rows: Math.floor((rowsAffected || 100) * 0.3),
        cost: Math.random() * 100 + 20,
        description: 'Filtering rows based on condition',
      });
    }

    if (upperQuery.includes('JOIN')) {
      const joinType = upperQuery.includes('INNER JOIN') ? 'INNER' :
                      upperQuery.includes('LEFT JOIN') ? 'LEFT' :
                      upperQuery.includes('RIGHT JOIN') ? 'RIGHT' : 'JOIN';
      plan.operations.push({
        type: 'Join',
        joinType: joinType,
        tables: upperQuery.match(/JOIN\s+(\w+)/gi)?.map(m => m.replace(/JOIN\s+/i, '')) || [],
        rows: Math.floor((rowsAffected || 100) * 0.5),
        cost: Math.random() * 300 + 100,
        description: `${joinType} JOIN operation`,
      });
    }

    if (upperQuery.includes('ORDER BY')) {
      plan.operations.push({
        type: 'Sort',
        columns: upperQuery.match(/ORDER BY\s+([^,\s]+)/i)?.[1] || 'column',
        rows: rowsAffected || 100,
        cost: Math.random() * 150 + 50,
        description: 'Sorting result set',
      });
    }

    if (upperQuery.includes('GROUP BY')) {
      plan.operations.push({
        type: 'Aggregate',
        columns: upperQuery.match(/GROUP BY\s+([^,\s]+)/i)?.[1] || 'column',
        rows: Math.floor((rowsAffected || 100) * 0.2),
        cost: Math.random() * 100 + 30,
        description: 'Grouping and aggregation',
      });
    }

    plan.totalCost = plan.operations.reduce((sum, op) => sum + op.cost, 0);
    plan.executionTime = executionTime || 0;

    return plan;
  }, [query, executionTime, rowsAffected]);

  if (!explainPlan) {
    return (
      <div className="query-explain-plan-empty">
        <p>Execute a query to see the execution plan</p>
      </div>
    );
  }

  const maxCost = Math.max(...explainPlan.operations.map(op => op.cost), 1);

  return (
    <div className="query-explain-plan">
      <div className="explain-plan-header">
        <h3>🔬 Query Execution Plan</h3>
        <div className="explain-plan-summary">
          <span className="summary-item">
            <strong>Estimated Cost:</strong> {explainPlan.totalCost.toFixed(2)}
          </span>
          <span className="summary-item">
            <strong>Execution Time:</strong> {explainPlan.executionTime.toFixed(2)}ms
          </span>
          <span className="summary-item">
            <strong>Operations:</strong> {explainPlan.operations.length}
          </span>
        </div>
      </div>
      <div className="explain-plan-tree">
        {explainPlan.operations.map((operation, index) => (
          <div key={index} className="plan-operation">
            <div className="operation-header">
              <span className={`operation-type operation-${operation.type.toLowerCase()}`}>
                {operation.type}
              </span>
              <span className="operation-cost">Cost: {operation.cost.toFixed(2)}</span>
            </div>
            <div className="operation-details">
              <div className="operation-description">{operation.description}</div>
              {operation.table && (
                <div className="operation-meta">Table: {operation.table}</div>
              )}
              {operation.joinType && (
                <div className="operation-meta">Join Type: {operation.joinType}</div>
              )}
              {operation.columns && (
                <div className="operation-meta">Columns: {operation.columns}</div>
              )}
              <div className="operation-meta">Rows: {operation.rows.toLocaleString()}</div>
            </div>
            <div className="operation-cost-bar">
              <div
                className="operation-cost-fill"
                style={{ width: `${(operation.cost / maxCost) * 100}%` }}
              ></div>
            </div>
            {index < explainPlan.operations.length - 1 && (
              <div className="operation-arrow">↓</div>
            )}
          </div>
        ))}
      </div>
      <div className="explain-plan-tips">
        <h4>💡 Optimization Tips</h4>
        <ul>
          {explainPlan.operations.some(op => op.type === 'Scan') && (
            <li>Consider adding indexes on frequently queried columns</li>
          )}
          {explainPlan.operations.some(op => op.type === 'Sort') && (
            <li>Sorting can be expensive - consider using indexes on ORDER BY columns</li>
          )}
          {explainPlan.operations.some(op => op.type === 'Join') && (
            <li>Ensure JOIN columns are indexed for better performance</li>
          )}
          {explainPlan.totalCost > 500 && (
            <li>High cost detected - consider query optimization</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QueryExplainPlan;


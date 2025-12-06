import { exportToCSV, exportToJSON } from '../utils/exportUtils';

const ExportButtons = ({ columns, rows, disabled }) => {
  const handleExportCSV = () => {
    exportToCSV(columns, rows);
  };

  const handleExportJSON = () => {
    exportToJSON(columns, rows);
  };

  if (!columns.length || !rows.length) {
    return null;
  }

  return (
    <div className="export-buttons">
      <button
        className="btn btn-secondary btn-sm"
        onClick={handleExportCSV}
        disabled={disabled}
        title="Export to CSV"
      >
        📥 Export CSV
      </button>
      <button
        className="btn btn-secondary btn-sm"
        onClick={handleExportJSON}
        disabled={disabled}
        title="Export to JSON"
      >
        📥 Export JSON
      </button>
    </div>
  );
};

export default ExportButtons;


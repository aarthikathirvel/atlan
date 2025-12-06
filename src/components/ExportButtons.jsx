import { useState, useEffect } from 'react';
import { exportToCSV, exportToJSON, exportToExcel } from '../utils/exportUtils';

const ExportButtons = ({ columns, rows, disabled }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportCSV = () => {
    exportToCSV(columns, rows);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    exportToJSON(columns, rows);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportToExcel(columns, rows);
    setShowExportMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!showExportMenu) return;
    
    const handleClickOutside = (event) => {
      const container = document.querySelector('.export-buttons-container');
      if (container && !container.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  if (!columns.length || !rows.length) {
    return null;
  }

  return (
    <div className="export-buttons-container">
      <button
        className="btn btn-secondary btn-sm export-button-main"
        onClick={() => setShowExportMenu(!showExportMenu)}
        disabled={disabled}
        title="Export data"
      >
        📥 Export
        <span className="export-arrow">▼</span>
      </button>
      {showExportMenu && (
        <>
          <div 
            className="export-menu-overlay"
            onClick={() => setShowExportMenu(false)}
          />
          <div className="export-menu">
            <button
              className="export-menu-item"
              onClick={handleExportCSV}
              disabled={disabled}
              title="Export to CSV"
            >
              <span className="export-icon">📄</span>
              <span>Export CSV</span>
            </button>
            <button
              className="export-menu-item"
              onClick={handleExportJSON}
              disabled={disabled}
              title="Export to JSON"
            >
              <span className="export-icon">📋</span>
              <span>Export JSON</span>
            </button>
            <button
              className="export-menu-item"
              onClick={handleExportExcel}
              disabled={disabled}
              title="Export to Excel"
            >
              <span className="export-icon">📊</span>
              <span>Export Excel</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButtons;


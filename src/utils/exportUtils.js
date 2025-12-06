// Utility functions for exporting query results

export const exportToExcel = (columns, rows) => {
  // Dynamic import to avoid bundling xlsx in main bundle
  import('xlsx').then((XLSX) => {
    const data = [
      columns, // Headers
      ...rows.map(row => columns.map(col => row[col] ?? '')) // Data rows
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `query_results_${Date.now()}.xlsx`);
  }).catch((error) => {
    console.error('Error exporting to Excel:', error);
    alert('Failed to export to Excel. Please try again.');
  });
};

export const exportToCSV = (columns, rows) => {
  const headers = columns.join(',');
  const csvRows = rows.map(row => 
    columns.map(col => {
      const value = row[col];
      // Handle values that might contain commas or quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  const csvContent = [headers, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `query_results_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (columns, rows) => {
  const data = rows.map(row => {
    const obj = {};
    columns.forEach(col => {
      obj[col] = row[col];
    });
    return obj;
  });
  
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `query_results_${Date.now()}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


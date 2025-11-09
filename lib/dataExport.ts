import { DataPoint } from './types';

/**
 * Export data to CSV format
 */
export function exportToCSV(data: DataPoint[], filename?: string): void {
  try {
    // CSV header
    const headers = ['Timestamp', 'Value', 'Category'];
    const csvRows = [headers.join(',')];

    // Add data rows
    data.forEach((point) => {
      const timestamp = new Date(point.timestamp).toISOString();
      const value = point.value.toString();
      const category = point.category || '';
      csvRows.push([timestamp, value, category].join(','));
    });

    // Create CSV content
    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV');
  }
}

/**
 * Export data to Excel (XLSX) format using CSV (compatible with Excel)
 */
export function exportToExcel(data: DataPoint[], filename?: string): void {
  try {
    // Excel can open CSV files, but we'll create a proper format
    const headers = ['Timestamp', 'Value', 'Category'];
    const csvRows = [headers.join('\t')]; // Use tab separator for better Excel compatibility

    // Add data rows
    data.forEach((point) => {
      const timestamp = new Date(point.timestamp).toISOString();
      const value = point.value.toString();
      const category = point.category || '';
      csvRows.push([timestamp, value, category].join('\t'));
    });

    // Create content
    const content = csvRows.join('\n');

    // Create blob with Excel-compatible MIME type
    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `dashboard-data-${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw new Error('Failed to export Excel');
  }
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: DataPoint[], filename?: string): void {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `dashboard-data-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw new Error('Failed to export JSON');
  }
}


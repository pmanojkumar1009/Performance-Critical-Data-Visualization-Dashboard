import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DataPoint } from './types';

interface ExportOptions {
  title?: string;
  includeMetrics?: boolean;
  includeTable?: boolean;
  filename?: string;
}

/**
 * Export dashboard to PDF
 * Captures the chart canvas and other dashboard elements
 */
export async function exportDashboardToPDF(
  chartCanvas: HTMLCanvasElement | null,
  metricsElement: HTMLElement | null,
  tableElement: HTMLElement | null,
  data: DataPoint[],
  chartType: string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    title = 'Performance Dashboard Report',
    includeMetrics = true,
    includeTable = true,
    filename = `dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
  } = options;

  try {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = margin;

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Chart Type: ${chartType.toUpperCase()}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Data Points: ${data.length.toLocaleString()}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;

    // Export chart canvas
    if (chartCanvas) {
      try {
        const chartImage = await html2canvas(chartCanvas, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
        });

        const chartImgData = chartImage.toDataURL('image/png');
        const chartWidth = pageWidth - 2 * margin;
        const chartHeight = (chartImage.height * chartWidth) / chartImage.width;

        // Check if we need a new page
        if (yPosition + chartHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(chartImgData, 'PNG', margin, yPosition, chartWidth, chartHeight);
        yPosition += chartHeight + 5;
      } catch (error) {
        console.error('Error capturing chart:', error);
        pdf.text('Chart could not be captured', margin, yPosition);
        yPosition += 10;
      }
    }

    // Export performance metrics
    if (includeMetrics && metricsElement) {
      try {
        const metricsImage = await html2canvas(metricsElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
        });

        const metricsImgData = metricsImage.toDataURL('image/png');
        const metricsWidth = pageWidth - 2 * margin;
        const metricsHeight = (metricsImage.height * metricsWidth) / metricsImage.width;

        // Check if we need a new page
        if (yPosition + metricsHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(metricsImgData, 'PNG', margin, yPosition, metricsWidth, metricsHeight);
        yPosition += metricsHeight + 5;
      } catch (error) {
        console.error('Error capturing metrics:', error);
      }
    }

    // Export data table
    if (includeTable && tableElement) {
      try {
        // Add new page for table
        pdf.addPage();
        yPosition = margin;

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Data Table', margin, yPosition);
        yPosition += 10;

        const tableImage = await html2canvas(tableElement, {
          backgroundColor: '#ffffff',
          scale: 1.5,
          logging: false,
          useCORS: true,
          height: tableElement.scrollHeight,
        });

        const tableImgData = tableImage.toDataURL('image/png');
        const tableWidth = pageWidth - 2 * margin;
        const tableHeight = (tableImage.height * tableWidth) / tableImage.width;

        // If table is too tall, split across pages
        if (tableHeight > pageHeight - yPosition - margin) {
          const maxHeight = pageHeight - yPosition - margin;
          pdf.addImage(tableImgData, 'PNG', margin, yPosition, tableWidth, maxHeight);
          // Note: For very long tables, you might want to implement pagination
        } else {
          pdf.addImage(tableImgData, 'PNG', margin, yPosition, tableWidth, tableHeight);
        }
      } catch (error) {
        console.error('Error capturing table:', error);
        pdf.text('Table could not be captured', margin, yPosition);
      }
    }

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

/**
 * Export chart only to PDF
 */
export async function exportChartToPDF(
  chartCanvas: HTMLCanvasElement,
  chartType: string,
  dataCount: number,
  filename?: string
): Promise<void> {
  try {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Add title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${chartType.toUpperCase()} Chart`, pageWidth / 2, margin + 5, { align: 'center' });

    // Add metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Data Points: ${dataCount.toLocaleString()}`, margin, margin + 12);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, margin + 17);

    // Capture chart
    const chartImage = await html2canvas(chartCanvas, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const chartImgData = chartImage.toDataURL('image/png');
    const chartWidth = pageWidth - 2 * margin;
    const chartHeight = (chartImage.height * chartWidth) / chartImage.width;
    const chartY = margin + 25;

    pdf.addImage(chartImgData, 'PNG', margin, chartY, chartWidth, chartHeight);

    // Save PDF
    pdf.save(filename || `chart-${chartType}-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generating chart PDF:', error);
    throw new Error('Failed to export chart PDF. Please try again.');
  }
}


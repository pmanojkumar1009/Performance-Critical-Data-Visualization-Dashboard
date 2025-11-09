/**
 * Export chart canvas to PNG or SVG
 */

export async function exportChartToPNG(
  canvas: HTMLCanvasElement,
  filename?: string
): Promise<void> {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename || `chart-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export PNG');
  }
}

export async function exportChartToSVG(
  canvas: HTMLCanvasElement,
  filename?: string
): Promise<void> {
  try {
    // Convert canvas to SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', canvas.width.toString());
    svg.setAttribute('height', canvas.height.toString());
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('href', canvas.toDataURL('image/png'));
    image.setAttribute('width', canvas.width.toString());
    image.setAttribute('height', canvas.height.toString());
    svg.appendChild(image);

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.download = filename || `chart-${new Date().toISOString().split('T')[0]}.svg`;
    link.href = svgUrl;
    link.click();

    URL.revokeObjectURL(svgUrl);
  } catch (error) {
    console.error('Error exporting SVG:', error);
    throw new Error('Failed to export SVG');
  }
}


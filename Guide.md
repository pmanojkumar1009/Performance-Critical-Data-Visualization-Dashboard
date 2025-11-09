# Performance Dashboard - Complete User Guide

This guide explains every feature in the Performance Dashboard and how to use them. Whether you're a developer, tester, or end user, this document will help you understand and use all the features available.

## Table of Contents

1. Getting Started
2. Dashboard Overview
3. Chart Types and How to Use Them
4. Interactive Controls
5. Data Filtering
6. Time Aggregation
7. Performance Monitoring
8. Export Features
9. Keyboard Shortcuts
10. Advanced Features
11. Troubleshooting

## Getting Started

### First Time Setup

After installing dependencies with `npm install` and starting the server with `npm run dev`, navigate to `http://localhost:3000/dashboard` in your browser. The dashboard will automatically start generating data and displaying it in real-time.

### Initial View

When you first open the dashboard, you'll see:
- A line chart in the center showing real-time data
- Performance metrics panel at the top showing FPS, memory, and other stats
- Control panel on the left with various options
- Data table at the bottom showing the raw data points

## Dashboard Overview

The dashboard is divided into several sections:

**Header Section**: Contains the title, theme toggle, streaming controls, reset button, export menu, and fullscreen button.

**Performance Metrics Panel**: Shows real-time performance data including FPS, memory usage, render time, data point count, and update latency.

**Left Sidebar**: Contains all the interactive controls including chart type selector, zoom and pan controls, time aggregation, filters, and statistical overlays.

**Main Chart Area**: Displays the selected chart type with all your data visualizations.

**Data Table**: Shows the raw data points in a scrollable, virtualized table.

**Stress Test Mode**: Located at the bottom, allows you to test the dashboard with different data loads.

## Chart Types and How to Use Them

### Line Chart

The line chart is the default view and shows data as a continuous line over time. This is best for seeing trends and patterns in your data.

**How to Use**: Click "Line" in the Chart Type panel on the left. The chart will switch to line view immediately.

**Special Features for Line Chart**:
- Crosshair: Hover over the chart to see a crosshair with exact values
- Tooltip: Click on the chart to see detailed information about data points
- Brush Selection: Hold Shift and drag on the chart to select a time range
- Statistical Overlays: You can add moving averages and exponential moving averages (see Advanced Features section)

### Bar Chart

The bar chart displays data as vertical bars, making it easy to compare values at different time points.

**How to Use**: Click "Bar" in the Chart Type panel. The chart automatically samples data if you have more than 100 points to maintain performance.

**When to Use**: Bar charts work well when you want to compare discrete values or when you have aggregated data.

### Scatter Plot

The scatter plot shows each data point as an individual dot, useful for seeing the distribution of your data.

**How to Use**: Click "Scatter" in the Chart Type panel. The chart samples data if you have more than 5,000 points.

**When to Use**: Scatter plots are great for identifying outliers, clusters, or patterns in data distribution.

### Heatmap

The heatmap visualizes data density using color intensity. Areas with more data points appear brighter or in different colors.

**How to Use**: Click "Heatmap" in the Chart Type panel. The data is automatically binned into a 50x50 grid for visualization.

**When to Use**: Heatmaps help you see where data is concentrated and identify hotspots in your dataset.

## Interactive Controls

### Zoom Controls

Zoom allows you to focus on specific parts of your data by magnifying the view.

**How to Zoom In**: 
- Click the "Zoom In" button in the Zoom & Pan Controls panel
- Or press the "Z" key on your keyboard
- Each click increases the zoom level by 20%

**How to Zoom Out**:
- Click the "Zoom Out" button
- Or press the "X" key on your keyboard
- Each click decreases the zoom level

**How to Reset Zoom**:
- Click the "Reset Zoom/Pan" button
- Or press the "R" key on your keyboard
- This returns the chart to its original view

**Current Zoom Level**: The zoom level is displayed below the buttons (e.g., "Zoom: 1.50x")

### Pan Controls

Panning lets you move around the chart when you're zoomed in, like moving a map.

**How to Pan**:
1. Click and hold anywhere on the chart
2. Drag your mouse in the direction you want to move
3. Release to stop panning

**Visual Feedback**: The cursor changes to a "grab" hand when you hover over the chart, and "grabbing" when you're actively panning.

**Tip**: Pan works best when you're zoomed in. If you're at 1x zoom, there's nothing to pan to.

### Brush Selection

Brush selection lets you select a specific time range on the chart for detailed analysis.

**How to Use Brush Selection**:
1. Make sure you're viewing a Line Chart (brush selection only works on line charts)
2. Hold the Shift key on your keyboard
3. Click and drag on the chart to create a selection rectangle
4. The selected time range will be highlighted

**What Happens**: The selected range is logged to the console. You can use this to filter or analyze specific time periods.

## Data Filtering

The Filter Panel allows you to show only data points that fall within a specific value range.

### How to Filter Data

**Step 1**: Look at the "Data Range" box at the top of the Filter Panel. This shows you the actual min and max values in your current dataset (e.g., "267245.10 - 267256.60").

**Step 2**: Enter your desired minimum value in the "Min Value" field. For example, if you want to see only values above 267000, enter "267000".

**Step 3**: Enter your desired maximum value in the "Max Value" field. For example, if you want to see only values below 267300, enter "267300".

**Step 4**: Click the "Apply" button to apply the filter.

**What Happens**: 
- The chart will update to show only data points within your specified range
- The Y-axis will automatically rescale to fit the filtered data
- The data table will show only the filtered rows
- The "visible points" count will decrease

### Understanding Filter Results

**If You See 0 Points**: This means no data points fall within your filter range. Check the "Data Range" box to see what values are actually in your data, then adjust your filter accordingly.

**Warning Message**: If your filter results in no data, you'll see a yellow warning box explaining that your filter range doesn't overlap with the data range, along with suggestions for correct values.

**Clearing Filters**: Click the "Clear" button to remove all filters and see all your data again.

### Filter Tips

- You can filter by minimum only (leave max empty) or maximum only (leave min empty)
- The filter works in real-time - you can apply it while data is streaming
- Filters work together with time aggregation - you can filter first, then aggregate
- The filter panel shows helpful information about your data range to guide you

## Time Aggregation

Time aggregation groups multiple data points into time buckets, making it easier to see trends over longer periods.

### How to Use Time Aggregation

**Step 1**: In the "Time Aggregation" panel, you'll see three options:
- 1 Minute: Groups data into 1-minute buckets
- 5 Minutes: Groups data into 5-minute buckets  
- 1 Hour: Groups data into 1-hour buckets

**Step 2**: Click on the aggregation period you want (e.g., "5 Minutes")

**What Happens**:
- The chart updates to show aggregated data points
- Each point represents the average value for that time period
- You'll see fewer points on the chart (because they're grouped)
- The data table shows the aggregated values

**Clearing Aggregation**: Click "Clear Aggregation" to return to the original data points.

### When to Use Aggregation

- **1 Minute**: Use when you have very high-frequency data and want to see minute-by-minute trends
- **5 Minutes**: Good for medium-term analysis, balances detail with overview
- **1 Hour**: Best for long-term trend analysis when you have hours or days of data

**Tip**: Aggregation works great with filters. You can filter your data first, then aggregate the filtered results.

## Performance Monitoring

The Performance Monitor panel at the top of the dashboard shows real-time metrics about how the dashboard is performing.

### Understanding the Metrics

**FPS (Frames Per Second)**: Shows how many frames are being rendered per second. Target is 60 FPS. Colors indicate performance:
- Green (55-60 FPS): Optimal performance
- Yellow (30-54 FPS): Good performance
- Red (below 30 FPS): Needs optimization

**Memory Usage**: Shows the current JavaScript heap size in megabytes. This should stay relatively stable. If it keeps growing, there might be a memory leak.

**Render Time**: Shows how long it takes to render each frame in milliseconds. Should be under 16ms for 60 FPS.

**Data Points**: Shows the total number of data points currently in the dataset.

**Update Latency**: Shows the time between data updates in milliseconds. Should be close to 100ms (the update interval).

### Performance Status

At the bottom of the Performance Monitor, you'll see a status badge:
- "Optimal": FPS is 55 or higher
- "Good": FPS is between 30 and 54
- "Needs Optimization": FPS is below 30

### Using Performance Data

- If FPS drops below 30, try reducing the data point count using Stress Test Mode
- If memory keeps growing, refresh the page to reset
- Monitor render time - if it's consistently above 16ms, the chart might be struggling with the data load

## Export Features

The dashboard includes comprehensive export functionality to save your data and charts in various formats.

### How to Access Export Options

Click the "Export" button in the header (it looks like a download icon). A dropdown menu will appear with all export options.

### Chart Export Options

**Export as PNG**: Saves the current chart as a PNG image file. Perfect for including charts in presentations or documents.

**How to Use**: Click "Export PNG" from the export menu. The chart will be downloaded immediately with a filename like "chart-line-2024-01-15.png".

**Export as SVG**: Saves the chart as an SVG vector file. SVG files are scalable and work great for printing or high-resolution displays.

**How to Use**: Click "Export SVG" from the export menu (or press Shift+S). The file will be downloaded with a filename like "chart-line-2024-01-15.svg".

### Data Export Options

**Export as CSV**: Saves all your data points as a comma-separated values file. Can be opened in Excel, Google Sheets, or any spreadsheet application.

**How to Use**: Click "Export CSV" from the export menu. The file will include timestamp, value, and category columns.

**Export as Excel**: Saves data as an Excel-compatible file (.xls format). Opens directly in Microsoft Excel.

**How to Use**: Click "Export Excel" from the export menu. The file will be formatted as a spreadsheet.

**Export as JSON**: Saves data as a JSON file. Perfect for developers who want to use the data in other applications.

**How to Use**: Click "Export JSON" from the export menu. The file contains the raw data in JSON format.

### PDF Export

**Export Dashboard as PDF**: Creates a complete PDF report including the chart, performance metrics, and data table.

**How to Use**: Click "Export PDF" from the export menu (or press "S" key). The export process may take a few seconds. A PDF file will be downloaded with:
- The current chart visualization
- Performance metrics snapshot
- Data table (if enabled in options)
- Timestamp and metadata

**Note**: PDF export uses html2canvas, so it captures the visual appearance of the dashboard.

## Keyboard Shortcuts

The dashboard supports keyboard shortcuts for quick access to common features. Here's the complete list:

**F**: Toggle fullscreen mode. Press again to exit fullscreen.

**Z**: Zoom in on the chart. Equivalent to clicking the "Zoom In" button.

**X**: Zoom out on the chart. Equivalent to clicking the "Zoom Out" button.

**R**: Reset zoom and pan. Returns the chart to its original view.

**E**: Export chart as PNG image.

**S**: Export dashboard as PDF report.

**Shift + S**: Export chart as SVG file.

**M**: Toggle moving average overlay (only works on line charts).

**Escape**: Exit fullscreen mode if you're in fullscreen.

### How to Use Keyboard Shortcuts

Simply press the key while the dashboard is focused (you don't need to click anywhere first). The shortcuts work from anywhere on the page.

**Tip**: Keyboard shortcuts make it much faster to navigate and export. Try using Z and X to zoom, then R to reset - it's much faster than clicking buttons.

## Advanced Features

### Statistical Overlays (Line Charts Only)

When viewing a line chart, you can add statistical overlays to help analyze trends.

**Moving Average (SMA)**: Shows a simple moving average line that smooths out short-term fluctuations.

**How to Use**:
1. Make sure you're viewing a Line Chart
2. In the "Statistical Overlays" panel, check the "Moving Average (SMA)" checkbox
3. Adjust the period using the slider (default is 20, range is 5-50)
4. The moving average line will appear on the chart in a different color

**Exponential Moving Average (EMA)**: Similar to moving average but gives more weight to recent data points, making it more responsive to recent changes.

**How to Use**:
1. Check the "Exponential MA (EMA)" checkbox
2. Adjust the period using the slider (default is 12, range is 5-30)
3. The EMA line will appear on the chart

**Toggle with Keyboard**: Press "M" to toggle the moving average on/off quickly.

**Reading the Overlays**: 
- When the price line is above the moving average, it often indicates an upward trend
- When the price line crosses above the moving average, it can signal a potential upward movement
- The EMA reacts faster to price changes than the SMA

### Fullscreen Mode

Fullscreen mode gives you more screen space to view your charts and data.

**How to Enter Fullscreen**:
- Click the "Fullscreen" button in the header
- Or press the "F" key on your keyboard

**How to Exit Fullscreen**:
- Click the "Exit" button that appears in fullscreen mode
- Or press the "F" key again
- Or press the "Escape" key

**What Changes in Fullscreen**:
- The dashboard takes up your entire screen
- Header becomes sticky at the top
- More space for charts and data
- All features remain available

### Theme Toggle

Switch between light and dark themes to suit your preference or working environment.

**How to Toggle Theme**:
- Click the "Light Mode" or "Dark Mode" button in the header
- The entire dashboard switches themes immediately

**Theme Persistence**: The theme preference is saved and will persist when you refresh the page.

### Data Streaming Controls

Control whether new data points are being generated in real-time.

**Start Streaming**: Click the green "Start Streaming" button to begin generating new data points every 100ms. The button turns red and says "Stop Streaming".

**Stop Streaming**: Click the red "Stop Streaming" button to pause data generation. The chart will freeze at the current data state.

**Reset Data**: Click "Reset Data" to clear all data and start fresh with a new initial dataset of 1,000 points.

**When to Use**:
- Stop streaming when you want to analyze a specific dataset without new data interfering
- Start streaming to see real-time performance with continuous updates
- Reset when you want to start over with a clean dataset

## Stress Test Mode

Stress Test Mode allows you to test how the dashboard performs with different amounts of data.

### How to Use Stress Test Mode

**Quick Load Buttons**: Click one of the preset buttons:
- **1K (Normal)**: Loads 1,000 data points - normal operation
- **10K (Standard)**: Loads 10,000 data points - meets the requirement
- **50K (Extreme)**: Loads 50,000 data points - stress test
- **100K (Maximum)**: Loads 100,000 data points - maximum stress test

**Custom Load**: 
1. Type a number in the "Custom Load Configuration" input field
2. Press Enter or click outside the field
3. The dashboard will reset with that many data points

**Range**: You can set anywhere from 100 to 200,000 points.

### What to Watch During Stress Tests

**Performance Metrics**: Watch the FPS counter. It should stay above 30 FPS even with 50K points, and above 15 FPS with 100K points.

**Memory Usage**: Monitor memory - it should increase but then stabilize. If it keeps growing, there might be an issue.

**Render Time**: Check if render time stays reasonable. Above 33ms means you're below 30 FPS.

**User Experience**: Try interacting with the chart (zoom, pan, filter) during stress tests to see if it remains responsive.

### Stress Test Tips

- Start with lower loads and work your way up
- Let each test run for a minute or two to see stability
- Try different chart types with high data loads
- Test filters and aggregations with large datasets
- Monitor memory over extended periods (30+ minutes)

## Data Table

The data table at the bottom shows all your data points in a scrollable table format.

### Understanding the Table

**Columns**:
- **Timestamp**: The exact time when the data point was generated
- **Value**: The numeric value of the data point
- **Category**: Any category assigned to the data point (if applicable)

**Virtual Scrolling**: The table uses virtual scrolling, meaning it only renders the rows you can see. This allows it to handle 10,000+ rows efficiently without performance issues.

### How to Use the Table

**Scrolling**: Simply scroll up and down to see different data points. The table will automatically load more rows as you scroll.

**Viewing Filtered Data**: When you apply filters, the table automatically updates to show only the filtered rows. The row count in the header updates too (e.g., "Data Table (6,234 points)").

**Viewing Aggregated Data**: When you apply time aggregation, the table shows the aggregated values instead of individual points.

**Performance**: Even with 10,000+ rows, scrolling should be smooth thanks to virtualization.

## How Everything Works Together

### Typical Workflow

Here's how you might use all the features together:

1. **Start the Dashboard**: Open the dashboard and let it start streaming data
2. **Choose Your Chart**: Select the chart type that best shows what you want to see (e.g., Line for trends)
3. **Filter Your Data**: If you only care about values in a specific range, apply a filter
4. **Aggregate if Needed**: If you have too much data, use time aggregation to group it
5. **Zoom and Pan**: Zoom in on interesting sections and pan around to explore
6. **Add Overlays**: If using a line chart, add moving averages to see trends
7. **Monitor Performance**: Keep an eye on the performance metrics to ensure smooth operation
8. **Export Results**: When you find something interesting, export it as PNG, PDF, or data file

### Feature Combinations

**Filter + Aggregate**: Filter your data first to a specific value range, then aggregate the filtered results. This is useful when you want to see trends in a specific data subset.

**Zoom + Pan**: Zoom in to see detail, then pan around to explore different time periods. This is like using a microscope on your data.

**Statistical Overlays + Export**: Add moving averages to identify trends, then export the chart with overlays to include in a report.

**Stress Test + Performance Monitor**: Use stress test mode to load lots of data, then watch the performance monitor to see how the dashboard handles it. This helps you understand the limits of the system.

## Troubleshooting

### Chart Shows No Data

**Possible Causes**:
- Filters are too restrictive (check the Filter Panel for warnings)
- Data streaming is stopped (click "Start Streaming")
- All data was cleared (click "Reset Data")

**Solutions**:
- Clear filters by clicking "Clear" in the Filter Panel
- Check the data range shown in the Filter Panel to see what values exist
- Make sure streaming is enabled (green "Start Streaming" button)

### Performance is Slow

**Possible Causes**:
- Too many data points loaded
- Browser extensions interfering
- Other applications using system resources

**Solutions**:
- Reduce data load using Stress Test Mode (try 1K or 10K instead of 100K)
- Close other browser tabs
- Disable browser extensions
- Use Chrome or Edge for best performance
- Check the Performance Monitor to see which metric is the problem

### Filters Not Working

**Possible Causes**:
- Filter values don't match your data range
- Min value is greater than max value
- Invalid number entered

**Solutions**:
- Check the "Data Range" box in the Filter Panel to see actual data values
- Make sure min value is less than max value
- Enter valid numbers (no letters or special characters)
- Click "Clear" and try again

### Export Not Working

**Possible Causes**:
- Browser blocking downloads
- Export process taking time (PDF can take a few seconds)
- Insufficient permissions

**Solutions**:
- Check browser download settings
- Wait a few seconds for PDF export (it takes time to generate)
- Try a different export format (PNG is fastest)
- Check browser console for error messages

### Memory Usage Growing

**Possible Causes**:
- Memory leak (shouldn't happen, but possible)
- Too many data points in memory
- Browser issue

**Solutions**:
- Check if memory stabilizes after a few minutes (some growth is normal initially)
- Click "Reset Data" to clear memory
- Refresh the page to reset everything
- Monitor in Performance Monitor - if it keeps growing unbounded, there might be an issue

### Chart Not Updating

**Possible Causes**:
- Streaming is stopped
- Browser tab is in background (some browsers throttle background tabs)
- Performance issues causing updates to be skipped

**Solutions**:
- Make sure "Start Streaming" button is green/active
- Bring the browser tab to the foreground
- Check Performance Monitor - if FPS is very low, the chart might not update smoothly
- Try reducing data load

## Tips and Best Practices

### For Best Performance

- Use Chrome or Edge browsers for optimal performance
- Close unnecessary browser tabs
- Start with lower data loads and increase gradually
- Use filters to reduce the amount of data being rendered
- Use time aggregation for very large datasets

### For Best Analysis

- Use line charts for trend analysis
- Add moving averages to identify long-term trends
- Filter data to focus on specific value ranges
- Zoom in on interesting time periods
- Export charts and data for further analysis

### For Testing

- Use Stress Test Mode to verify performance at different scales
- Monitor Performance Monitor during tests
- Test all chart types with your data
- Test filters and aggregations together
- Let the dashboard run for extended periods to check for memory leaks

## Understanding the Data

### What the Data Represents

The dashboard generates simulated time-series data. Each data point has:
- **Timestamp**: When the data point was created (in milliseconds since epoch)
- **Value**: A numeric value that follows realistic patterns (trends, sine waves, noise)
- **Category**: Optional category label (if assigned)

### Data Generation

Data is generated using a mathematical model that includes:
- A base value (starting point)
- A trend (gradual increase or decrease over time)
- Sine wave patterns (cyclical variations)
- Random noise (realistic variability)

This creates data that looks realistic and behaves like real-world time-series data (like stock prices, sensor readings, etc.).

### Data Limits

- **Maximum Points in Memory**: 10,000 points (older points are automatically removed)
- **Update Interval**: 100 milliseconds (10 new points per second)
- **Stress Test Range**: 100 to 200,000 points

## Additional Information

### Browser Compatibility

The dashboard works best in:
- **Chrome/Edge**: Recommended for best performance
- **Firefox**: Works well, may have slightly lower performance
- **Safari**: Works, but may have performance limitations
- **Mobile Browsers**: Works but with reduced performance on some devices

### System Requirements

- **Node.js**: Version 18 or higher
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **RAM**: 4GB minimum, 8GB recommended for stress testing
- **Screen Resolution**: 1280x720 minimum for best experience

### Getting Help

If you encounter issues:
1. Check the Troubleshooting section above
2. Review the browser console for error messages (F12 to open DevTools)
3. Check the Performance Monitor for performance issues
4. Try refreshing the page
5. Try reducing data load if performance is poor
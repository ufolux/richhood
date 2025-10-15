# Robinhood Screenshot Generator

A web-based tool to generate realistic Robinhood portfolio screenshots with customizable values. Perfect for creating mock portfolios for educational purposes, presentations, or design mockups.

## Features

- 📊 **Realistic Charts**: Automatically generated stock-market-like charts with natural volatility
- 🎨 **Authentic Design**: Pixel-perfect recreation of Robinhood's UI
- ⚡ **Real-time Preview**: See changes instantly as you adjust values
- 📸 **High-Quality Screenshots**: Download 2x resolution PNG images
- 🎯 **Fully Customizable**: Control all aspects of the portfolio display

## Usage

### Getting Started

1. Open `index.html` in your web browser
2. Adjust the values in the control panel:
   - **Investment Amount**: Total portfolio value
   - **Gain/Loss Amount**: Profit or loss in dollars (use negative for losses)
   - **Percentage**: Gain/loss percentage
   - **Time Period**: Display label (Past Year, All Time, etc.)
   - **Buying Power**: Available cash
   - **Badge Type**: Free Stock, Rewards, or None
   - **Selected Chart Period**: Time range for the chart (1D, 1W, 1M, etc.)

3. Click "Download Screenshot" to save your generated image

### Examples

**Positive Portfolio:**
- Investment Amount: $10,984.40
- Gain/Loss: $1,574.57
- Percentage: 16.74%
- Result: Green chart with upward trend

**Negative Portfolio:**
- Investment Amount: $28,867.45
- Gain/Loss: -$4,878.62
- Percentage: -14.46%
- Result: Red/orange chart with downward trend

## Features

### Automatic Chart Generation
The tool generates realistic stock market charts based on your inputs:
- Upward trending charts for positive gains
- Downward trending charts for losses
- Natural market volatility and fluctuations
- Smooth curves that mimic real trading patterns

### Color Themes
- **Green Theme**: Automatically applied for positive gains
- **Red/Orange Theme**: Automatically applied for losses
- Theme affects chart line, fill gradient, and active button colors

### Time Period Selection
Choose from multiple time periods:
- LIVE: Real-time view
- 1D: One day
- 1W: One week
- 1M: One month
- 3M: Three months
- 1Y: One year
- ALL: All time

Each period generates a different number of data points for realistic chart density.

## Technical Details

### Technologies Used
- HTML5 Canvas for chart rendering
- Vanilla JavaScript (no framework dependencies)
- html2canvas for screenshot generation
- CSS3 for authentic Robinhood styling

### Chart Algorithm
The chart generation uses:
1. **Trend Line**: Base line from start to end based on percentage change
2. **Volatility**: Random fluctuations scaled to the percentage change
3. **Random Walk**: Small continuous variations for realism
4. **Smoothing**: Multiple passes to create natural curves
5. **Market Events**: Occasional larger spikes for authenticity

### Screenshot Quality
- 2x scaling for high-resolution output (750x1334px)
- Exact dimensions match iPhone display
- PNG format for lossless quality

## Customization

### Modifying the Design
Edit `styles.css` to customize:
- Colors and themes
- Font sizes
- Layout spacing
- Button styles

### Adjusting Chart Behavior
Edit `script.js` to modify:
- Volatility levels (`volatility` variable)
- Smoothing intensity (`smoothData` function)
- Number of data points (`pointsMap`)
- Chart colors

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Disclaimer

This tool is for educational and design purposes only. Generated screenshots are mock-ups and do not represent real investment accounts or financial advice.

## License

MIT License - feel free to use and modify as needed.

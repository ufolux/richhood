# Richhood - Robinhood Screenshot Generator

A professional screenshot generator that creates pixel-perfect replicas of Robinhood's investing dashboard UI with fully customizable portfolio values.

## Features

### Customizable Fields

- **Investment Amount**: Set your total portfolio value
- **Gain/Loss Amount**: Set the daily gain or loss (automatically calculates percentage)
- **Percentage**: Set the daily percentage (automatically calculates gain/loss amount)
- **Time Period**: Choose from LIVE, 1D, 1W, 1M, 3M, YTD, 1Y, or All
- **Buying Power**: Set your available cash
- **Badge Type**: Display Gold, Platinum, or no badge
- **Color Mode**: Toggle between Light and Dark themes
- **Selected Chart Period**: Control which time period button appears active

### Interactive Chart Editor

- **Click-and-Drag Editing**: Click or drag on the chart to reshape it
- **Touch Support**: Full touch support for mobile devices
- **Regenerate Chart**: Generate random realistic chart patterns with one click
- **Automatic Colors**: Chart color changes based on gain/loss (green for positive, red for negative)

### Export Functionality

- **High-Quality Export**: Export screenshots as JPG at 2x resolution
- **Phone Mockup**: Generates a realistic iPhone-sized mockup (375x812px)
- **One-Click Download**: Instantly download your customized screenshot

## Tech Stack

- **Framework**: Svelte 5.39.6 with TypeScript
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 4.1.14
- **Icons**: @iconify/svelte 5.0.2
- **Screenshot**: html2canvas for image export
- **Fonts**: Custom Robinhood fonts for authentic UI

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run check
```

## Usage

1. **Adjust Values**: Use the left control panel to customize all portfolio values
2. **Edit Chart**: Click and drag on the chart in the preview to reshape it, or use "Regenerate Chart" for random patterns
3. **Change Appearance**: Toggle between light/dark mode and adjust the selected time period
4. **Export**: Click "Export Screenshot" to download your customized image as JPG

## Project Structure

```
src/
├── lib/
│   ├── store.svelte.ts           # Global state management
│   ├── ControlPanel.svelte        # Left sidebar with all controls
│   ├── PreviewScreen.svelte       # Right panel with phone mockup
│   ├── InvestingDashboard.svelte # Main Robinhood UI container
│   ├── PortfolioHeader.svelte    # Portfolio value and gain/loss display
│   ├── StockChart.svelte          # Interactive chart with drag editing
│   ├── BuyingPowerCard.svelte    # Buying power display
│   ├── PromotionBanner.svelte    # Marketing banner (fixed)
│   └── BottomNavigation.svelte   # Bottom tab navigation (fixed)
├── App.svelte                     # Main app layout (two-column)
└── app.css                        # Global styles and fonts
```

## Key Implementation Details

### State Management

Uses Svelte 5's runes (`$state`, `$derived`) for reactive state management. All customizable values are stored in a global store.

### Chart Editing

- Converts mouse/touch coordinates to chart data points
- Supports both click-to-edit and drag-to-draw
- Clamps values between 5-95 to maintain visual consistency
- Automatically updates when regenerated

### Dark Mode

Components use Tailwind's dark mode classes (e.g., `dark:bg-black`) and conditionally apply based on the `colorMode` setting in the store.

### Screenshot Export

Uses html2canvas to capture the phone mockup element at 2x scale for high quality, then converts to JPG format for download.

## License

MIT

## Credits

Built with Svelte 5, inspired by Robinhood's design system.

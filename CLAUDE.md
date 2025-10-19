# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Richhood is a Robinhood screenshot generator built with Svelte 5, Vite, and Tailwind CSS. It creates pixel-perfect replicas of Robinhood's investing dashboard UI with customizable portfolio values.

## Tech Stack

- **Framework:** Svelte 5.39.6 with TypeScript 5.9.3
- **Build Tool:** Vite 7.1.7
- **Styling:** Tailwind CSS 4.1.14 + Custom Robinhood fonts
- **Icons:** @iconify/svelte 5.0.2 (Material Symbols)

## Development Commands

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Production build to dist/
npm run preview  # Serve production build locally
npm run check    # Type check with svelte-check + tsc
```

## Architecture

### Component Hierarchy

```
App.svelte
└── Screen.svelte (wrapper)
    └── InvestingDashboard.svelte (main layout)
        ├── PortfolioHeader.svelte (portfolio value, gain/loss, Gold badge)
        ├── StockChart.svelte (SVG chart + time period selector)
        ├── BuyingPowerCard.svelte (available cash display)
        ├── PromotionBanner.svelte (dismissible carousel with CTA)
        └── BottomNavigation.svelte (5-tab navigation bar)
```

### Key Components

**PortfolioHeader** - Displays portfolio metrics with custom Robinhood fonts

- Portfolio value: $69,708.30 (42px, font-numbers class)
- Daily gain: +$708.18 (+1.03%) with green upward triangle
- Search/notification icons, Gold badge, dropdown button

**StockChart** - Interactive chart visualization

- 34-point SVG polyline chart (green stroke #00C805)
- Time period buttons: LIVE, 1D, 1W, 1M, 3M, YTD
- Active state: green background (#00C805) with white text

**BuyingPowerCard** - Simple currency display

- Label + value formatted with toLocaleString()
- Uses font-numbers class for numeric value

**PromotionBanner** - Marketing carousel

- Lime-green left panel (#CDFF00) with large "2%" display
- White right panel with dismissible content
- Page indicator (1/4) and "Claim bonus" CTA

**BottomNavigation** - Fixed bottom tab bar

- 5 tabs with Material Symbols icons
- Active tab styling (black vs gray icons)
- Safe area insets for notched devices

## Design System

### Colors

- **Primary Green:** #00C805 (gains, active states, CTAs)
- **Promotion Yellow:** #CDFF00 (marketing banner)
- **Gold Badge:** #FCD980
- **Black:** #000000 (primary text)
- **Gray:** Various shades for inactive/secondary

### Typography

- **Custom Fonts:** Robinhood fonts from `/public/fonts/`
  - `robinhood-text.woff2` - Default text font
  - `robinhood-numbers.woff2` - Supplementary for numbers
- **Font Usage:** Apply `.font-numbers` class to all numeric/currency values
- **Sizes:** 42px (display), 17px (body), 13-15px (small)

### Styling Approach

- Global styles in `app.css` with Tailwind import
- Component styles use scoped PostCSS blocks
- Tailwind utilities for layout and spacing
- Custom SVG for chart and gain indicator

## Configuration Files

**vite.config.ts** - Tailwind + Svelte plugins

```typescript
plugins: [tailwindcss(), svelte()];
```

**svelte.config.js** - vitePreprocess for TypeScript/PostCSS support

**tsconfig.app.json** - Strict mode, ES2022 target, includes src/\*_/_

## Important Implementation Details

### Font Loading

Custom Robinhood fonts are critical for UI authenticity. Two font faces defined in app.css:

- 'Robinhood' (text) - Default for all text
- 'Robinhood Numbers' (both fonts) - Use `.font-numbers` class for currency values

### Mock Data

All values are currently hardcoded:

- Portfolio: $69,708.30
- Daily Gain: +$708.18 (1.03%)
- Buying Power: $122.31
- Chart: 34-point Y-value array

### Number Formatting

Currency values use:

```javascript
value.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
```

### Icons

All icons from Material Symbols via @iconify/svelte:

- Requires internet for CDN icon loading
- Icon names: search, notifications, settings, keyboard-arrow-down, star, close, explore, compare-arrows, credit-card, person, show-chart

### TypeScript Configuration

- Strict mode enabled in both app and build configs
- checkJs: true for JavaScript files
- Target ES2022 (app), ES2023 (build tools)

## Key Patterns

### Component State

- State declared at top of script blocks
- Event handlers with `on:click` directives
- Simple prop passing between components

### Responsive Design

- Mobile-first layout (targets ~375px width)
- Viewport meta tag for mobile scaling
- Safe area insets for notched devices
- Fixed bottom navigation with padding-bottom on main content

### Chart Implementation

- SVG polyline with preserveAspectRatio="none" for responsive width
- Green stroke (#00C805) with 1.2px width
- Points generated from Y-value array mapped to 0-100 range

## Deployment

1. Run `npm run build` to create optimized bundle in `dist/`
2. Deploy `dist/` folder to static host (Netlify, Vercel, GitHub Pages)
3. Ensure `/public/fonts/` files are included in build output
4. No backend required - fully static site

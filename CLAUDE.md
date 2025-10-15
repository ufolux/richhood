# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side web application for generating realistic Robinhood portfolio screenshots. It's a single-page application with no build process or backend - just open `index.html` in a browser to run.

## Running the Application

Simply open `index.html` in any modern web browser. No build step, compilation, or server required.

## Architecture

### File Structure
- `index.html` - Main UI with control panel (left) and live preview (right)
- `styles.css` - Avenir Next typography with Robinhood's authentic dark theme
- `script.js` - All application logic including chart generation, drag interactions, and screenshot export

### Key Architecture Patterns

**State Management**
Global state variables manage application state:
- `chartData[]` - Array of data points for the chart line
- `isPositive` - Boolean determining green (gains) vs red/orange (losses) theme
- `isDragging`, `dragPointIndex`, `currentMouseX/Y` - Drag interaction state
- `chartNeedsRegeneration` - Flag to preserve manual chart edits

**Form Validation & Auto-calculation**
- Investment Amount is always required
- Either Gain/Loss Amount OR Percentage must be provided
- When one is entered, the other auto-calculates using formulas:
  - `percentage = (gainLoss / (investment - gainLoss)) * 100`
  - `gainLoss = (investment * percentage) / (100 + percentage)`

**Chart Generation Algorithm**
1. Base trend line from start to end based on percentage
2. Volatility scaled to percentage magnitude
3. Random walk for micro-variations
4. Occasional spikes simulating market events
5. Multi-pass smoothing for natural curves

**Interactive Chart Editing**
- Canvas-based drag interaction for manual chart sculpting
- Quadratic Bezier curves for smooth rendering
- Gaussian smoothing with 8-point radius when dragging
- Hit detection uses vertical line approach (50px tolerance)
- Control point follows cursor in both X and Y during drag
- Chart only regenerates when "Regenerate Chart" clicked or time period changes

**Color Theming**
Automatically switches between two themes based on `isPositive`:
- Positive: `#00c805` green for gains
- Negative: `#ff6400` orange/red for losses
Theme affects: chart line, gradient fill, active time period button

## Canvas Chart Rendering

The chart uses HTML5 Canvas with custom rendering logic:

**Drawing Process (drawChart function)**
1. Clear canvas
2. Calculate scaling from `chartData` min/max values
3. Draw gradient-filled area using quadratic curves
4. Draw line on top with same curve path
5. If dragging, draw 3-layer control point at cursor position

**Smoothing Algorithms**
- `smoothNeighboringPoints()` - Two-pass smoothing:
  - Pass 1: Exponential decay from dragged point (Gaussian-like falloff)
  - Pass 2: 3-point Gaussian kernel for additional smoothing
- `smoothData()` - Multi-pass 3-point averaging for chart generation

## Screenshot Export

Uses `html2canvas` library (loaded via CDN) to capture the `#robinhoodScreen` div at 2x resolution (750x1334px) matching iPhone display dimensions.

## Typography

Font stack: `'Avenir Next', -apple-system, BlinkMacSystemFont, 'Inter', ...`
- Inter loaded via Google Fonts as fallback
- Key sizes: 40px title, 52px amount, 16px performance metrics

## Time Period Configuration

Each period has specific data point counts for realistic density:
- LIVE: 60, 1D: 78, 1W: 70, 1M: 60, 3M: 90, 1Y: 120, ALL: 150

## Event Handling

**Auto-update on Input**
All form inputs trigger `updatePreview()` except when validation fails.

**Chart Drag Interaction**
- Mouse and touch events supported
- `findNearestPoint()` for initial click detection
- `findPointIndexFromX()` for horizontal cursor tracking during drag
- Control point disappears on mouse up

## External Dependencies

Only one: `html2canvas` (v1.4.1) loaded from CDN for screenshot capture.

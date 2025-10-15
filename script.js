// Chart configuration
let chartData = [];
let isPositive = true;
let isDragging = false;
let dragPointIndex = -1;
let chartNeedsRegeneration = true;
let currentMouseX = 0;
let currentMouseY = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePreview();
    attachEventListeners();
    attachChartDragListeners();
});

function attachEventListeners() {
    // Update button
    document.getElementById('updateBtn').addEventListener('click', updatePreview);

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadScreenshot);

    // Auto-update on input change
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Auto-calculation for gain/loss and percentage
    const investmentAmountInput = document.getElementById('investmentAmount');
    const gainLossInput = document.getElementById('gainLoss');
    const percentageInput = document.getElementById('percentage');

    gainLossInput.addEventListener('input', function() {
        const investment = parseFloat(investmentAmountInput.value) || 0;
        const gainLoss = parseFloat(this.value);

        if (gainLoss !== '' && !isNaN(gainLoss) && investment > 0) {
            const percentage = (gainLoss / (investment - gainLoss)) * 100;
            percentageInput.value = percentage.toFixed(2);
        }
    });

    percentageInput.addEventListener('input', function() {
        const investment = parseFloat(investmentAmountInput.value) || 0;
        const percentage = parseFloat(this.value);

        if (percentage !== '' && !isNaN(percentage) && investment > 0) {
            const gainLoss = (investment * percentage) / (100 + percentage);
            gainLossInput.value = gainLoss.toFixed(2);
        }
    });

    // Time period buttons
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            timeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('selectedPeriod').value = this.dataset.period;
            chartNeedsRegeneration = true;
            updatePreview();
        });
    });

    // Regenerate chart button
    document.getElementById('regenerateBtn').addEventListener('click', function() {
        chartNeedsRegeneration = true;
        updatePreview();
    });
}

function updatePreview() {
    const investmentAmountInput = document.getElementById('investmentAmount');
    const gainLossInput = document.getElementById('gainLoss');
    const percentageInput = document.getElementById('percentage');

    const investmentAmount = parseFloat(investmentAmountInput.value) || 0;
    let gainLoss = parseFloat(gainLossInput.value);
    let percentage = parseFloat(percentageInput.value);

    // Validation: Investment amount is required
    if (!investmentAmount || investmentAmount <= 0) {
        investmentAmountInput.classList.add('error');
        return;
    } else {
        investmentAmountInput.classList.remove('error');
    }

    // Validation: At least one of gainLoss or percentage must be provided
    if ((isNaN(gainLoss) || gainLoss === '') && (isNaN(percentage) || percentage === '')) {
        gainLossInput.classList.add('error');
        percentageInput.classList.add('error');
        return;
    } else {
        gainLossInput.classList.remove('error');
        percentageInput.classList.remove('error');
    }

    // Use provided values or defaults
    gainLoss = isNaN(gainLoss) ? 0 : gainLoss;
    percentage = isNaN(percentage) ? 0 : percentage;

    const timePeriod = document.getElementById('timePeriod').value;
    const buyingPower = parseFloat(document.getElementById('buyingPower').value) || 0;
    const badgeType = document.getElementById('badge').value;
    const selectedPeriod = document.getElementById('selectedPeriod').value;

    // Determine if positive or negative
    isPositive = gainLoss >= 0;

    // Update amount
    document.getElementById('amount').textContent = formatCurrency(investmentAmount);

    // Update performance
    const performanceEl = document.getElementById('performance');
    performanceEl.className = isPositive ? 'performance positive' : 'performance negative';

    const arrow = isPositive ? '▲' : '▼';
    const sign = gainLoss >= 0 ? '+' : '';
    performanceEl.innerHTML = `
        <span class="arrow">${arrow}</span>
        <span class="change-amount">${sign}${formatCurrency(Math.abs(gainLoss))}</span>
        <span class="change-percent">(${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%)</span>
        <span class="time-label">${timePeriod}</span>
    `;

    // Update badge
    const badgeEl = document.getElementById('badge');
    badgeEl.className = `badge ${badgeType.toLowerCase().replace(' ', '-')}`;
    if (badgeType === 'Free Stock') {
        badgeEl.innerHTML = '🎁 Free Stock';
    } else if (badgeType === 'Rewards') {
        badgeEl.innerHTML = '🎁 Rewards';
    }

    // Update buying power
    document.getElementById('buyingPowerAmount').textContent = formatCurrency(buyingPower);

    // Update time button colors
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(btn => {
        if (btn.classList.contains('active')) {
            btn.classList.remove('positive', 'negative');
            btn.classList.add(isPositive ? 'positive' : 'negative');
        }
    });

    // Sync selected period button
    const activePeriodBtn = document.querySelector(`.time-btn[data-period="${selectedPeriod}"]`);
    if (activePeriodBtn) {
        timeButtons.forEach(b => b.classList.remove('active', 'positive', 'negative'));
        activePeriodBtn.classList.add('active');
        activePeriodBtn.classList.add(isPositive ? 'positive' : 'negative');
    }

    // Generate and draw chart
    if (chartNeedsRegeneration) {
        generateChartData(percentage, selectedPeriod);
        chartNeedsRegeneration = false;
    }
    drawChart();
}

function generateChartData(percentage, period) {
    // Determine number of data points based on period
    const pointsMap = {
        'LIVE': 60,
        '1D': 78,
        '1W': 70,
        '1M': 60,
        '3M': 90,
        '1Y': 120,
        'ALL': 150
    };

    const numPoints = pointsMap[period] || 100;
    chartData = [];

    const startValue = 50; // Start at middle of chart
    const endValue = startValue + (percentage * 0.5); // Scale the change for visual effect

    // Generate smooth curve with realistic market volatility
    for (let i = 0; i < numPoints; i++) {
        const progress = i / (numPoints - 1);

        // Base trend line
        const trendValue = startValue + (endValue - startValue) * progress;

        // Add realistic volatility
        const volatility = 3 + Math.abs(percentage) * 0.1; // More volatility for bigger changes
        const noise = (Math.random() - 0.5) * volatility;

        // Add some smoothed random walks
        const prevValue = chartData.length > 0 ? chartData[chartData.length - 1] : startValue;
        const randomWalk = (Math.random() - 0.5) * 2;

        let value = trendValue + noise + randomWalk * 0.3;

        // Smooth with previous value
        if (chartData.length > 0) {
            value = prevValue * 0.7 + value * 0.3;
        }

        // Add occasional larger moves (simulate market events)
        if (Math.random() > 0.95) {
            const spike = (Math.random() - 0.5) * volatility * 2;
            value += spike;
        }

        chartData.push(value);
    }

    // Smooth the data for a more natural look
    chartData = smoothData(chartData, 3);
}

function smoothData(data, passes) {
    let smoothed = [...data];

    for (let pass = 0; pass < passes; pass++) {
        const newData = [...smoothed];
        for (let i = 1; i < smoothed.length - 1; i++) {
            newData[i] = (smoothed[i - 1] + smoothed[i] + smoothed[i + 1]) / 3;
        }
        smoothed = newData;
    }

    return smoothed;
}

function drawChart() {
    const canvas = document.getElementById('chart');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (chartData.length === 0) return;

    // Chart dimensions
    const padding = 10;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Find min and max for scaling
    const minValue = Math.min(...chartData);
    const maxValue = Math.max(...chartData);
    const valueRange = maxValue - minValue || 1;

    // Set colors based on positive/negative
    const lineColor = isPositive ? '#00c805' : '#ff6400';
    const gradientColor1 = isPositive ? 'rgba(0, 200, 5, 0.2)' : 'rgba(255, 100, 0, 0.2)';
    const gradientColor2 = isPositive ? 'rgba(0, 200, 5, 0)' : 'rgba(255, 100, 0, 0)';

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, gradientColor1);
    gradient.addColorStop(1, gradientColor2);

    // Draw filled area with smoother curves
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);

    // First point
    let x = padding;
    let y = padding + (1 - (chartData[0] - minValue) / valueRange) * chartHeight;
    ctx.lineTo(x, y);

    // Draw smooth curve using quadratic curves
    for (let i = 0; i < chartData.length - 1; i++) {
        const x1 = padding + (i / (chartData.length - 1)) * chartWidth;
        const y1 = padding + (1 - (chartData[i] - minValue) / valueRange) * chartHeight;
        const x2 = padding + ((i + 1) / (chartData.length - 1)) * chartWidth;
        const y2 = padding + (1 - (chartData[i + 1] - minValue) / valueRange) * chartHeight;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        ctx.quadraticCurveTo(x1, y1, midX, midY);
    }

    // Last point
    x = padding + chartWidth;
    y = padding + (1 - (chartData[chartData.length - 1] - minValue) / valueRange) * chartHeight;
    ctx.lineTo(x, y);

    ctx.lineTo(padding + chartWidth, canvas.height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw smooth line
    ctx.beginPath();
    x = padding;
    y = padding + (1 - (chartData[0] - minValue) / valueRange) * chartHeight;
    ctx.moveTo(x, y);

    for (let i = 0; i < chartData.length - 1; i++) {
        const x1 = padding + (i / (chartData.length - 1)) * chartWidth;
        const y1 = padding + (1 - (chartData[i] - minValue) / valueRange) * chartHeight;
        const x2 = padding + ((i + 1) / (chartData.length - 1)) * chartWidth;
        const y2 = padding + (1 - (chartData[i + 1] - minValue) / valueRange) * chartHeight;

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        ctx.quadraticCurveTo(x1, y1, midX, midY);
    }

    x = padding + chartWidth;
    y = padding + (1 - (chartData[chartData.length - 1] - minValue) / valueRange) * chartHeight;
    ctx.lineTo(x, y);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw control points when hovering/dragging
    if (isDragging && dragPointIndex !== -1) {
        drawControlPoint(ctx, dragPointIndex, padding, chartWidth, chartHeight, minValue, valueRange, lineColor);
    }
}

function drawControlPoint(ctx, index, padding, chartWidth, chartHeight, minValue, valueRange, color) {
    // Use current mouse position for both X and Y
    const x = currentMouseX;
    const y = currentMouseY;

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Draw inner circle
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw white center
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function attachChartDragListeners() {
    const canvas = document.getElementById('chart');

    canvas.addEventListener('mousedown', handleDragStart);
    canvas.addEventListener('mousemove', handleDragMove);
    canvas.addEventListener('mouseup', handleDragEnd);
    canvas.addEventListener('mouseleave', handleDragEnd);

    // Touch support for mobile
    canvas.addEventListener('touchstart', handleDragStart);
    canvas.addEventListener('touchmove', handleDragMove);
    canvas.addEventListener('touchend', handleDragEnd);
}

function handleDragStart(e) {
    e.preventDefault();
    const canvas = document.getElementById('chart');
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.type.startsWith('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Find nearest point
    dragPointIndex = findNearestPoint(x, y);

    if (dragPointIndex !== -1) {
        isDragging = true;
        canvas.style.cursor = 'grabbing';
    }
}

function handleDragMove(e) {
    if (!isDragging || dragPointIndex === -1) return;

    e.preventDefault();
    const canvas = document.getElementById('chart');
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if (e.type.startsWith('touch')) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    currentMouseX = x;
    currentMouseY = y;

    // Update the drag point index based on horizontal position
    dragPointIndex = findPointIndexFromX(x);

    // Update the chart data point
    if (dragPointIndex !== -1) {
        updateChartPoint(dragPointIndex, y);
    }

    // Redraw chart
    drawChart();
}

function handleDragEnd(e) {
    if (isDragging) {
        isDragging = false;
        dragPointIndex = -1;
        const canvas = document.getElementById('chart');
        canvas.style.cursor = 'grab';

        // Redraw to remove control point
        drawChart();
    }
}

function findNearestPoint(mouseX, mouseY) {
    const canvas = document.getElementById('chart');
    const padding = 10;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    const minValue = Math.min(...chartData);
    const maxValue = Math.max(...chartData);
    const valueRange = maxValue - minValue || 1;

    // Find the closest point by X position (vertical line hit detection)
    let nearestIndex = -1;
    let minXDistance = Infinity;

    chartData.forEach((value, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth;
        const xDistance = Math.abs(mouseX - x);

        if (xDistance < minXDistance) {
            minXDistance = xDistance;
            nearestIndex = index;
        }
    });

    // Also check if mouse is reasonably close to the curve vertically
    if (nearestIndex !== -1) {
        const x = padding + (nearestIndex / (chartData.length - 1)) * chartWidth;
        const y = padding + (1 - (chartData[nearestIndex] - minValue) / valueRange) * chartHeight;
        const verticalDistance = Math.abs(mouseY - y);

        // Allow dragging if within 50 pixels vertically (more forgiving)
        if (verticalDistance > 50) {
            return -1;
        }
    }

    return nearestIndex;
}

function findPointIndexFromX(mouseX) {
    const canvas = document.getElementById('chart');
    const padding = 10;
    const chartWidth = canvas.width - padding * 2;

    // Clamp mouseX to canvas bounds
    const clampedX = Math.max(padding, Math.min(mouseX, padding + chartWidth));

    // Convert X position to data point index
    const normalizedX = (clampedX - padding) / chartWidth;
    const index = Math.round(normalizedX * (chartData.length - 1));

    return Math.max(0, Math.min(chartData.length - 1, index));
}

function updateChartPoint(index, mouseY) {
    const canvas = document.getElementById('chart');
    const padding = 10;
    const chartHeight = canvas.height - padding * 2;

    const minValue = Math.min(...chartData);
    const maxValue = Math.max(...chartData);
    const valueRange = maxValue - minValue || 1;

    // Convert mouse Y to data value
    const normalizedY = 1 - (mouseY - padding) / chartHeight;
    const newValue = minValue + normalizedY * valueRange;

    // Clamp value to reasonable range
    chartData[index] = Math.max(0, Math.min(100, newValue));

    // Smooth neighboring points for natural curve
    smoothNeighboringPoints(index);
}

function smoothNeighboringPoints(index) {
    const smoothRadius = 8; // Larger radius for smoother curves
    const influence = 0.5; // How much the dragged point affects neighbors

    for (let i = 1; i <= smoothRadius; i++) {
        // Gaussian-like falloff for more natural smoothing
        const distance = i / smoothRadius;
        const weight = Math.exp(-distance * distance * 3) * influence;

        const draggedValue = chartData[index];

        // Smooth left neighbors
        if (index - i >= 0) {
            chartData[index - i] = chartData[index - i] * (1 - weight) + draggedValue * weight;
        }

        // Smooth right neighbors
        if (index + i < chartData.length) {
            chartData[index + i] = chartData[index + i] * (1 - weight) + draggedValue * weight;
        }
    }

    // Apply a second pass of smoothing for even more natural curves
    applyGaussianSmoothing(index, smoothRadius);
}

function applyGaussianSmoothing(centerIndex, radius) {
    const tempData = [...chartData];
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(chartData.length - 1, centerIndex + radius);

    for (let i = start; i <= end; i++) {
        if (i === 0 || i === chartData.length - 1) continue; // Keep endpoints

        let sum = 0;
        let weightSum = 0;

        // 3-point Gaussian kernel
        for (let j = -1; j <= 1; j++) {
            const idx = i + j;
            if (idx >= 0 && idx < tempData.length) {
                const weight = j === 0 ? 0.5 : 0.25;
                sum += tempData[idx] * weight;
                weightSum += weight;
            }
        }

        chartData[i] = sum / weightSum;
    }
}

async function downloadScreenshot() {
    const screen = document.getElementById('robinhoodScreen');

    try {
        const canvas = await html2canvas(screen, {
            backgroundColor: '#000000',
            scale: 2, // Higher resolution
            logging: false,
            width: 375,
            height: 667
        });

        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = `robinhood-${timestamp}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    } catch (error) {
        console.error('Screenshot failed:', error);
        alert('Screenshot failed. Please try again.');
    }
}

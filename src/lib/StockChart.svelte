<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { appState } from "./store";

    export let data: number[] = [];
    export let positive = true;
    export let lightMode = false;

    const paddingTop = 10;
    const paddingBottom = 10;
    const paddingLeft = 0;
    const paddingRight = 0;

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;

    let workingData: number[] = [];
    let isDragging = false;
    let dragIndex = -1;
    let currentMouseX = 0;
    let currentMouseY = 0;

    $: if (!isDragging) {
        workingData = [...data];
    }

    $: if (canvas && !isDragging) {
        drawChart(data);
    }

    const getRelativePosition = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    };

    const drawChart = (chartData: number[]) => {
        if (!ctx || chartData.length === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const chartWidth = canvas.width - paddingLeft - paddingRight;
        const chartHeight = canvas.height - paddingTop - paddingBottom;

        const minValue = Math.min(...chartData);
        const maxValue = Math.max(...chartData);
        const valueRange = maxValue - minValue || 1;

        const lineColor = positive ? "#00c805" : "#ff5000";

        ctx.beginPath();
        let startY =
            paddingTop +
            (1 - (chartData[0] - minValue) / valueRange) * chartHeight;
        ctx.moveTo(paddingLeft, startY);

        for (let i = 0; i < chartData.length - 1; i++) {
            const x1 = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
            const y1 =
                paddingTop +
                (1 - (chartData[i] - minValue) / valueRange) * chartHeight;
            const x2 =
                paddingLeft + ((i + 1) / (chartData.length - 1)) * chartWidth;
            const y2 =
                paddingTop +
                (1 - (chartData[i + 1] - minValue) / valueRange) * chartHeight;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            ctx.quadraticCurveTo(x1, y1, midX, midY);
        }

        const endX = paddingLeft + chartWidth;
        const endY =
            paddingTop +
            (1 - (chartData[chartData.length - 1] - minValue) / valueRange) *
                chartHeight;
        ctx.lineTo(endX, endY);

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.stroke();

        if (isDragging && dragIndex !== -1) {
            drawControlPoint(lineColor);
        }
    };

    const drawControlPoint = (lineColor: string) => {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(currentMouseX, currentMouseY, 6, 0, Math.PI * 2);
        ctx.fillStyle = lightMode ? "#fff" : "#000";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(currentMouseX, currentMouseY, 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(currentMouseX, currentMouseY, 2, 0, Math.PI * 2);
        ctx.fillStyle = lightMode ? "#000" : "#fff";
        ctx.fill();
    };

    const findNearestPoint = (
        chartData: number[],
        mouseX: number,
        mouseY: number,
    ) => {
        const chartWidth = canvas.width - paddingLeft - paddingRight;
        const chartHeight = canvas.height - paddingTop - paddingBottom;

        const minValue = Math.min(...chartData);
        const maxValue = Math.max(...chartData);
        const valueRange = maxValue - minValue || 1;

        let nearestIndex = -1;
        let minXDistance = Infinity;

        chartData.forEach((value, index) => {
            const x =
                paddingLeft + (index / (chartData.length - 1)) * chartWidth;
            const distance = Math.abs(mouseX - x);

            if (distance < minXDistance) {
                minXDistance = distance;
                nearestIndex = index;
            }
        });

        if (nearestIndex !== -1) {
            const x =
                paddingLeft +
                (nearestIndex / (chartData.length - 1)) * chartWidth;
            const y =
                paddingTop +
                (1 - (chartData[nearestIndex] - minValue) / valueRange) *
                    chartHeight;
            const verticalDistance = Math.abs(mouseY - y);

            if (verticalDistance > 50) {
                return -1;
            }
        }

        return nearestIndex;
    };

    const findPointIndexFromX = (chartData: number[], mouseX: number) => {
        const chartWidth = canvas.width - paddingLeft - paddingRight;
        const clampedX = Math.max(
            paddingLeft,
            Math.min(mouseX, paddingLeft + chartWidth),
        );
        const normalizedX = (clampedX - paddingLeft) / chartWidth;
        const index = Math.round(normalizedX * (chartData.length - 1));
        return Math.max(0, Math.min(chartData.length - 1, index));
    };

    const updateChartPoint = (
        chartData: number[],
        index: number,
        mouseY: number,
    ) => {
        const chartHeight = canvas.height - paddingTop - paddingBottom;
        const minValue = Math.min(...chartData);
        const maxValue = Math.max(...chartData);
        const valueRange = maxValue - minValue || 1;

        const normalizedY = 1 - (mouseY - paddingTop) / chartHeight;
        const newValue = minValue + normalizedY * valueRange;
        chartData[index] = Math.max(0, Math.min(100, newValue));

        smoothNeighbors(chartData, index);
    };

    const smoothNeighbors = (chartData: number[], index: number) => {
        const smoothRadius = 8;
        const influence = 0.5;

        for (let i = 1; i <= smoothRadius; i++) {
            const distance = i / smoothRadius;
            const weight = Math.exp(-distance * distance * 3) * influence;
            const draggedValue = chartData[index];

            if (index - i >= 0) {
                chartData[index - i] =
                    chartData[index - i] * (1 - weight) + draggedValue * weight;
            }

            if (index + i < chartData.length) {
                chartData[index + i] =
                    chartData[index + i] * (1 - weight) + draggedValue * weight;
            }
        }

        applyGaussianSmoothing(chartData, index, smoothRadius);
    };

    const applyGaussianSmoothing = (
        chartData: number[],
        centerIndex: number,
        radius: number,
    ) => {
        const tempData = [...chartData];
        const start = Math.max(0, centerIndex - radius);
        const end = Math.min(chartData.length - 1, centerIndex + radius);

        for (let i = start; i <= end; i++) {
            if (i === 0 || i === chartData.length - 1) continue;

            let sum = 0;
            let weightSum = 0;

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
    };

    const onPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        if (!canvas) return;

        const { x, y } = getRelativePosition(event);
        const index = findNearestPoint(workingData, x, y);

        if (index !== -1) {
            isDragging = true;
            dragIndex = index;
            currentMouseX = x;
            currentMouseY = y;
            canvas.setPointerCapture(event.pointerId);
            canvas.style.cursor = "grabbing";
            workingData = [...data];
            drawChart(workingData);
        }
    };

    const onPointerMove = (event: PointerEvent) => {
        if (!isDragging) return;
        event.preventDefault();

        const { x, y } = getRelativePosition(event);
        currentMouseX = x;
        currentMouseY = y;

        dragIndex = findPointIndexFromX(workingData, x);

        if (dragIndex !== -1) {
            updateChartPoint(workingData, dragIndex, y);
            drawChart(workingData);
        }
    };

    const endDrag = (event: PointerEvent) => {
        if (!isDragging) return;
        event.preventDefault();
        canvas.releasePointerCapture(event.pointerId);
        isDragging = false;
        dragIndex = -1;
        canvas.style.cursor = "grab";
        appState.setChartData(workingData);
        drawChart(workingData);
    };

    onMount(() => {
        ctx = canvas.getContext("2d");
        canvas.style.cursor = "grab";

        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerup", endDrag);
        canvas.addEventListener("pointerleave", endDrag);
    });

    onDestroy(() => {
        canvas?.removeEventListener("pointerdown", onPointerDown);
        canvas?.removeEventListener("pointermove", onPointerMove);
        canvas?.removeEventListener("pointerup", endDrag);
        canvas?.removeEventListener("pointerleave", endDrag);
    });
</script>

<canvas bind:this={canvas} width="500" height="400"></canvas>

<style>
    canvas {
        width: 100%;
        height: auto;
    }
</style>

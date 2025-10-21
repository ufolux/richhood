<script lang="ts">
    import Icon from "@iconify/svelte";
    import html2canvas from "html2canvas";
    import { onDestroy, onMount } from "svelte";
    import { get } from "svelte/store";
    import StockChart from "./StockChart.svelte";
    import {
        appState,
        downloadSignal,
        formatCurrency,
        formatSignedCurrency,
        getTimeLabel,
        type ChartPeriod,
    } from "./store";

    const periodButtons: ChartPeriod[] = [
        "LIVE",
        "1D",
        "1W",
        "1M",
        "3M",
        "YTD",
    ];

    let viewState = get(appState);

    let isDownloading = false;
    let screenRef: HTMLDivElement | null = null;
    let unsubscribeAppState: (() => void) | undefined;
    let unsubscribeDownload: (() => void) | undefined;

    onMount(() => {
        unsubscribeAppState = appState.subscribe((value) => {
            viewState = value;
        });

        unsubscribeDownload = downloadSignal.subscribe(async (count) => {
            if (count === 0) return;
            await captureScreenshot();
        });

        return () => {
            unsubscribeAppState?.();
            unsubscribeDownload?.();
        };
    });

    onDestroy(() => {
        unsubscribeAppState?.();
        unsubscribeDownload?.();
    });

    const handlePeriodClick = (period: ChartPeriod) => {
        appState.setSelectedPeriod(period);
    };

    const captureScreenshot = async () => {
        if (!screenRef || isDownloading) return;
        isDownloading = true;

        try {
            const canvas = await html2canvas(screenRef, {
                backgroundColor:
                    viewState.colorMode === "light" ? "#ffffff" : "#000000",
                scale: 2,
                logging: false,
                width: 440,
                height: 667,
            });

            const blob: Blob | null = await new Promise((resolve) =>
                canvas.toBlob(resolve),
            );

            if (!blob) {
                throw new Error("Unable to generate screenshot");
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = `robinhood-${Date.now()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Screenshot failed", error);
            alert("Screenshot failed. Please try again.");
        } finally {
            isDownloading = false;
        }
    };
</script>

<div class="preview-panel">
    <div class="phone-mockup-wrapper">
        <div
            bind:this={screenRef}
            class={`robinhood-screen ${viewState.colorMode === "light" ? "light-mode" : ""}`}
        >
            <div class="header">
                <div class="title">
                    Investing
                    <Icon icon="lsicon:down-outline" width="32" height="32" />
                </div>

                {#if viewState.badge !== "none"}
                    <div
                        class={`badge ${viewState.badge.toLowerCase().replace(" ", "-")}`}
                    >
                        {#if viewState.badge === "Gold"}
                            Gold
                        {:else if viewState.badge === "Free Stock"}
                            <Icon icon="mdi:gift" width="16" height="16" />
                            <span>Free Stock</span>
                        {:else if viewState.badge === "Rewards"}
                            <Icon icon="mdi:gift-open" width="16" height="16" />
                            <span>Rewards</span>
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="amount">
                {formatCurrency(viewState.investmentAmount)}
            </div>

            <div
                class={`performance ${viewState.gainLoss >= 0 ? "positive" : "negative"}`}
            >
                <span
                    class={`arrow ${viewState.gainLoss >= 0 ? "arrow-up" : "arrow-down"}`}
                ></span>
                <span class="change-amount"
                    >{formatSignedCurrency(viewState.gainLoss)}</span
                >
                <span class="change-percent">
                    ({viewState.percentage >= 0
                        ? "+"
                        : ""}{viewState.percentage.toFixed(2)}%)
                </span>
                <span class="time-label"
                    >{getTimeLabel(viewState.selectedPeriod)}</span
                >
            </div>

            <div class="chart-container">
                <StockChart
                    data={viewState.chartData}
                    positive={viewState.gainLoss >= 0}
                    lightMode={viewState.colorMode === "light"}
                />
            </div>

            <div class="time-buttons-separator"></div>

            <div class="time-buttons">
                {#each periodButtons as period}
                    <button
                        class={`time-btn ${period === "LIVE" ? "time-btn-live" : ""} ${viewState.selectedPeriod === period ? "active" : ""} ${viewState.gainLoss >= 0 ? "positive" : "negative"}`}
                        on:click={() => handlePeriodClick(period)}
                        type="button"
                    >
                        {#if period === "LIVE"}
                            <span class="live-dot"></span>
                        {/if}
                        {period}
                    </button>
                {/each}
                <button
                    type="button"
                    class={`time-btn-settings ${viewState.gainLoss >= 0 ? "positive" : "negative"}`}
                >
                    <Icon icon="mdi:cog" width="20" height="20" />
                </button>
            </div>
        </div>
    </div>
</div>

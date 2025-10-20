import { get, writable } from "svelte/store";

export type ChartPeriod = "LIVE" | "1D" | "1W" | "1M" | "3M" | "YTD";
export type ColorMode = "dark" | "light";
export type BadgeType = "Gold" | "Free Stock" | "Rewards" | "none";

export interface AppState {
  investmentAmount: number;
  gainLoss: number;
  percentage: number;
  timePeriod: string;
  badge: BadgeType;
  colorMode: ColorMode;
  selectedPeriod: ChartPeriod;
  chartData: number[];
}

const defaultState: AppState = {
  investmentAmount: 10984.4,
  gainLoss: 1574.57,
  percentage: 16.74,
  timePeriod: "Past Year",
  badge: "Gold",
  colorMode: "dark",
  selectedPeriod: "1D",
  chartData: [],
};

const timeLabelMap: Record<ChartPeriod, string> = {
  LIVE: "Past hour",
  "1D": "Today",
  "1W": "Past week",
  "1M": "Past month",
  "3M": "Past 3 months",
  YTD: "Year to date",
};

export const chartPointsMap: Record<ChartPeriod, number> = {
  LIVE: 120,
  "1D": 150,
  "1W": 140,
  "1M": 120,
  "3M": 180,
  YTD: 240,
};

const sanitizeCurrency = (value: number, allowNegative = false) => {
  if (!Number.isFinite(value)) return 0;
  const sanitized = Number(value.toFixed(2));
  if (!allowNegative && sanitized < 0) return 0;
  return sanitized;
};

export const calculatePercentage = (investment: number, gainLoss: number) => {
  const denominator = investment - gainLoss;
  if (!investment || Math.abs(denominator) < 1e-6) return 0;
  return (gainLoss / denominator) * 100;
};

export const calculateGainLoss = (investment: number, percentage: number) => {
  const denominator = 100 + percentage;
  if (!investment || Math.abs(denominator) < 1e-6) return 0;
  return (investment * percentage) / denominator;
};

const smoothData = (data: number[], passes: number) => {
  let smoothed = [...data];

  for (let pass = 0; pass < passes; pass++) {
    const newData = [...smoothed];
    for (let i = 1; i < smoothed.length - 1; i++) {
      newData[i] = (smoothed[i - 1] + smoothed[i] + smoothed[i + 1]) / 3;
    }
    smoothed = newData;
  }

  return smoothed;
};

export const generateChartData = (percentage: number, period: ChartPeriod) => {
  const numPoints = chartPointsMap[period] ?? 100;
  const chartData: number[] = [];

  const startValue = 50;
  const endValue = startValue + percentage * 0.5;

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const trendValue = startValue + (endValue - startValue) * progress;

    const volatility = 8 + Math.abs(percentage) * 0.3;
    const noise = (Math.random() - 0.5) * volatility;
    const prevValue =
      chartData.length > 0 ? chartData[chartData.length - 1] : startValue;
    const randomWalk = (Math.random() - 0.5) * 5;

    let value = trendValue + noise + randomWalk * 0.8;

    // Reduced smoothing for sharper curves (was 0.4/0.6, now 0.2/0.8)
    if (chartData.length > 0) {
      value = prevValue * 0.2 + value * 0.8;
    }

    if (Math.random() > 0.85) {
      const spike = (Math.random() - 0.5) * volatility * 3;
      value += spike;
    }

    chartData.push(value);
  }

  // No smoothing passes for sharper curves (was 1, now 0)
  return smoothData(chartData, 0);
};

const createDefaultState = () => ({
  ...defaultState,
  chartData: generateChartData(
    defaultState.percentage,
    defaultState.selectedPeriod,
  ),
});

function createAppState() {
  const { subscribe, update, set } = writable<AppState>(createDefaultState());

  return {
    subscribe,
    reset: () => set(createDefaultState()),
    setInvestmentAmount: (value: number) =>
      update((state) => ({
        ...state,
        investmentAmount: Math.max(0, sanitizeCurrency(value)),
      })),
    setGainLoss: (value: number) =>
      update((state) => {
        const gainLoss = sanitizeCurrency(value, true);
        const percentage = sanitizeCurrency(
          calculatePercentage(state.investmentAmount, gainLoss),
        );

        return {
          ...state,
          gainLoss,
          percentage,
        };
      }),
    setPercentage: (value: number) =>
      update((state) => {
        const percentage = sanitizeCurrency(value, true);
        const gainLoss = sanitizeCurrency(
          calculateGainLoss(state.investmentAmount, percentage),
          true,
        );

        return {
          ...state,
          percentage,
          gainLoss,
        };
      }),
    updateState: (params: {
      investmentAmount: number;
      gainLoss?: number;
      percentage?: number;
      timePeriod?: string;
      badge?: BadgeType;
      colorMode?: ColorMode;
      selectedPeriod?: ChartPeriod;
      lastEdited?: "gainLoss" | "percentage";
    }) =>
      update((state) => {
        const investment = Math.max(
          0,
          sanitizeCurrency(params.investmentAmount),
        );
        let gainLoss = state.gainLoss;
        let percentage = state.percentage;

        // Calculate based on what was edited last
        if (params.gainLoss !== undefined && params.lastEdited === "gainLoss") {
          gainLoss = sanitizeCurrency(params.gainLoss, true);
          percentage = sanitizeCurrency(
            calculatePercentage(investment, gainLoss),
          );
        } else if (
          params.percentage !== undefined &&
          params.lastEdited === "percentage"
        ) {
          percentage = sanitizeCurrency(params.percentage, true);
          gainLoss = sanitizeCurrency(
            calculateGainLoss(investment, percentage),
            true,
          );
        } else if (params.gainLoss !== undefined) {
          gainLoss = sanitizeCurrency(params.gainLoss, true);
          percentage = sanitizeCurrency(
            calculatePercentage(investment, gainLoss),
          );
        } else if (params.percentage !== undefined) {
          percentage = sanitizeCurrency(params.percentage, true);
          gainLoss = sanitizeCurrency(
            calculateGainLoss(investment, percentage),
            true,
          );
        } else {
          // Neither gainLoss nor percentage provided, recalculate based on new investment
          percentage = sanitizeCurrency(
            calculatePercentage(investment, gainLoss),
          );
        }

        const newState: AppState = {
          ...state,
          investmentAmount: investment,
          gainLoss,
          percentage,
          timePeriod: params.timePeriod ?? state.timePeriod,
          badge: params.badge ?? state.badge,
          colorMode: params.colorMode ?? state.colorMode,
          selectedPeriod: params.selectedPeriod ?? state.selectedPeriod,
          chartData:
            params.selectedPeriod &&
            params.selectedPeriod !== state.selectedPeriod
              ? generateChartData(percentage, params.selectedPeriod)
              : state.chartData,
        };

        return newState;
      }),
    setTimePeriod: (value: string) =>
      update((state) => ({
        ...state,
        timePeriod: value,
      })),
    setBadge: (value: BadgeType) =>
      update((state) => ({
        ...state,
        badge: value,
      })),
    setColorMode: (value: ColorMode) =>
      update((state) => ({
        ...state,
        colorMode: value,
      })),
    setSelectedPeriod: (value: ChartPeriod) =>
      update((state) => ({
        ...state,
        selectedPeriod: value,
        chartData: generateChartData(state.percentage, value),
      })),
    regenerateChart: () =>
      update((state) => ({
        ...state,
        chartData: generateChartData(state.percentage, state.selectedPeriod),
      })),
    setChartData: (data: number[]) =>
      update((state) => ({
        ...state,
        chartData: [...data],
      })),
  };
}

export const appState = createAppState();

export const downloadSignal = writable(0);

export const formatCurrency = (amount: number) =>
  `$${Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatSignedCurrency = (amount: number) => {
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${formatCurrency(amount)}`;
};

export const getTimeLabel = (period: ChartPeriod) =>
  timeLabelMap[period] ?? period;

export const isPositiveChange = () => {
  const state = get(appState);
  return state.gainLoss >= 0;
};

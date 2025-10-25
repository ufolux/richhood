<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    appState,
    calculateGainLoss,
    calculatePercentage,
    downloadSignal,
    type AppState,
    type BadgeType,
    type ChartPeriod,
    type ColorMode,
  } from "./store";
  import { onDestroy } from "svelte";

  type LastEditedField = "gainLoss" | "percentage" | null;
  type EditableField = "investmentAmount" | "gainLoss" | "percentage";

  const timePeriodOptions = [
    "Past Year",
    "All Time",
    "Past Month",
    "Past Week",
    "Today",
  ];

  const badgeOptions: BadgeType[] = ["Gold", "Free Stock", "Rewards", "none"];

  const periodOptions: ChartPeriod[] = ["LIVE", "1D", "1W", "1M", "3M", "YTD"];

  const formatField = (value: number) => value.toFixed(2);

  let form = {
    investmentAmount: "0.00",
    gainLoss: "0.00",
    percentage: "0.00",
    timePeriod: timePeriodOptions[0],
    badge: "Gold" as BadgeType,
    colorMode: "dark" as ColorMode,
    selectedPeriod: "1D" as ChartPeriod,
  };

  let lastEdited: LastEditedField = "gainLoss";
  let latestState: AppState | null = null;
  let focusedField: EditableField | null = null;

  let investmentError = false;

  const syncForm = (state: AppState) => {
    latestState = state;
    form = {
      investmentAmount:
        focusedField === "investmentAmount"
          ? form.investmentAmount
          : formatField(state.investmentAmount),
      gainLoss:
        focusedField === "gainLoss"
          ? form.gainLoss
          : formatField(state.gainLoss),
      percentage:
        focusedField === "percentage"
          ? form.percentage
          : formatField(state.percentage),
      timePeriod: state.timePeriod,
      badge: state.badge,
      colorMode: state.colorMode,
      selectedPeriod: state.selectedPeriod,
    };
  };

  const unsubscribe = appState.subscribe(syncForm);

  onDestroy(unsubscribe);

  const sanitizeDisplay = (value: number) =>
    Number.isFinite(value) ? value.toFixed(2) : "0.00";

  function validateInputs() {
    // form.investmentAmount can be a number or string depending on input state
    const investmentStr = String(form.investmentAmount);
    const parsedInvestment = Number.parseFloat(investmentStr);

    investmentError =
      investmentStr.trim() === "" ||
      Number.isNaN(parsedInvestment) ||
      parsedInvestment <= 0;

    return !investmentError;
  }

  function applyUpdates() {
    if (!validateInputs()) {
      return;
    }

    const investment = Number.parseFloat(form.investmentAmount);
    const currentState = latestState;

    let gainLossValue =
      form.gainLoss.trim() === ""
        ? (currentState?.gainLoss ?? NaN)
        : Number.parseFloat(form.gainLoss);
    let percentageValue =
      form.percentage.trim() === ""
        ? (currentState?.percentage ?? NaN)
        : Number.parseFloat(form.percentage);

    const hasGainLoss = Number.isFinite(gainLossValue);
    const hasPercentage = Number.isFinite(percentageValue);

    // Determine which field takes priority for calculation
    let editPriority: "gainLoss" | "percentage" | undefined = undefined;
    if (hasGainLoss && (!hasPercentage || lastEdited === "gainLoss")) {
      editPriority = "gainLoss";
    } else if (hasPercentage && (!hasGainLoss || lastEdited === "percentage")) {
      editPriority = "percentage";
    } else if (lastEdited) {
      editPriority = lastEdited;
    }

    // Use updateState for atomic update of all related values
    appState.updateState({
      investmentAmount: investment,
      gainLoss: hasGainLoss ? gainLossValue : undefined,
      percentage: hasPercentage ? percentageValue : undefined,
      timePeriod: form.timePeriod,
      badge: form.badge,
      colorMode: form.colorMode,
      selectedPeriod: form.selectedPeriod,
      lastEdited: editPriority,
    });
  }

  function handleNonAutoInput() {
    investmentError = false;
    applyUpdates();
  }

  function handleGainLossInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    form = { ...form, gainLoss: target.value };
    lastEdited = "gainLoss";

    applyUpdates();
  }

  function handlePercentageInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    form = { ...form, percentage: target.value };
    lastEdited = "percentage";

    applyUpdates();
  }

  function handleFocus(field: EditableField) {
    focusedField = field;
  }

  function handleBlur(field: EditableField) {
    focusedField = null;
    if (!latestState) return;

    if (field === "investmentAmount") {
      form = {
        ...form,
        investmentAmount: formatField(latestState.investmentAmount),
      };
    } else if (field === "gainLoss") {
      form = { ...form, gainLoss: formatField(latestState.gainLoss) };
    } else if (field === "percentage") {
      form = { ...form, percentage: formatField(latestState.percentage) };
    }
  }
</script>

<div class="controls-panel">
  <h1>Richhood - Make you rich immediately</h1>

  <div class="control-group">
    <label for="investmentAmount">Investment Amount ($) *</label>
    <input
      id="investmentAmount"
      type="number"
      class={`required ${investmentError ? "error" : ""}`}
      bind:value={form.investmentAmount}
      min="0"
      step="0.01"
      required
      on:input={handleNonAutoInput}
      on:focus={() => handleFocus("investmentAmount")}
      on:blur={() => handleBlur("investmentAmount")}
    />
    <div class={investmentError ? "error-text" : "helper-text"}>
      {investmentError
        ? "Please enter a value greater than zero"
        : "Required field"}
    </div>
  </div>

  <div class="control-group">
    <label for="gainLoss">Gain/Loss Amount ($)</label>
    <input
      id="gainLoss"
      type="number"
      bind:value={form.gainLoss}
      step="0.01"
      on:input={handleGainLossInput}
      on:focus={() => handleFocus("gainLoss")}
      on:blur={() => handleBlur("gainLoss")}
    />
    <div class="helper-text">
      Leave blank to keep the existing change amount
    </div>
  </div>

  <div class="control-group">
    <label for="percentage">Percentage (%)</label>
    <input
      id="percentage"
      type="number"
      bind:value={form.percentage}
      step="0.01"
      on:input={handlePercentageInput}
      on:focus={() => handleFocus("percentage")}
      on:blur={() => handleBlur("percentage")}
    />
    <div class="helper-text">Leave blank to keep the existing percentage</div>
  </div>

  <div class="control-group">
    <label for="timePeriod">Time Period</label>
    <select
      id="timePeriod"
      bind:value={form.timePeriod}
      on:change={handleNonAutoInput}
    >
      {#each timePeriodOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </div>

  <div class="control-group">
    <label for="badgeSelect">Badge Type</label>
    <select
      id="badgeSelect"
      bind:value={form.badge}
      on:change={handleNonAutoInput}
    >
      {#each badgeOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </div>

  <div class="control-group">
    <label for="colorMode">Color Mode</label>
    <select
      id="colorMode"
      bind:value={form.colorMode}
      on:change={handleNonAutoInput}
    >
      <option value="dark">Dark Mode</option>
      <option value="light">Light Mode</option>
    </select>
  </div>

  <div class="control-group">
    <label for="selectedPeriod">Selected Chart Period</label>
    <select
      id="selectedPeriod"
      bind:value={form.selectedPeriod}
      on:change={handleNonAutoInput}
    >
      {#each periodOptions as option}
        <option value={option}>{option}</option>
      {/each}
    </select>
  </div>

  <button type="button" class="btn-primary" on:click={handleNonAutoInput}>
    <Icon icon="mdi:update" width="20" height="20" />
    Update Preview
  </button>
</div>

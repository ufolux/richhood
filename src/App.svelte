<script lang="ts">
  import ControlPanel from "./lib/ControlPanel.svelte";
  import PreviewScreen from "./lib/PreviewScreen.svelte";
</script>

<main
  class="flex h-screen overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]"
>
  <!-- Left Panel - Controls -->
  <div class="w-[400px] flex-shrink-0 overflow-y-auto">
    <ControlPanel />
  </div>

  <!-- Right Panel - Preview -->
  <div class="flex-1 overflow-hidden">
    <PreviewScreen />
  </div>
</main>

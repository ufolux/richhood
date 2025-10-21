<script lang="ts">
    import ControlPanel from "./lib/ControlPanel.svelte";
    import PreviewScreen from "./lib/PreviewScreen.svelte";
</script>

<main
    class="flex flex-col lg:flex-row min-h-screen lg:h-screen overflow-x-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]"
>
    <!-- Left Panel - Controls -->
    <div class="w-full lg:w-[400px] flex-shrink-0 overflow-y-auto lg:h-screen">
        <ControlPanel />
    </div>

    <!-- Right Panel - Preview -->
    <div
        class="flex-1 overflow-y-auto lg:overflow-hidden min-h-screen lg:h-screen"
    >
        <PreviewScreen />
    </div>
</main>

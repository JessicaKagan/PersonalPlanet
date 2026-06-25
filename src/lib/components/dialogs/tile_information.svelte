<script lang="ts">
    import RootDialog from "../root_dialog.svelte";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";

    interface TileInformationProps {
        class?: string,
        phaserRef: TPhaserRef
    }

    let {
        class: propsClass = "",
        phaserRef: phaserRef = { game: null, scene: null }
    }: TileInformationProps = $props()

</script>

<RootDialog class={propsClass}>
</RootDialog>

<style lang="scss">
    :global {
        background-color: blue; // DEBUG
    }
</style>
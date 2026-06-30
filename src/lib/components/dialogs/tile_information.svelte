<script lang="ts">
    import RootDialog from "../root_dialog.svelte";

    import type { TPhaserRef } from "../../../PhaserGame.svelte";
    import type { Game } from "../../../game/scenes/Game";
    import { TileInformationDialogMode } from "../../../game/defines";

    interface TileInformationProps {
        class?: string,
        phaserRef: TPhaserRef
    }

    let dialogMode = TileInformationDialogMode.HOVER;

    let {
        class: propsClass = "",
        phaserRef: phaserRef = { game: null, scene: null }
    }: TileInformationProps = $props()

</script>

<RootDialog id="tile-information-dialog">
    <p>Hello tile information dialog world</p>
</RootDialog>

<style lang="scss">
    :global {
        #tile-information-dialog {
            width: 128px;
            height: 128px;
            &::backdrop {
                pointer-events: none;
                background: none;
            }
        }
    }
</style>
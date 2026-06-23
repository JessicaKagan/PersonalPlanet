<script lang="ts">
    import RootMenu from "../root_menu.svelte";

    let {
        class: propsClass = ""
    } = $props()

</script>

<RootMenu class={propsClass}>
    <button class="controls" title="Query" aria-label="query">🔍</button>
    <button class="controls" title="Draw" aria-label="draw">🖌️</button>
</RootMenu>

<style lang="scss">
    :global {
        .menu-container {
            // TODO: Figure out why the height isn't scaling based on the viewport size.
            // Once this is figured out, we can most likely remove the "top" rule.
            height: 80%;
            margin: 0 auto;
            overflow-y: scroll;
            position: absolute;
            top: 64px;

            // The menu is intended to be responsive... to a point.
            // A minimum width keeps the container from getting too small in the short term.
            width: calc(100% * 1/12);
            min-width: 128px;
            padding: 16px 0;

            // The menu is filled with a grid of buttons - 2 columns per row until we run out of buttons to render.
            display: grid;
            grid-template-columns: auto auto;
            grid-auto-rows: minmax(32px, 64px);
            gap: 8px;
        }

        .controls {
            all: unset;
            margin: auto;
            margin: auto;
            font-size: 32px;
            border-radius: 16px;
            filter: drop-shadow(2px 2px 8px black);

            &:hover {
                background-color: #ffffff80;
            }

            &:active {
                filter: drop-shadow(0 0 4px black);
            }
        }
    }
</style>
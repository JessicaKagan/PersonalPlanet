<!-- FUTURE: This component is the parent of any bespoke dialogs in Personal Planet.
    You can include arbitrary content in each dialog's template. For example:
        <RootDialog>
            <div class="container">
                <p>Hello dialog world</p>
            </div>
        </RootDialog>
-->
<script lang="ts">

</script>

<dialog class="dialog-container">
    <slot></slot>
</dialog>

<style lang="scss">
    dialog {
        // Testing styles
        pointer-events: auto;
        height: calc(100% * 2/12);
        width: calc(100% * 2/12);
        margin: auto;

        // FUTURE: Move this block of styles into a shared "UI window" style that we can apply to dialogs, menus, and any other other components that need them.
        background-color: #cafffa94;
        border-radius: 16px;
        filter: drop-shadow(2px 2px 8px black);
    }
</style>
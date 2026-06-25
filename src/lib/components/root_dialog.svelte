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
        background-color: green;
    }
</style>
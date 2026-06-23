<script lang="ts">
    import RootMenu from "../root_menu.svelte";


</script>

<RootMenu>
    <div class="container">
        <li>Hello menu item 1</li>
        <li>Hello menu item 2</li>
    </div>
</RootMenu>

<style lang="scss">
    .container {
        height: 100%;
        width: calc(100% * 1/12);

        li {
            background-color: blue; // DEBUG
        }
    }
</style>
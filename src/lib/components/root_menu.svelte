<!-- This component is the parent of any menu bars in Personal Planet, responsible for shared logic and styles.
    You can include arbitrary content in each menu's template. For example:
    <RootMenu>
        <div class="container">
            <li>Hello menu item 1</li>
            <li>Hello menu item 2</li>
        </div>
    </RootMenu>
-->
<script lang="ts">

</script>

<menu class="menu-container">
    <slot></slot>
</menu>

<style lang="scss">
    menu {
        pointer-events: auto;
        background-color: #cafffa94;
        border-radius: 16px;
        filter: drop-shadow(2px 2px 8px black);
    }
</style>
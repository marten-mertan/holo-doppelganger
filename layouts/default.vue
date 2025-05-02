<script setupt lang="ts">
</script>

<template>
  <div :class="$style.DefaultLayout">
    <LayoutHeader />

    <main :class="$style.main">
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>

<style lang="scss" module>
  .DefaultLayout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .main {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  .layout {
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }
</style>

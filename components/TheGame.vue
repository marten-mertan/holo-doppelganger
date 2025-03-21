<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useGameStore } from '~/stores/game'

const gameStore = useGameStore()

useEventListener(document, 'keydown', (event) => {
  const direction = event.key.replace('Arrow', '').toLowerCase() as 'left' | 'right' | 'up' | 'down'
  if (['left', 'right', 'up', 'down'].includes(direction)) {
    const newStatus = gameStore.movePlayer(direction)
    if (newStatus) document.querySelector('#status span')!.textContent = newStatus
  }
})
</script>

<template>
  <div :class="$style.TheGame">
    <GameInfo />
    <GameGrid />
  </div>
</template>

<style module lang="scss">
.TheGame {
  position: relative;
}
</style>

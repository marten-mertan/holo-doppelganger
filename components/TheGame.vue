<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useGameStore } from '~/stores/game'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()

// Проверяем, загружен ли уровень
onMounted(() => {
  if (!gameStore.currentLevel) {
    console.warn('No level loaded, redirecting to home')
    router.push('/')
    return
  }
})

useEventListener(document, 'keydown', (event) => {
  if (!gameStore.currentLevel) return
  
  const direction = event.key.replace('Arrow', '').toLowerCase() as 'left' | 'right' | 'up' | 'down'
  if (['left', 'right', 'up', 'down'].includes(direction)) {
    try {
      const newStatus = gameStore.movePlayer(direction)
      if (newStatus) {
        const statusElement = document.querySelector('#status span')
        if (statusElement) {
          statusElement.textContent = newStatus
        }
      }
    } catch (error) {
      console.error('Error moving player:', error)
    }
  }
})

const resetGame = () => {
  if (!gameStore.currentLevel) {
    console.warn('No level loaded, redirecting to home')
    router.push('/')
    return
  }
  // ... existing code ...
}
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
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
}
</style>

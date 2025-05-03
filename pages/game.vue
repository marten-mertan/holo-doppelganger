<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()

// Если уровень не загружен, перенаправляем на выбор уровня
onMounted(() => {
  if (!gameStore.currentLevel) {
    router.push('/')
  }
})
</script>

<template>
  <div :class="[$style.GamePage, 'page container']">
    <TheGame />
  </div>
</template>

<style lang="scss" module>
.GamePage {
  //
}
</style> 
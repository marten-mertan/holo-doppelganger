<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()

// Если уровень уже загружен, перенаправляем на игру
onMounted(() => {
  if (gameStore.currentLevel) {
    router.push('/game/')
  }
})
</script>

<template>
  <div :class="[$style.IndexPage, 'page container']">
    <TheMenu />
  </div>
</template>

<style lang="scss" module>
.IndexPage {
  //
}
</style>

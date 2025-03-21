<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const gameStore = useGameStore()
const status = ref('Нажмите стрелки для движения')

const remainingMoves = computed(() => Math.max(0, gameStore.MIMIC_DELAY - gameStore.moves))
const mimicMovesText = computed(() => {
  if (gameStore.moves < gameStore.MIMIC_DELAY) return 'Мимик не появился'
  if (gameStore.mimicMoves >= gameStore.MIMIC_MOVE_LIMIT) return 'Мимик остановился'
  const futureMoves = []
  const currentMimicStep = Math.max(0, gameStore.mimicMoves)
  const remainingMimicMoves = Math.min(gameStore.MIMIC_MOVE_LIMIT - gameStore.mimicMoves, gameStore.moveHistory.length - currentMimicStep - 1)
  for (let i = 0; i < remainingMimicMoves; i++) {
    const idx = currentMimicStep + i
    if (idx + 1 < gameStore.moveHistory.length) {
      const currentPos = gameStore.moveHistory[idx]
      const nextPos = gameStore.moveHistory[idx + 1]
      if (nextPos.col < currentPos.col) futureMoves.push('влево')
      else if (nextPos.col > currentPos.col) futureMoves.push('вправо')
      else if (nextPos.row < currentPos.row) futureMoves.push('вверх')
      else if (nextPos.row > currentPos.row) futureMoves.push('вниз')
    }
  }
  return futureMoves.length > 0 ? futureMoves.join(', ') : 'Нет движений'
})
</script>

<template>
  <div :class="$style.GameInfo">
    <p>Ходы: <span>{{ gameStore.moves }}</span></p>
    <p>Статус: <span>{{ status }}</span></p>
    <p v-if="remainingMoves > 0">
      До появления мимика: <span class="text-orange-500 font-bold">{{ remainingMoves }}</span> хода
    </p>
    <p>Движения мимика: <span class="text-magenta-500 font-bold">{{ mimicMovesText }}</span></p>
    <button @click="gameStore.resetGame">
      Начать заново
    </button>
  </div>
</template>

<style module lang="scss">
.GameInfo {
  margin-bottom: 2rem;

  p {
    font-size: 1.6rem;
    margin-top: .8rem;
  }

  button {
    margin-top: 2rem;
  }
}
</style>

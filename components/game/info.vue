<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import { useRouter } from 'vue-router'

const gameStore = useGameStore()
const router = useRouter()
const status = ref('Нажмите стрелки для движения')

const remainingMoves = computed(() => {
  return gameStore.currentLevel ? Math.max(0, gameStore.currentLevel.mimic.delay - gameStore.moves) : 0
})

const mimicState = computed(() => {
  if (!gameStore.currentLevel) return 'Нет уровня'
  if (gameStore.moves < gameStore.currentLevel.mimic.delay) return 'Мимик не появился'
  if (gameStore.hasMimicFinished) return 'Мимик остановился'
  return 'Мимик в движении'
})

const mimicPattern = computed(() => {
  if (!gameStore.currentLevel) return ''
  
  const maxMoves = gameStore.currentLevel.mimic.moveLimit
  const moves = gameStore.moveHistory.slice(1)
  
  return moves.slice(0, maxMoves).map((move, index) => {
    const prevMove = index > 0 ? moves[index - 1] : gameStore.currentLevel?.player
    if (!prevMove) return ''
    
    if (move.row < prevMove.row) return '↑'
    if (move.row > prevMove.row) return '↓'
    if (move.col > prevMove.col) return '→'
    if (move.col < prevMove.col) return '←'
    return ''
  }).join(' ')
})

const resetGame = () => {
  if (!gameStore.currentLevel) {
    console.warn('No level loaded, redirecting to home')
    router.push('/')
    return
  }
  try {
    gameStore.loadLevel(gameStore.currentLevel)
  } catch (err) {
    console.error('Error resetting game:', err)
    router.push('/')
  }
}

const goBack = () => {
  gameStore.$reset()
  router.push('/')
}
</script>

<template>
  <div :class="$style.gameInfo">
    <div :class="$style.controls">
      <button @click="goBack" class="button">←</button>
      <button @click="resetGame" class="button">↻</button>
    </div>
    
    <div :class="$style.stats">
      <div :class="$style.statItem">
        <span>Статус</span>
        <span :class="$style.value">{{ status }}</span>
      </div>
      <div :class="$style.statItem">
        <span>Ходов до появления мимика</span>
        <span :class="$style.value">{{ remainingMoves }}</span>
      </div>
      <div :class="$style.statItem">
        <span>Мимик:</span>
        <span :class="$style.value">{{ mimicState }}</span>
      </div>
      <div :class="$style.statItem">
        <span>Повторяемые ходы:</span>
        <span :class="$style.value">{{ mimicPattern }}</span>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.gameInfo {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(4px);
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.stats {
  display: grid;
  gap: 6px;
}

.statItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #666;
  
  span:first-child {
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.7;
  }
}

.value {
  font-weight: 500;
  color: #222;
}

.pattern {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 13px;
  color: #5E5CE6;
  text-align: right;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>

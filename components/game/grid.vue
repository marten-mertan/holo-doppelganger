<script setup lang="ts">
import GameEntity from '@/components/game/entity.vue'
import GameTile from '@/components/game/tile.vue'
import { useGameStore } from '~/stores/game'
import type { Position } from '~/types/tLevel'

const gameStore = useGameStore()

// Определяем тип для компонента Entity
type EntityComponent = InstanceType<typeof GameEntity> & {
  animate: (newPos: Position, lastPos: Position, gameOver: boolean) => void
  setPosition: (pos: Position) => void
}

const playerEntity = ref<EntityComponent | null>(null)
const mimicEntity = ref<EntityComponent | null>(null)

const gridSize = computed(() => gameStore.currentLevel?.gridSize || 0)

// Debug information
const debugInfo = computed(() => ({
  playerPos: gameStore.playerPos,
  mimicPos: gameStore.mimicPos,
  currentLevel: gameStore.currentLevel,
  gridSize: gameStore.currentLevel?.gridSize
}))

const updateAnimations = () => {
  if (playerEntity.value) {
    playerEntity.value.setPosition(gameStore.playerPos)
  }
  if (mimicEntity.value && gameStore.mimicPos && !gameStore.gameOver) {
    mimicEntity.value.setPosition(gameStore.mimicPos)
  }
}

// Use a computed property to track changes
const gameState = computed(() => ({
  playerPos: gameStore.playerPos,
  mimicPos: gameStore.mimicPos,
  gameOver: gameStore.gameOver,
  doors: gameStore.doors,
  moves: gameStore.moves,
  mimicMoves: gameStore.mimicMoves,
  currentLevel: gameStore.currentLevel
}))

// Watch for changes in game state
watch(
  gameState,
  (newState, oldState) => {
    const shouldUpdate = 
      newState.playerPos !== oldState.playerPos ||
      newState.mimicPos !== oldState.mimicPos ||
      (newState.gameOver && !oldState.gameOver) ||
      newState.doors !== oldState.doors ||
      newState.moves !== oldState.moves ||
      newState.mimicMoves !== oldState.mimicMoves ||
      newState.currentLevel !== oldState.currentLevel

    if (shouldUpdate) {
      updateAnimations()
    }
  },
  { deep: true }
)

onMounted(() => {
  updateAnimations()
})

// Cleanup
onUnmounted(() => {
  playerEntity.value = null
  mimicEntity.value = null
})
</script>

<template>
  <div :class="$style.GameGrid">
    <div :class="$style.entitiesLayer">
      <GameEntity
        ref="playerEntity"
        type="player"
        :pos="gameStore.playerPos"
        :last-pos="gameStore.playerLastPos"
        :facing="gameStore.playerFacing"
      />
      <GameEntity
        v-if="gameStore.mimicPos"
        ref="mimicEntity"
        type="mimic"
        :pos="gameStore.mimicPos"
        :last-pos="gameStore.mimicLastPos"
        :facing="gameStore.mimicFacing"
      />
    </div>
    <div :class="$style.grid">
      <div
        v-for="row in gridSize"
        :key="row"
        :class="$style.row"
      >
        <div
          v-for="col in gridSize"
          :key="col"
          :class="$style.cell"
        >
          <GameTile
            :position="{ row: row - 1, col: col - 1 }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.GameGrid {
  position: relative;
  display: flex;
  flex: 0 0 auto;
  will-change: transform;
  contain: layout style paint;
}

.entitiesLayer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.grid {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  background-color: #333;
  margin: 0;
  will-change: transform;
  contain: layout style paint;
}

.row {
  display: flex;
  flex: 0 0 auto;
  will-change: transform;
  contain: layout style paint;
}

.cell {
  position: relative;
  width: 80px;
  height: 80px;
  will-change: transform;
  contain: layout style paint;
}

.debug {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem;
  font-size: 12px;
  z-index: 2;
}
</style>

<script setup lang="ts">
import GameEntity from '@/components/game/entity.vue'
import { useGameStore } from '~/stores/game'

const gameStore = useGameStore()

const playerEntity = ref<InstanceType<typeof GameEntity> | null>(null)
const mimicEntity = ref<InstanceType<typeof GameEntity> | null>(null)

const updateAnimations = () => {
  if (playerEntity.value) {
    playerEntity.value.animate(gameStore.playerPos, gameStore.playerLastPos, gameStore.gameOver)
  }
  if (mimicEntity.value && gameStore.mimicPos && !gameStore.gameOver) { // Останавливаем анимацию мимика при gameOver
    mimicEntity.value.animate(gameStore.mimicPos, gameStore.mimicLastPos, gameStore.gameOver)
  }
}
watch(
  () => [gameStore.playerPos, gameStore.mimicPos, gameStore.gameOver],
  (newValues, oldValues) => {
    // Вызываем анимацию только если позиция изменилась или gameOver только что стал true
    const [newPlayerPos, newMimicPos, newGameOver] = newValues
    const [oldPlayerPos, oldMimicPos, oldGameOver] = oldValues
    if (
      (newPlayerPos !== oldPlayerPos)
      || (newMimicPos !== oldMimicPos)
      || (newGameOver && !oldGameOver)
    ) {
      updateAnimations()
    }
  },
  { deep: true },
)

onMounted(() => {
  updateAnimations()
})
</script>

<template>
  <div :class="$style.GameGrid">
    <div id="entities-layer">
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
    <div
      id="grid"
      :class="$style.grid"
    >
      <div
        v-for="row in gameStore.GRID_SIZE"
        :key="row"
        :class="$style.row"
      >
        <GameTile
          v-for="col in gameStore.GRID_SIZE"
          :key="`${row}-${col}`"
          :pos="{ row: row - 1, col: col - 1 }"
        />
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.GameGrid {
  position: relative;
  display: flex;
  flex: 0 0 auto;
}

.grid {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  background-color: #333;
  margin: 0;
}

.row {
  display: flex;
  flex: 0 0 auto;
}
</style>

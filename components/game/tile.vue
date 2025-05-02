<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/stores/game'
import type { Position } from '~/types/level'

const props = defineProps<{
  position: Position
}>()

const gameStore = useGameStore()

const isPlatform = computed(() => gameStore.isPlatform(props.position.row, props.position.col))
const isLadder = computed(() => gameStore.isLadder(props.position.row, props.position.col))
const isLadderGround = computed(() => {
  if (!isLadder.value) return false
  const { row, col } = props.position
  // Проверяем, есть ли лестница под текущей позицией
  const hasLadderBelow = gameStore.isLadder(row + 1, col)
  // Если под текущей позицией нет лестницы, значит это нижняя часть
  return !hasLadderBelow
})
const hasLeftPlatform = computed(() => {
  if (!isLadder.value || isLadderGround.value) return false
  return gameStore.isPlatform(props.position.row, props.position.col - 1)
})
const hasRightPlatform = computed(() => {
  if (!isLadder.value || isLadderGround.value) return false
  return gameStore.isPlatform(props.position.row, props.position.col + 1)
})
const isLadderMid = computed(() => {
  if (!isLadder.value || isLadderGround.value) return false
  return hasLeftPlatform.value || hasRightPlatform.value
})
const isDoor = computed(() => gameStore.isDoor(props.position.row, props.position.col))
const isDoorOpen = computed(() => gameStore.isDoorOpen(props.position.row, props.position.col))
const isButton = computed(() => gameStore.isButton(props.position.row, props.position.col))
const isAltar = computed(() => 
  props.position.row === gameStore.currentLevel?.altar.row && 
  props.position.col === gameStore.currentLevel?.altar.col
)
</script>

<template>
  <div 
    class="cell" 
    :class="{
      'is-platform': isPlatform,
      'is-ladder': isLadder,
      'is-ladder-ground': isLadderGround,
      'is-ladder-mid': isLadderMid,
      'is-door': isDoor,
      'is-button': isButton,
      'is-altar': isAltar
    }"
  >
    <div v-if="isDoor" class="door" :class="{ 'is-open': isDoorOpen }"></div>
    <div v-if="isButton" class="button"></div>
    <div v-if="isAltar" class="altar"></div>
  </div>
</template>

<style scoped lang="scss">
.cell {
  width: 80px;
  height: 80px;
  position: relative;
  background-image: url('/holo-doppelganger/img/tiles/empty.png');
  background-size: cover;

  &.is-platform {
    background-image: url('/holo-doppelganger/img/tiles/ground.png');
  }

  &.is-ladder {
    background-image: url('/holo-doppelganger/img/tiles/ladder.png');
  }

  &.is-ladder-ground {
    background-image: url('/holo-doppelganger/img/tiles/ladder_ground.png');
  }

  &.is-ladder-mid {
    background-image: url('/holo-doppelganger/img/tiles/ladder_mid.png');
  }

  .door {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #9C27B0;
    transition: transform 0.3s ease;
    transform-origin: bottom;
    transform: scaleY(1);

    &.is-open {
      transform: scaleY(0);
    }
  }

  .button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background-color: #FF9800;
    border-radius: 50%;
  }

  .altar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background-color: #9C27B0;
    border-radius: 50%;
    box-shadow: 0 0 20px rgba(156, 39, 176, 0.5);
  }
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/stores/game'
import type { Position } from '~/types/tLevel'

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
const isButtonActive = computed(() => gameStore.isButtonActive(props.position.row, props.position.col))
const isExit = computed(() => 
  props.position.row === gameStore.currentLevel?.exit.row && 
  props.position.col === gameStore.currentLevel?.exit.col
)
</script>

<template>
  <div 
    :class="[
      $style.cell,
      {
        [$style['is-platform']]: isPlatform,
        [$style['is-ladder']]: isLadder,
        [$style['is-ladder-ground']]: isLadderGround,
        [$style['is-ladder-mid']]: isLadderMid,
        [$style['is-door']]: isDoor,
        [$style['is-button']]: isButton,
        [$style['is-exit']]: isExit
      }
    ]"
  >
    <div v-if="isDoor" :class="[$style.door, { [$style['is-open']]: isDoorOpen }]"></div>
    <div v-if="isButton" :class="[$style.button, { [$style['is-active']]: isButtonActive }]"></div>
    <div v-if="isExit" :class="$style.exit"></div>
  </div>
</template>

<style module lang="scss">
$exit-frames: 3;
$exit-frame-width: 32px;

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
    bottom: 18px;
    left: 50%;
    transform: translate(-50%, 0);
    width: 44px;
    height: 62px;
    background-image: url('/holo-doppelganger/img/tiles/door.png');
    background-repeat: no-repeat;
    background-position: 0 0;
    transition: background-position .3s ease .1s;

    &.is-open {
      background-position: 0 58px;
    }
  }

  .button {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translate(-50%, 0);
    width: 38px;
    height: 14px;
    background-image: url('/holo-doppelganger/img/tiles/button.png');
    background-repeat: no-repeat;
    background-position: 0 0;
    transition: background-position .3s ease;

    &.is-active {
      background-position: 0 8px;
    }
  }

  .exit {
    position: absolute;
    bottom: 22px;
    left: 50%;
    transform: translate(-50%, 0);
    width: 32px;
    height: 64px;
    background-image: url('/holo-doppelganger/img/tiles/exit.png');
    background-repeat: no-repeat;
    background-position: 0 0;
    background-size: #{$exit-frames * $exit-frame-width} auto;
    animation: exit #{$exit-frames * 0.15s} steps(#{$exit-frames}) infinite;
  }
}

@keyframes exit {
  from { background-position-x: 0; }
  to { background-position-x: -#{$exit-frame-width * ($exit-frames)}; }
}
</style>

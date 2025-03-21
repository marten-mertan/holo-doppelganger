<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const { type, pos, facing } = defineProps<{
  type: 'player' | 'mimic'
  pos: { row: number, col: number }
  facing: 'left' | 'right'
}>()

const $style = useCssModule()
const gameStore = useGameStore()

const entityRef = ref<HTMLElement | null>(null)
const classList = ref<string[]>([$style[type], $style.idle, $style['facing-right']])

let animationTimeout: ReturnType<typeof setTimeout> | null = null

// Обновление направления
watch(() => facing, (newFacing) => {
  if (entityRef.value) {
    classList.value = classList.value.filter(cls => cls !== $style['facing-left'] && cls !== $style['facing-right'])
    classList.value.push(newFacing === 'left' ? $style['facing-left'] : $style['facing-right'])
  }
}, { immediate: true })

const animate = (currentPos: { row: number, col: number }, previousPos: { row: number, col: number } | null, isGameOver: boolean) => {
  if (!entityRef.value) return

  // Очищаем таймер только если игра не окончена
  if (animationTimeout && !isGameOver) {
    clearTimeout(animationTimeout)
    animationTimeout = null
  }

  const isMoving = previousPos && (currentPos.row !== previousPos.row || currentPos.col !== previousPos.col)

  // Базовый список классов, включая тип и направление
  const newClassList = [$style[type], facing === 'left' ? $style['facing-left'] : $style['facing-right']]

  if (isGameOver && type === 'player') {
    newClassList.push($style.dying)
    // Не добавляем таймер, чтобы анимация смерти проигрывалась полностью
  }
  else if (isMoving) {
    newClassList.push($style.run)
    animationTimeout = setTimeout(() => {
      if (entityRef.value && !gameStore.gameOver) { // Проверяем gameOver на момент срабатывания таймера
        classList.value = [$style[type], $style.idle, facing === 'left' ? $style['facing-left'] : $style['facing-right']]
      }
    }, 480)
  }
  else {
    newClassList.push($style.idle)
  }

  classList.value = newClassList

  entityRef.value.style.animation = 'none'
  void entityRef.value.offsetWidth
  entityRef.value.style.animation = ''

  console.log(`${type} animate:`, { currentPos, previousPos, facing, isGameOver, classList: classList.value })
}

defineExpose({ animate })
</script>

<template>
  <div
    ref="entityRef"
    :class="[$style.GameEntity, classList]"
    :style="{ left: `${pos.col * gameStore.CELL_SIZE}px`, top: `${pos.row * gameStore.CELL_SIZE}px` }"
  />
</template>

<style module lang="scss">
$idle-frames: 4;
$run-frames: 6;
$frame-width: 80px;

.GameEntity {
  width: 80px;
  height: 80px;
  position: absolute;
  background-repeat: no-repeat;
  transition: left 0.2s linear, top 0.2s ease-in;
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.player {
  z-index: 20;
}

.mimic {
  z-index: 10;
}

.player.idle {
  background-image: url('~/public/img/player/player_idle.png');
  background-size: #{$idle-frames * $frame-width} auto;
  animation: idle #{$idle-frames * 0.15s} steps(#{$idle-frames - 1}) infinite;
}

.mimic.idle {
  background-image: url('~/public/img/mimic/mimic_idle.png');
  background-size: #{$idle-frames * $frame-width} auto;
  animation: idle #{$idle-frames * 0.15s} steps(#{$idle-frames - 1}) infinite;
}

.player.run {
  background-image: url('~/public/img/player/player_run.png');
  background-size: #{$run-frames * $frame-width} auto;
  animation: run #{$run-frames * 0.08s} steps(#{$run-frames - 1}) forwards;
}

.mimic.run {
  background-image: url('~/public/img/mimic/mimic_run.png');
  background-size: #{$run-frames * $frame-width} auto;
  animation: run #{$run-frames * 0.08s} steps(#{$run-frames - 1}) forwards;
}

.facing-left {
  --facing-scale: -1;
  transform: scaleX(var(--facing-scale));
}

.facing-right {
  --facing-scale: 1;
  transform: scaleX(var(--facing-scale));
}

.dying {
  background-image: url('~/public/img/player/player_idle.png');
  background-size: #{$idle-frames * $frame-width} auto;
  animation: death 1s ease forwards;
}

@keyframes idle {
  from { background-position-x: 0; }
  to { background-position-x: -#{$frame-width * ($idle-frames - 1)}; }
}

@keyframes run {
  from { background-position-x: 0; }
  to { background-position-x: -#{$frame-width * ($run-frames - 1)}; }
}

@keyframes death {
  0% {
    opacity: 1;
    transform: scaleX(var(--facing-scale)) scale(1) rotate(0deg);
  }
  50% {
    opacity: 0.5;
    transform: scaleX(var(--facing-scale)) scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scaleX(var(--facing-scale)) scale(0) rotate(360deg);
  }
}
</style>

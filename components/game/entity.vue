<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { Position } from '~/types/level'

const props = defineProps<{
  type: 'player' | 'mimic'
  pos: Position
  lastPos: Position | null
  facing: 'left' | 'right'
}>()

const entityRef = ref<HTMLDivElement | null>(null)
const animationFrame = ref<number | null>(null)
const isMoving = ref(false)

const animationState = computed(() => isMoving.value ? 'run' : 'idle')

const animate = (startPos: Position, endPos: Position, duration: number = 200) => {
  if (!entityRef.value) return

  isMoving.value = true

  const startX = startPos.col * 80
  const startY = startPos.row * 80
  const endX = endPos.col * 80
  const endY = endPos.row * 80

  const startTime = performance.now()

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress

    entityRef.value!.style.transform = `translate(${currentX}px, ${currentY}px) scaleX(${props.facing === 'left' ? -1 : 1})`

    if (progress < 1) {
      animationFrame.value = requestAnimationFrame(step)
    } else {
      animationFrame.value = null
      isMoving.value = false
    }
  }

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
  }

  animationFrame.value = requestAnimationFrame(step)
}

const setPosition = (pos: Position) => {
  if (!entityRef.value) return
  const x = pos.col * 80
  const y = pos.row * 80
  entityRef.value.style.transform = `translate(${x}px, ${y}px) scaleX(${props.facing === 'left' ? -1 : 1})`
  isMoving.value = false
}

onMounted(() => {
  setPosition(props.pos)
})

watch(() => props.pos, (newPos, oldPos) => {
  if (props.lastPos) {
    animate(props.lastPos, newPos)
  } else {
    setPosition(newPos)
  }
})

defineExpose({
  setPosition,
  animate
})
</script>

<template>
  <div
    ref="entityRef"
    :class="[
      $style.GameEntity,
      $style[type],
      $style[props.facing === 'left' ? 'facing-left' : 'facing-right'],
      $style[animationState]
    ]"
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
  opacity: 1;
  transform: scale(1) rotate(0deg);
  will-change: transform, opacity;
}

.player {
  z-index: 20;
}

.mimic {
  z-index: 10;
}

.player.idle {
  background-image: url('/holo-doppelganger/img/player/player_idle.png');
  background-size: #{$idle-frames * $frame-width} auto;
  animation: idle #{$idle-frames * 0.15s} steps(#{$idle-frames - 1}) infinite;
}

.mimic.idle {
  background-image: url('/holo-doppelganger/img/mimic/mimic_idle.png');
  background-size: #{$idle-frames * $frame-width} auto;
  animation: idle #{$idle-frames * 0.15s} steps(#{$idle-frames - 1}) infinite;
}

.player.run {
  background-image: url('/holo-doppelganger/img/player/player_run.png');
  background-size: #{$run-frames * $frame-width} auto;
  animation: run #{$run-frames * 0.08s} steps(#{$run-frames - 1}) forwards;
}

.mimic.run {
  background-image: url('/holo-doppelganger/img/mimic/mimic_run.png');
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
  background-image: url('/holo-doppelganger/img/player/player_idle.png');
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

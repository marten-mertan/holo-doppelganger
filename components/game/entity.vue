<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { Position } from '~/types/tLevel'
import { useGameStore } from '~/stores/game'

const props = defineProps<{
  type: 'player' | 'mimic'
  pos: Position
  lastPos: Position | null
  facing: 'left' | 'right'
}>()

const gameStore = useGameStore()
const entityRef = ref<HTMLDivElement | null>(null)
const animationFrame = ref<number | null>(null)
const isMoving = ref(false)
const isDying = ref(false)

const movingState = computed(() => {
  return isMoving.value ? 'run' : 'idle'
})

watch(() => gameStore.gameOver, (newVal) => {
  if (newVal && props.type === 'player') {
    if (entityRef.value) {
      console.log("gameOver", entityRef.value.style.transform)
    }

    isDying.value = true;
  }
})

const animate = (startPos: Position, endPos: Position, duration: number = 200) => {
  console.log("animate", startPos, endPos, duration, props.type)
  if (!entityRef.value) {
    console.error("Entity ref is not defined");
    return;
  }

  if (isDying.value) {
    const startTime = performance.now();
    const deathDuration = 300;
    const startX = startPos.col * 80
    const startY = startPos.row * 80
    const endX = endPos.col * 80
    const endY = endPos.row * 80

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / deathDuration, 1);
      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;
      
      let rotation;
      let opacity;
      if (progress <= 0.2) {
        rotation = 0;
        opacity = 1;
      } else {
        rotation = -(progress - 0.2) * 337.5;
        opacity = 1 - progress;
      }

      entityRef.value!.style.transform = `
        translate(${currentX}px, ${currentY}px)
        scaleX(${props.facing === 'left' ? -1 : 1})
        rotate(${rotation}deg)
      `;
      entityRef.value!.style.opacity = `${opacity}`;

      if (progress < 1) {
        animationFrame.value = requestAnimationFrame(step);
      } else {
        if (animationFrame.value) {
          cancelAnimationFrame(animationFrame.value);
        }
        animationFrame.value = null;
        isDying.value = false;
      }
    };

    animationFrame.value = requestAnimationFrame(step);
    return;
  }

  if (startPos.row === endPos.row && startPos.col === endPos.col) {
    console.log("startPos and endPos are the same, skipping animation");
    return;
  }

  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value)
    animationFrame.value = null
  }

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

  animationFrame.value = requestAnimationFrame(step)
}

const setPosition = (pos: Position) => {
  if (!entityRef.value) return;
  const x = pos.col * 80;
  const y = pos.row * 80;
  entityRef.value.style.transform = `translate(${x}px, ${y}px) scaleX(${props.facing === 'left' ? -1 : 1})`;
  entityRef.value.style.opacity = '1';
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
    animationFrame.value = null;
  }
  isMoving.value = false;
};

onMounted(() => {
  setPosition(props.pos)
})

watch(() => props.pos, (newPos, oldPos) => {
  setPosition(newPos);
  animate(oldPos, newPos);
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
      $style[movingState],
      $style[isDying ? 'dying' : '']
    ]"
  />
</template>

<style module lang="scss">
$idle-frames: 4;
$run-frames: 6;
$frame-width: 80px;

@mixin entity-animation($type, $state, $frames, $duration) {
  &.#{$type}.#{$state} {
    background-image: url('/holo-doppelganger/img/#{$type}/#{$type}_#{$state}.png');
    background-size: #{$frames * $frame-width} auto;
    animation: #{$state} #{$frames * $duration} steps(#{$frames}) infinite;
  }
}

.GameEntity {
  width: 80px;
  height: 80px;
  position: absolute;
  background-repeat: no-repeat;
  opacity: 1;
  transform: scaleX(var(--facing-scale)) scale(1) rotate(0deg);
}

.player {
  z-index: 20;
  @include entity-animation('player', 'idle', $idle-frames, 0.15s);
  @include entity-animation('player', 'run', $run-frames, 0.08s);
}

.mimic {
  z-index: 10;
  @include entity-animation('mimic', 'idle', $idle-frames, 0.15s);
  @include entity-animation('mimic', 'run', $run-frames, 0.08s);
}

.facing-left {
  --facing-scale: -1;
}

.facing-right {
  --facing-scale: 1;
}

@keyframes idle {
  from { background-position-x: 0; }
  to { background-position-x: -#{$frame-width * ($idle-frames)}; }
}

@keyframes run {
  from { background-position-x: 0; }
  to { background-position-x: -#{$frame-width * ($run-frames)}; }
}

@keyframes death {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}
</style>

<script setup lang="ts">
import { useGameStore } from '~/stores/game'

const { pos } = defineProps<{
  pos: { row: number, col: number }
}>()

const $style = useCssModule()
const gameStore = useGameStore()

const classList = computed(() => ({
  [$style['ground']]: gameStore.groundCells.some(g => g.row === pos.row && g.col === pos.col),
  [$style['obstacle']]: gameStore.obstacles.some(o => o.row === pos.row && o.col === pos.col),
  [$style['altar']]: gameStore.altarPos.row === pos.row && gameStore.altarPos.col === pos.col,
  [$style['ladder']]: gameStore.ladderCells.some(l => l.row === pos.row && l.col === pos.col),
  [$style['ladder-ground']]: gameStore.ladderCells.some(l => l.row === pos.row && l.col === pos.col) && !gameStore.ladderCells.some(l => l.row === pos.row + 1 && l.col === pos.col),
}))
</script>

<template>
  <div
    :class="[$style.GameTile, classList]"
  />
</template>

<style module lang="scss">
.GameTile {
  width: 80px;
  height: 80px;
  background-image: url('~/public/img/tiles/empty.png');
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  background-size: cover;
  background-position: center;
}
.ground {
  background-image: url('~/public/img/tiles/ground.png');
  background-color: #8B4513;
}
.obstacle {
  background-image: url('~/public/img/tiles/obstacle.png');
  background-color: #666;
}
.altar {
  background-image: url('~/public/img/tiles/altar.png');
  background-color: #00ff00;
}
.ladder {
  background-image: url('~/public/img/tiles/ladder.png');
  background-color: #4682B4;
}
.ladder-ground {
  background-image: url('~/public/img/tiles/ladder_ground.png');
  background-color: #4682B4;
}
</style>

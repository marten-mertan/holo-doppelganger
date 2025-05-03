<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import type { Level } from '~/types/tLevel'
import level1 from '~/assets/json/levels/1.json'
import level2 from '~/assets/json/levels/2.json'

const gameStore = useGameStore()
const router = useRouter()
const levels = ref<Level[]>([])
const error = ref<string | null>(null)

onMounted(() => {
  // Если уровень уже загружен в хранилище, используем его
  if (gameStore.currentLevel) {
    levels.value = [gameStore.currentLevel]
    return
  }

  try {
    console.log('Loaded levels:', level1, level2) // Debug log
    levels.value = [level1, level2]
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Error loading levels:', errorMessage)
    error.value = `Ошибка загрузки уровней: ${errorMessage}`
  }
})

const selectLevel = (level: Level) => {
  try {
    console.log('Selecting level:', level)
    gameStore.loadLevel(level)
    router.push('/game/')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Error loading level:', errorMessage)
    error.value = `Ошибка загрузки уровня: ${errorMessage}`
  }
}
</script>

<template>
  <div :class="$style.TheMenu">
    <h1>Выберите уровень</h1>
    <div v-if="error" :class="$style.error">
      {{ error }}
    </div>
    <div :class="$style.levels">
      <div
        v-for="(level, index) in levels"
        :key="index"
        :class="$style.levelCard"
        @click="selectLevel(level)"
      >
        <h2>Уровень {{ index + 1 }}</h2>
        <p>Задержка мимика: {{ level.mimic.delay }} ходов</p>
        <p>Количество ходов мимика: {{ level.mimic.moveLimit }}</p>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.TheMenu {
  padding: 2rem;
  text-align: center;
  color: #fff;
  text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;
  font-family: 'Press Start 2P', cursive;
  background-color: #4a4a4a;
  border: .4rem solid $black;
  box-shadow: .4rem .4rem 0 $black;

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    color: $yellow;
  }
}

.error {
  color: #ff6666;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #ff6666;
  font-size: 1rem;
  font-family: 'Press Start 2P', cursive;
}

.levels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.levelCard {
  background: #3a3a3a;
  padding: 1rem;
  border-radius: 0;
  cursor: pointer;
  color: #fff;
  border: .4rem solid $black;
  box-shadow: .4rem .4rem 0 $black;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.9rem;

  &:hover {
    transform: translate(.2rem, .2rem);
    box-shadow: .2rem .2rem 0 $black;
    background: #4a4a4a;
  }

  h2 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    color: #66ccff;
  }

  p {
    margin: 0.3rem 0;
    font-size: 0.8rem;
    color: #fff;
  }
}
</style> 
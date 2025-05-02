<script setup lang="ts">
import { useGameStore } from '~/stores/game'
import type { Level } from '~/types/level'
import level1 from '~/assets/json/levels/1.json'

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
    console.log('Loaded level:', level1) // Debug log
    levels.value = [level1]
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Error loading levels:', errorMessage)
    error.value = `Ошибка загрузки уровней: ${errorMessage}`
  }
})

const selectLevel = (level: Level) => {
  try {
    console.log('Selecting level:', level) // Debug log
    gameStore.loadLevel(level)
    router.push('/game')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    console.error('Error loading level:', errorMessage)
    error.value = `Ошибка загрузки уровня: ${errorMessage}`
  }
}
</script>

<template>
  <div :class="$style.LevelSelect">
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
.LevelSelect {
  padding: 2rem;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: #fff;
  }
}

.error {
  color: #ff4444;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
  font-size: 1.1rem;
}

.levels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.levelCard {
  background: rgba(51, 51, 51, 0.9);
  padding: 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: scale(1.05);
    background: rgba(51, 51, 51, 1);
  }

  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    color: #fff;
  }

  p {
    margin: 0.5rem 0;
    font-size: 1.1rem;
    color: #fff;
  }
}
</style> 
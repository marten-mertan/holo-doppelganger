<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { useGameStore } from '~/stores/game'
import { useRouter } from 'vue-router'
import type { Router } from 'vue-router'
import type { MoveDirection } from '~/types/tGame'

type GameStore = ReturnType<typeof useGameStore>

const gameStore: GameStore = useGameStore()
const router: Router = useRouter()

/**
 * Проверяет, загружен ли уровень, и перенаправляет на главную страницу, если нет.
 * @returns {boolean} Возвращает `true`, если уровень загружен, иначе `false`.
 */
const checkLevelLoaded = (): boolean => {
  if (!gameStore.currentLevel) {
    console.warn('No level loaded, redirecting to home')
    router.push('/')
    return false
  }
  return true
}

/**
 * Обрабатывает движение игрока на основе нажатой клавиши.
 * @param {Direction} direction Направление движения ('left', 'right', 'up', 'down').
 */
const handlePlayerMove = (direction: MoveDirection): void => {
  try {
    const newStatus: string | void = gameStore.movePlayer(direction)
    if (newStatus) {
      const statusElement: HTMLElement | null = document.querySelector('#status span')
      if (statusElement) statusElement.textContent = newStatus
    }
  } catch (error: unknown) {
    console.error('Error moving player:', error)
  }
}

/**
 * Обрабатывает событие нажатия клавиши.
 * @param {KeyboardEvent} event Событие клавиатуры.
 */
const handleKeyDown = (event: KeyboardEvent): void => {
  if (!checkLevelLoaded()) return

  const direction: MoveDirection = event.key.replace('Arrow', '').toLowerCase() as MoveDirection
  if (isValidDirection(direction)) {
    handlePlayerMove(direction)
  }
}

/**
 * Проверяет, является ли строка допустимым направлением.
 * @param {string} direction Строка для проверки.
 * @returns {direction is Direction} Возвращает `true`, если направление допустимо.
 */
const isValidDirection = (direction: string): direction is MoveDirection => {
  return ['left', 'right', 'up', 'down'].includes(direction)
}

// Подписываемся на событие нажатия клавиши
useEventListener(document, 'keydown', handleKeyDown)

onMounted(() => {
  // Проверяем загрузку уровня при монтировании компонента
  checkLevelLoaded()
})
</script>

<template>
  <div :class="$style.TheGame">
    <GameInfo />
    <GameGrid />
  </div>
</template>

<style module lang="scss">
.TheGame {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>

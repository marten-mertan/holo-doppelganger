import { defineStore } from 'pinia'
import type { Level, Position, Door, Button } from '~/types/level'

export const useGameStore = defineStore('game', {
  state: () => ({
    currentLevel: null as Level | null,
    playerPos: { row: 0, col: 0 },
    playerLastPos: { row: 0, col: 0 },
    mimicLastPos: null as Position | null,
    playerFacing: 'right' as 'left' | 'right',
    mimicFacing: 'right' as 'left' | 'right',
    moveHistory: [] as Position[],
    moves: 0,
    mimicMoves: 0,
    gameOver: false,
    doors: [] as Door[],
    buttons: [] as Button[],
    lastMimicMove: 0,
  }),

  actions: {
    loadLevel(level: Level) {
      this.currentLevel = level
      this.playerPos = { ...level.player }
      this.playerLastPos = { ...level.player }
      this.mimicLastPos = null
      this.playerFacing = 'right'
      this.mimicFacing = 'right'
      this.moveHistory = [{ ...level.player }]
      this.moves = 0
      this.mimicMoves = 0
      this.gameOver = false
      this.doors = level.doors.map(door => ({ ...door }))
      this.buttons = level.buttons.map(button => ({ ...button }))
      this.lastMimicMove = 0
    },

    movePlayer(direction: 'left' | 'right' | 'up' | 'down'): string | void {
      if (this.gameOver || !this.currentLevel) return

      const oldPlayerPos = { ...this.playerPos }
      let newRow = this.playerPos.row
      let newCol = this.playerPos.col

      // Handle movement
      switch (direction) {
        case 'left':
          newCol--
          this.playerFacing = 'left'
          break
        case 'right':
          newCol++
          this.playerFacing = 'right'
          break
        case 'up':
          if (!this.isLadder(this.playerPos.row, this.playerPos.col)) return
          newRow--
          // Проверяем, есть ли лестница в новой позиции
          if (!this.isLadder(newRow, newCol)) return
          break
        case 'down':
          if (!this.isLadder(this.playerPos.row, this.playerPos.col)) return
          newRow++
          // Проверяем, есть ли лестница в новой позиции
          if (!this.isLadder(newRow, newCol)) return
          break
        default:
          return
      }

      // Validate new position
      if (newRow < 0 || newRow >= this.currentLevel.gridSize || newCol < 0 || newCol >= this.currentLevel.gridSize) return
      if (this.isDoor(newRow, newCol) && !this.isDoorOpen(newRow, newCol)) return

      // Update player position
      this.playerPos = { row: newRow, col: newCol }
      
      // Apply gravity if not on ladder
      if (!this.isLadder(this.playerPos.row, this.playerPos.col)) {
        this.playerPos = this.applyGravity(this.playerPos)
        if (this.playerPos.row >= this.currentLevel.gridSize) {
          this.gameOver = true
          return 'Поражение: Вы упали за пределы сетки!'
        }
      }

      // Update game state
      this.moveHistory.push({ ...this.playerPos })
      this.moves++
      
      // Обновляем позицию мимика перед проверкой кнопок
      this.updateMimicPosition()
      
      // Check buttons after updating both player and mimic positions
      this.checkButtons(this.playerPos)
      
      // Check for collisions
      if (this.checkCollision(this.playerPos, oldPlayerPos)) {
        this.gameOver = true
        return 'Поражение: Вы столкнулись с мимиком!'
      }

      // Check for victory
      if (this.playerPos.row === this.currentLevel.altar.row && this.playerPos.col === this.currentLevel.altar.col) {
        this.gameOver = true
        return 'Победа! Вы достигли алтаря!'
      }

      // Обновляем предыдущую позицию после всех изменений
      this.playerLastPos = { ...oldPlayerPos }
      return 'Нажмите стрелки для движения'
    },

    updateMimicPosition() {
      if (!this.currentLevel) return
      if (this.moves < this.currentLevel.mimic.delay) return
      if (this.mimicMoves >= this.currentLevel.mimic.moveLimit) return

      const lastPlayerMove = this.moves - this.currentLevel.mimic.delay
      if (lastPlayerMove < 0) return

      const playerMoves = this.moveHistory.slice(0, lastPlayerMove + 1)
      if (playerMoves.length === 0) return

      // Если это первый ход мимика, сбрасываем счетчик
      if (this.moves === this.currentLevel.mimic.delay) {
        this.mimicMoves = 0
        this.mimicLastPos = null
        return // Не считаем появление за ход
      }

      // Сохраняем текущую позицию как предыдущую
      if (this.mimicPos) {
        this.mimicLastPos = { ...this.mimicPos }
      }

      // Увеличиваем счетчик ходов мимика
      this.mimicMoves++

      // Обновляем направление
      const currentMove = playerMoves[this.mimicMoves - 1]
      if (currentMove) {
        if (currentMove.col > (this.mimicLastPos?.col ?? 0)) {
          this.mimicFacing = 'right'
        } else if (currentMove.col < (this.mimicLastPos?.col ?? 0)) {
          this.mimicFacing = 'left'
        }
      }
    },

    isPlatform(row: number, col: number): boolean {
      return this.currentLevel?.platforms.some(p => p.row === row && p.col === col) || false
    },

    isLadder(row: number, col: number): boolean {
      return this.currentLevel?.ladders.some(l => l.row === row && l.col === col) || false
    },

    isDoor(row: number, col: number): boolean {
      return this.doors.some(d => d.pos.row === row && d.pos.col === col)
    },

    isDoorOpen(row: number, col: number): boolean {
      return this.doors.find(d => d.pos.row === row && d.pos.col === col)?.isOpen || false
    },

    isButton(row: number, col: number): boolean {
      return this.buttons.some(b => b.pos.row === row && b.pos.col === col)
    },

    checkButtons(pos: Position) {
      // Сначала закрываем все двери
      this.doors.forEach(door => {
        door.isOpen = false
      })

      // Проверяем, стоит ли игрок на кнопке
      this.buttons.forEach(button => {
        if (button.pos.row === pos.row && button.pos.col === pos.col) {
          const door = this.doors.find(d => d.buttonPos.row === button.pos.row && d.buttonPos.col === button.pos.col)
          if (door) {
            door.isOpen = true
          }
        }
      })

      // Проверяем, стоит ли мимик на кнопке
      if (this.mimicPos) {
        this.buttons.forEach(button => {
          if (button.pos.row === this.mimicPos?.row && button.pos.col === this.mimicPos?.col) {
            const door = this.doors.find(d => d.buttonPos.row === button.pos.row && d.buttonPos.col === button.pos.col)
            if (door) {
              door.isOpen = true
            }
          }
        })
      }
    },

    applyGravity(pos: Position): Position {
      let currentRow = pos.row
      const currentCol = pos.col

      if (this.isPlatform(currentRow, currentCol) || this.isLadder(currentRow, currentCol)) {
        return { row: currentRow, col: currentCol }
      }

      while (currentRow < (this.currentLevel?.gridSize || 0) - 1) {
        const nextRow = currentRow + 1
        if (this.isPlatform(nextRow, currentCol) || this.isLadder(nextRow, currentCol)) {
          return { row: nextRow, col: currentCol }
        }
        currentRow++
      }
      return { row: this.currentLevel?.gridSize || 0, col: currentCol }
    },

    checkCollision(newPlayerPos: Position, oldPlayerPos: Position): boolean {
      if (!this.currentLevel || this.moves < this.currentLevel.mimic.delay) return false
      
      const mimicStep = Math.min(this.mimicMoves, Math.max(0, this.moveHistory.length - 1))
      const mimicPos = mimicStep < this.moveHistory.length ? this.moveHistory[mimicStep] : null
      if (!mimicPos) return false

      const prevMimicStep = Math.max(0, mimicStep - 1)
      const prevMimicPos = prevMimicStep < this.moveHistory.length ? this.moveHistory[prevMimicStep] : mimicPos

      return (
        (newPlayerPos.row === mimicPos.row && newPlayerPos.col === mimicPos.col) ||
        (prevMimicPos &&
          newPlayerPos.row === prevMimicPos.row && 
          newPlayerPos.col === prevMimicPos.col &&
          oldPlayerPos.row === mimicPos.row && 
          oldPlayerPos.col === mimicPos.col)
      )
    },
  },

  getters: {
    mimicPos(): Position | null {
      if (!this.currentLevel) return null
      if (this.moves < this.currentLevel.mimic.delay) return null

      const lastPlayerMove = this.moves - this.currentLevel.mimic.delay
      if (lastPlayerMove < 0) return null

      const playerMoves = this.moveHistory.slice(0, lastPlayerMove + 1)
      if (playerMoves.length === 0) return null

      // Берем ход игрока, который мимик должен повторить
      const moveIndex = Math.min(this.mimicMoves, playerMoves.length - 1)
      const move = playerMoves[moveIndex]
      if (!move) return null

      return {
        row: move.row,
        col: move.col
      }
    },

    remainingMimicMoves(): number {
      if (!this.currentLevel) return 0
      if (this.moves < this.currentLevel.mimic.delay) return this.currentLevel.mimic.moveLimit
      
      // Если мимик уже сделал все ходы
      if (this.mimicMoves >= this.currentLevel.mimic.moveLimit) return 0
      
      // Если мимик только появился
      if (this.moves === this.currentLevel.mimic.delay) return this.currentLevel.mimic.moveLimit
      
      // В остальных случаях считаем оставшиеся ходы
      return this.currentLevel.mimic.moveLimit - this.mimicMoves
    },

    hasMimicFinished(): boolean {
      if (!this.currentLevel) return false
      if (this.moves < this.currentLevel.mimic.delay) return false
      return this.mimicMoves >= this.currentLevel.mimic.moveLimit
    },
  },
})

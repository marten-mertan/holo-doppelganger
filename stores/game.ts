import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    GRID_SIZE: 7,
    MIMIC_DELAY: 3,
    MIMIC_MOVE_LIMIT: 4,
    CELL_SIZE: 80,
    obstacles: [{ row: 2, col: 5 }, { row: 5, col: 4 }],
    altarPos: { row: 2, col: 6 },
    groundCells: [
      { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 },
      { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }, { row: 4, col: 2 },
      { row: 4, col: 3 }, { row: 2, col: 5 }, { row: 2, col: 6 },
    ],
    ladderCells: [
      { row: 5, col: 1 }, { row: 6, col: 1 }, { row: 3, col: 4 }, { row: 4, col: 4 },
      { row: 3, col: 6 }, { row: 4, col: 6 }, { row: 5, col: 6 }, { row: 6, col: 6 },
      { row: 4, col: 1 }, { row: 2, col: 4 },
    ],
    playerPos: { row: 6, col: 0 },
    playerLastPos: { row: 6, col: 0 },
    mimicLastPos: null as { row: number, col: number } | null,
    playerFacing: 'right' as 'left' | 'right',
    mimicFacing: 'right' as 'left' | 'right',
    moveHistory: [{ row: 6, col: 0 }],
    moves: 0,
    mimicMoves: 0,
    gameOver: false,
  }),

  actions: {
    movePlayer(direction: 'left' | 'right' | 'up' | 'down') {
      if (this.gameOver) return

      const oldPlayerPos = { ...this.playerPos }
      let newRow = this.playerPos.row
      let newCol = this.playerPos.col

      if (direction === 'left') {
        newCol--
        this.playerFacing = 'left'
      }
      else if (direction === 'right') {
        newCol++
        this.playerFacing = 'right'
      }
      else if (direction === 'up' && this.isLadder(this.playerPos.row, this.playerPos.col)) {
        newRow--
        if (newRow >= 0 && !this.isLadder(newRow, this.playerPos.col)) return
      }
      else if (direction === 'down' && this.isLadder(this.playerPos.row, this.playerPos.col)) {
        newRow++
        if (newRow < this.GRID_SIZE && !this.isLadder(newRow, this.playerPos.col)) return
      }
      else return

      if (newRow < 0 || newRow >= this.GRID_SIZE || newCol < 0 || newCol >= this.GRID_SIZE) return
      if (this.obstacles.some(obs => obs.row === newRow && obs.col === newCol)) return

      this.playerPos = { row: newRow, col: newCol }
      if (!this.isLadder(this.playerPos.row, this.playerPos.col)) {
        this.playerPos = this.applyGravity(this.playerPos)
        if (this.playerPos.row >= this.GRID_SIZE) {
          this.gameOver = true
          return 'Поражение: Вы упали за пределы сетки!'
        }
      }

      this.moveHistory.push({ ...this.playerPos })
      this.moves++
      if (this.moves > this.MIMIC_DELAY && this.mimicMoves < this.MIMIC_MOVE_LIMIT) {
        const oldMimicPos = this.mimicPos ? { ...this.mimicPos } : null
        this.mimicMoves++
        if (oldMimicPos && this.mimicPos) {
          this.mimicLastPos = oldMimicPos
          if (this.mimicPos.col !== oldMimicPos.col) {
            this.mimicFacing = this.mimicPos.col > oldMimicPos.col ? 'right' : 'left'
          }
        }
      }

      if (this.checkCollision(this.playerPos, oldPlayerPos)) {
        this.gameOver = true
        return 'Поражение: Вы столкнулись с мимиком!'
      }

      if (this.playerPos.row === this.altarPos.row && this.playerPos.col === this.altarPos.col) {
        this.gameOver = true
        return 'Победа! Вы достигли алтаря!'
      }

      this.playerLastPos = { ...oldPlayerPos }

      console.log('Game state:', {
        playerPos: this.playerPos,
        playerLastPos: this.playerLastPos,
        mimicPos: this.mimicPos,
        mimicLastPos: this.mimicLastPos,
        playerFacing: this.playerFacing,
        mimicFacing: this.mimicFacing,
        moves: this.moves,
        mimicMoves: this.mimicMoves,
      })

      return 'Нажмите стрелки для движения'
    },

    resetGame() {
      this.playerPos = { row: 6, col: 0 }
      this.playerLastPos = { row: 6, col: 0 }
      this.mimicLastPos = null
      this.playerFacing = 'right'
      this.mimicFacing = 'right'
      this.moveHistory = [{ row: 6, col: 0 }]
      this.moves = 0
      this.mimicMoves = 0
      this.gameOver = false
    },

    isGround(row: number, col: number) {
      return this.groundCells.some(g => g.row === row && g.col === col)
    },

    isLadder(row: number, col: number) {
      return this.ladderCells.some(l => l.row === row && l.col === col)
    },

    applyGravity(pos: { row: number, col: number }) {
      let currentRow = pos.row
      const currentCol = pos.col

      if (this.isGround(currentRow, currentCol) || this.obstacles.some(obs => obs.row === currentRow && obs.col === currentCol) || this.isLadder(currentRow, currentCol)) {
        return { row: currentRow, col: currentCol }
      }

      while (currentRow < this.GRID_SIZE - 1) {
        const nextRow = currentRow + 1
        if (this.isGround(nextRow, currentCol) || this.obstacles.some(obs => obs.row === nextRow && obs.col === currentCol) || this.isLadder(nextRow, currentCol)) {
          return { row: nextRow, col: currentCol }
        }
        currentRow++
      }
      return { row: this.GRID_SIZE, col: currentCol }
    },

    checkCollision(newPlayerPos: { row: number, col: number }, oldPlayerPos: { row: number, col: number }) {
      if (this.moves < this.MIMIC_DELAY) return false
      const mimicStep = Math.min(this.mimicMoves, Math.max(0, this.moveHistory.length - 1))
      const mimicPos = mimicStep < this.moveHistory.length ? this.moveHistory[mimicStep] : null
      if (!mimicPos) return false

      const prevMimicStep = Math.max(0, mimicStep - 1)
      const prevMimicPos = prevMimicStep < this.moveHistory.length ? this.moveHistory[prevMimicStep] : mimicPos

      return (
        (newPlayerPos.row === mimicPos.row && newPlayerPos.col === mimicPos.col)
        || (prevMimicPos
          && newPlayerPos.row === prevMimicPos.row && newPlayerPos.col === prevMimicPos.col
          && oldPlayerPos.row === mimicPos.row && oldPlayerPos.col === mimicPos.col)
      )
    },
  },

  getters: {
    mimicPos: (state) => {
      if (state.moves < state.MIMIC_DELAY) return null
      const mimicStep = Math.min(state.mimicMoves, Math.max(0, state.moveHistory.length - 1))
      return mimicStep < state.moveHistory.length ? state.moveHistory[mimicStep] : null
    },
  },
})

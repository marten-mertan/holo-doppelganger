export interface Position {
  row: number
  col: number
}

export interface Entity {
  type: 'player' | 'mimic'
  pos: Position
  facing: 'left' | 'right'
}

export interface Door {
  pos: Position
  isOpen: boolean
  buttonPos: Position
}

export interface Button {
  pos: Position
  isActive: boolean
  doorPos: Position
}

export interface Level {
  gridSize: number
  cellSize: number
  mimic: {
    delay: number
    moveLimit: number
  }
  player: Position
  exit: Position
  platforms: Position[]
  doors: Door[]
  buttons: Button[]
  ladders: Position[]
} 
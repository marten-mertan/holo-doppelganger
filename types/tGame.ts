export type Direction = 'left' | 'right' | 'up' | 'down'
export type MoveDirection = Direction
export type FacingDirection = Extract<Direction, 'left' | 'right'>

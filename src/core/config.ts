// Примітивний варіант конфігу
const GameConfig = {
  debugMode: true,

  TILE_SIZE: 64,
  GRID_SIZE: 14,
  BACKGROUND_COLOR: '#1099bb',
  ANIMATION_SPEED: 0.2,

  UNTOUCHABLE_ROAD: [
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [3, 2],
    [3, 1],
    [3, 0],
  ],
}

export default GameConfig

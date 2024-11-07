/**
 * Grid
 */
export enum TileType {
  GROUND = 'ground',
  ROAD = 'road',
  BUILDING = 'building',
}

/**
 * Buildings
 */
export enum BuildingType {
  COALMINE = 'coalmine',
  BARRACKS = 'barracks',
  SENAT = 'senat',
}

/**
 * Road
 */
export enum RoadElements {
  NONE = 'none',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CROSS = 'cross',
  TOP_TURN = 'top_turn',
  R_TOP_CROSS = 'right_top_cross',
  V_R_TOP_END = 'vertical_right_top_end',
  H_R_BOTTOM_END = 'horizontal_right_bottom_end',
  V_L_BOTTOM_END = 'vertical_left_bottom_end',
  L_BOTTOM_TURN = 'left_bottom_turn',
  R_BOTTOM_TURN = 'right_bottom_turn',
  L_B_CROSS = 'left_bottom_cross',
  V_L_TOP_END = 'vertical_left_top_end',
  BOTTOM_TURN = 'bottom_turn',
  L_T_CROSS = 'left_top_cross',
  R_B_CROSS = 'right_bottom_cross',
}

/**
 * Worker
 */
export enum WorkerState {
  IDLE = 'idle',
  WALKING = 'walk',
}

export enum WorkerDirection {
  UP = 'up',
  DOWN = 'down',
}

/**
 * UI
 */

export enum ButtonNames {
  COALMINE = 'Coalmine',
  BARRACKS = 'Barracks',
  SENAT = 'Senate',
  ROAD = 'Road',
  RESET = 'Reset',
}

export type ButtonTexturesNames =
  | 'coalmine'
  | 'barracks'
  | 'senat'
  | 'roadButton'
  | 'reset'

export type ButtonConfig = {
  id: ButtonNames
  name: ButtonNames
  type: BuildingType | ButtonNames
  texture: ButtonTexturesNames
}

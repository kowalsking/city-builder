import { IsometricGrid } from '@/grid/IsometricGrid'
import { AssetLoader } from '@/core/AssetLoader'
import { TileType } from '@/core/types'
import { Rectangle, Texture } from 'pixi.js'

enum RoadDirections {
  NONE = 'none',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  CROSS = 'cross',
  TOP_TURN = 'top_turn', // horizontal vertical turn
  R_TOP_CROSS = 'right_top_cross', // vertical horizontal T cross
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

export class Road {
  protected roadTexture = AssetLoader.getTexture('road')
  protected roadTextureCount = { x: 6, y: 3 }
  protected roadTileSize = {
    width: this.roadTexture.width / this.roadTextureCount.x,
    height: this.roadTexture.height / this.roadTextureCount.y,
  }
  protected currentDirections = RoadDirections.NONE
  protected frames: Record<RoadDirections, [number, number]> = {
    [RoadDirections.HORIZONTAL]: [0, 0],
    [RoadDirections.VERTICAL]: [1, 0],
    [RoadDirections.CROSS]: [2, 0],
    [RoadDirections.TOP_TURN]: [3, 0],
    [RoadDirections.R_TOP_CROSS]: [4, 0],
    [RoadDirections.V_R_TOP_END]: [5, 0],
    [RoadDirections.H_R_BOTTOM_END]: [0, 1],
    [RoadDirections.V_L_BOTTOM_END]: [1, 1],
    [RoadDirections.L_BOTTOM_TURN]: [2, 1],
    [RoadDirections.R_BOTTOM_TURN]: [3, 1],
    [RoadDirections.L_B_CROSS]: [4, 1],
    [RoadDirections.V_L_TOP_END]: [5, 1],
    [RoadDirections.BOTTOM_TURN]: [3, 2],
    [RoadDirections.L_T_CROSS]: [4, 2],
    [RoadDirections.R_B_CROSS]: [5, 2],
    [RoadDirections.NONE]: [0, 2],
  }
  protected grid: IsometricGrid
  constructor(grid: IsometricGrid) {
    this.grid = grid
  }

  protected getRoadTexture() {
    const texture = this.roadTexture
    const frame = this.getRoadFrame(RoadDirections.CROSS)

    return new Texture({
      source: texture.baseTexture,
      frame,
    })
  }

  private getRoadNeighbors(x: number, y: number): any {
    let neighbors: any = RoadDirections.NONE

    // Перевіряємо всі сусідні тайли
    if (this.isRoad(x - 1, y - 1)) {
      neighbors = Texture.WHITE
    }
    if (this.isRoad(x, y - 1)) {
      neighbors = Texture.WHITE
    }
    if (this.isRoad(x + 1, y - 1)) {
      
    }
    if (this.isRoad(x-1, y )) {
      
    }
    if (this.isRoad(x, y)) {
      
    }
    if (this.isRoad(x + 1, y)) {
      
    }
    if (this.isRoad(x-1, y+1)) {
      
    }
    if (this.isRoad(x, y+1)) {
      
    }
    if (this.isRoad(x+1, y+1)) {
      
    }

    // return neighbors
    return {
      texture: Texture.WHITE,
      x: x,
      y: y-1
    }
  }

  private isRoad(x: number, y: number): boolean {
    const tile = this.grid.getTile(x, y)
    // return tile?.getType() === TileType.ROAD
    return true
  }

  protected getRoadFrame(direction: RoadDirections) {
    const [x, y] = this.frames[direction]

    return new Rectangle(
      0 + x * this.roadTileSize.width,
      0 + y * this.roadTileSize.height,
      this.roadTileSize.width,
      this.roadTileSize.height
    )
  }

  public placeRoad(x: number, y: number, grid: IsometricGrid): boolean {
    const roadTexture = this.getRoadTexture()
    const neighbor = this.getRoadNeighbors(x, y)

    grid.addTile(x, y, TileType.ROAD, roadTexture)
    grid.addTile(neighbor.x, neighbor.y, TileType.ROAD, neighbor.texture)
    return true
  }
}

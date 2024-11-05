import * as PIXI from 'pixi.js'
import { AssetLoader } from '@/core/AssetLoader'
import { RoadElements, TileType } from '@/core/types'
import { IsometricGrid } from '@/grid/IsometricGrid'



export class RoadManager {
  private grid: IsometricGrid
  protected roadTexture = AssetLoader.getTexture('road')
  protected roadTextureCount = { x: 6, y: 3 }
  protected roadTileSize = {
    width: this.roadTexture.width / this.roadTextureCount.x,
    height: this.roadTexture.height / this.roadTextureCount.y,
  }

  private readonly frames: Record<RoadElements, [number, number]> = {
    [RoadElements.HORIZONTAL]: [0, 0],
    [RoadElements.VERTICAL]: [1, 0],
    [RoadElements.CROSS]: [2, 0],
    [RoadElements.TOP_TURN]: [3, 0],
    [RoadElements.R_TOP_CROSS]: [4, 0],
    [RoadElements.V_R_TOP_END]: [5, 0],
    [RoadElements.H_R_BOTTOM_END]: [0, 1],
    [RoadElements.V_L_BOTTOM_END]: [1, 1],
    [RoadElements.L_BOTTOM_TURN]: [2, 1],
    [RoadElements.R_BOTTOM_TURN]: [3, 1],
    [RoadElements.L_B_CROSS]: [4, 1],
    [RoadElements.V_L_TOP_END]: [5, 1],
    [RoadElements.BOTTOM_TURN]: [3, 2],
    [RoadElements.L_T_CROSS]: [4, 2],
    [RoadElements.R_B_CROSS]: [5, 2],
    [RoadElements.NONE]: [0, 2],
  }

  constructor(grid: IsometricGrid) {
    this.grid = grid
  }

  private getRoadFrame(direction: RoadElements): PIXI.Rectangle {
    const [x, y] = this.frames[direction]
    return new PIXI.Rectangle(
      x * this.roadTileSize.width,
      y * this.roadTileSize.height,
      this.roadTileSize.width,
      this.roadTileSize.height
    )
  }

  private isRoad(x: number, y: number): boolean {
    const tile = this.grid.getTile(x, y)
    return tile?.getType() === TileType.ROAD
  }

  private getNeighbors(
    x: number,
    y: number
  ): { top: boolean; right: boolean; bottom: boolean; left: boolean } {
    return {
      top: this.isRoad(x, y - 1),
      right: this.isRoad(x + 1, y),
      bottom: this.isRoad(x, y + 1),
      left: this.isRoad(x - 1, y),
    }
  }

  private determineRoadDirection(neighbors: {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  }): RoadElements {
    const { top, right, bottom, left } = neighbors

    /**                 top
     *        (-1, 1) (0, -1) (1, -1)
     *  left  (-1, 0) (0, 0) (1, 0)   right
     *        (-1, 1) (0, 1) (1, 1)
     *                bottom
     */

    // Перевіряємо всі можливі комбінації з'єднань
    if (top && right && bottom && left) return RoadElements.CROSS
    if (top && right && bottom) return RoadElements.L_T_CROSS
    if (top && right && left) return RoadElements.L_B_CROSS
    if (right && bottom && left) return RoadElements.R_TOP_CROSS
    if (top && bottom && left) return RoadElements.R_B_CROSS

    if (top && bottom) return RoadElements.VERTICAL
    if (left && right) return RoadElements.HORIZONTAL

    if (top && right) return RoadElements.L_BOTTOM_TURN
    if (top && left) return RoadElements.BOTTOM_TURN
    if (bottom && right) return RoadElements.TOP_TURN
    if (bottom && left) return RoadElements.R_BOTTOM_TURN

    if (top) return RoadElements.V_L_BOTTOM_END
    if (right) return RoadElements.V_L_TOP_END
    if (bottom) return RoadElements.V_R_TOP_END
    if (left) return RoadElements.H_R_BOTTOM_END

    return RoadElements.V_R_TOP_END // Обираємо будь-який кінцевий фрейм дороги, як перший
  }

  private getRoadTexture(direction: RoadElements): PIXI.Texture {
    const frame = this.getRoadFrame(direction)
    return new PIXI.Texture({ source: this.roadTexture.baseTexture, frame })
  }

  public placeRoad(x: number, y: number): boolean {
    const tile = this.grid.getTile(x, y)
    if (tile?.isOccupiedTile()) {
      return false
    }

    const neighbors = this.getNeighbors(x, y)
    const direction = this.determineRoadDirection(neighbors)
    const roadTexture = this.getRoadTexture(direction)

    this.grid.addTile(x, y, TileType.ROAD, roadTexture)

    // Оновлюємо сусідні дороги
    this.updateNeighboringRoads(x, y)

    return true
  }

  private updateNeighboringRoads(x: number, y: number): void {
    const directions = [
      { dx: 0, dy: -1 }, // top
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: 1 }, // bottom
      { dx: -1, dy: 0 }, // left
    ]

    for (const dir of directions) {
      const newX = x + dir.dx
      const newY = y + dir.dy

      if (this.isRoad(newX, newY)) {
        const neighbors = this.getNeighbors(newX, newY)
        const direction = this.determineRoadDirection(neighbors)
        const roadTexture = this.getRoadTexture(direction)
        const tile = this.grid.getTile(newX, newY)
        if (tile) {
          tile.updateTexture(roadTexture)
        }
      }
    }
  }

  public removeRoad(x: number, y: number): boolean {
    const tile = this.grid.getTile(x, y)
    if (!tile || tile.getType() !== TileType.ROAD) {
      return false
    }

    // ! засунути метод в клас сітки
    // ! дорога не повинна знати про землю
    const groundTexture = PIXI.Assets.get('ground')
    this.grid.addTile(x, y, TileType.GROUND, groundTexture)

    this.updateNeighboringRoads(x, y)

    return true
  }
}

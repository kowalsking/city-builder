import { TileType } from '@/core/types'
import * as PIXI from 'pixi.js'

export class Tile extends PIXI.Container {
  private type: TileType
  private sprite: PIXI.Sprite
  private gridX: number
  private gridY: number
  private isOccupied: boolean = false

  constructor(
    type: TileType,
    texture: PIXI.Texture,
    gridX: number,
    gridY: number
  ) {
    super()
    this.type = type
    this.gridX = gridX
    this.gridY = gridY

    this.sprite = new PIXI.Sprite(texture)
    this.sprite.anchor.set(0.5, 0.5)

    this.addChild(this.sprite)
  }

  public setOccupied(occupied: boolean): void {
    this.isOccupied = occupied
    // Можливо, змінити вигляд тайлу при зайнятті
    this.sprite.tint = occupied ? 0x888888 : 0xffffff
  }

  public isOccupiedTile(): boolean {
    return this.isOccupied
  }

  public getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY }
  }

  public getType(): TileType {
    return this.type
  }

  // Метод для оновлення текстури (наприклад, для доріг при з'єднанні)
  public updateTexture(texture: PIXI.Texture): void {
    this.sprite.texture = texture
  }
}

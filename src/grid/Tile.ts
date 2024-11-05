import { Container, Sprite, Texture } from 'pixi.js'
import { TileType } from '@/core/types'

export class Tile extends Container {
  private type: TileType
  private sprite: Sprite
  private gridX: number
  private gridY: number
  private isOccupied: boolean = false

  constructor(
    type: TileType,
    texture: Texture,
    gridX: number,
    gridY: number
  ) {
    super()
    this.type = type
    this.gridX = gridX
    this.gridY = gridY

    this.sprite = new Sprite(texture)
    this.sprite.anchor.set(0.5)

    this.addChild(this.sprite)
  }

  public setOccupied(occupied: boolean): void {
    this.isOccupied = occupied
    // for debugging
    // this.sprite.tint = occupied ? 0x888888 : 0xffffff
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
  public updateTexture(texture: Texture): void {
    this.sprite.texture = texture
  }
}

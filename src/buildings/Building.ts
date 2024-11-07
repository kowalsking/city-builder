import { Container, Sprite, Texture } from 'pixi.js'
import GameConfig from '@/core/config'
import { BuildingType } from '@/core/types'
import { BuildingConfig, BUILDINGS_CONFIG } from '@/buildings/BuildingConfig'

export class Building extends Container {
  private type: BuildingType
  private sprite: Sprite
  private gridX: number
  private gridY: number
  private config: BuildingConfig
  private tileSize: { width: number; height: number }

  constructor(
    type: BuildingType,
    texture: Texture,
    gridX: number,
    gridY: number,
    tileSize: { width: number; height: number }
  ) {
    super()
    this.type = type
    this.gridX = gridX
    this.gridY = gridY
    this.config = BUILDINGS_CONFIG[type]
    this.tileSize = tileSize

    this.sprite = new Sprite(texture)
    this.sprite.anchor.set(0.5, 0.5)
    this.scaleSprite()
    this.addChild(this.sprite)
  }

  private scaleSprite(): void {
    // Розраховуємо бажаний розмір в пікселях
    // Для ізометричної проекції ширина будівлі дорівнює ширині тайла * кількість тайлів
    // Висота розраховується з урахуванням ізометричної проекції
    const targetWidth = this.config.width * this.tileSize.width
    const targetHeight = this.config.height * this.tileSize.height

    // Отримуємо поточні розміри текстури
    const currentWidth = this.sprite.texture.width
    const currentHeight = this.sprite.texture.height

    // Розраховуємо масштаб для обох вимірів
    const scaleX = targetWidth / currentWidth
    const scaleY = targetHeight / currentHeight

    // Додаткові налаштування для кожної будівлі
    switch (this.type) {
      case BuildingType.COALMINE:
        this.sprite.scale.set(scaleX * 2.5, scaleY * 2.5)
        break
      case BuildingType.BARRACKS:
        this.sprite.scale.set(scaleX * 2.3, scaleY * 3.3)
        this.sprite.y -= GameConfig.TILE_SIZE * 0.2
        this.sprite.x -= GameConfig.TILE_SIZE * 0.6
        break
      case BuildingType.SENAT:
        this.sprite.scale.set(scaleX * 2.2, scaleY * 3)
        this.sprite.x -= GameConfig.TILE_SIZE * 0.25
        this.sprite.y += GameConfig.TILE_SIZE
        break
    }
  }

  public getGridPosition(): { x: number; y: number } {
    return { x: this.gridX, y: this.gridY }
  }

  public getType(): BuildingType {
    return this.type
  }

  public getSize(): { width: number; height: number } {
    return {
      width: this.config.width,
      height: this.config.height,
    }
  }

  public getWorkerCount(): number {
    return this.config.workerCount || 0
  }
}

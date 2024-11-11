import { Graphics, Container, Assets } from 'pixi.js'
import { Building } from '@/buildings/Building'
import { BUILDINGS_CONFIG } from '@/buildings/BuildingConfig'
import { AssetLoader } from '@/core/AssetLoader'
import { BuildingType } from '@/core/types'
import { IsometricGrid } from '@/grid/IsometricGrid'
import GameConfig from '@/core/config'

export class BuildingManager {
  private grid: IsometricGrid
  private buildings: Building[] = []
  private highlights: Graphics[] = []
  private selectedBuildingType: BuildingType | null = null
  private previewBuilding: Container | null = null

  constructor(grid: IsometricGrid) {
    this.grid = grid
  }

  public canPlaceBuilding(
    type: BuildingType,
    gridX: number,
    gridY: number
  ): boolean {
    const config = BUILDINGS_CONFIG[type]

    // Перевіряємо всі клітинки, які займатиме будівля
    for (let y = gridY; y < gridY + config.height; y++) {
      for (let x = gridX; x < gridX + config.width; x++) {
        // Перевіряємо чи тайл в межах сітки
        if (!this.grid.isInBounds(x, y)) {
          return false
        }

        // Перевіряємо чи тайл не зайнятий
        const tile = this.grid.getTile(x, y)
        if (tile?.isOccupiedTile()) {
          return false
        }
      }
    }

    return true
  }

  // Встановлює тип будівлі для будівництва
  public selectBuildingType(type: BuildingType | null): void {
    this.selectedBuildingType = type
    this.updatePreview(null, null)
  }

  public updatePreview(gridX: number | null, gridY: number | null): void {
    // Видаляємо попередній preview і підсвічування
    this.removePreview()

    if (this.previewBuilding) {
      this.grid.removeChild(this.previewBuilding)
      this.previewBuilding = null
    }

    if (!this.selectedBuildingType || gridX === null || gridY === null) {
      return
    }

    const config = BUILDINGS_CONFIG[this.selectedBuildingType]
    const texture = Assets.get(config.texture)
    const preview = new Building(
      this.selectedBuildingType,
      texture,
      gridX,
      gridY,
      this.grid.getTileSize()
    )

    preview.alpha = 0.5
    const canPlace = this.canPlaceBuilding(
      this.selectedBuildingType,
      gridX,
      gridY
    )
    preview.tint = canPlace ? 0x00ff00 : 0xff0000

    const iso = this.grid.cartesianToIsometric(gridX, gridY)
    preview.position.set(iso.x, iso.y)
    preview.zIndex = this.grid.getPreviewZIndex()

    this.previewBuilding = preview
    this.grid.addChild(preview)

    if (GameConfig.debugMode) {
      // Показуємо зайняті клітинки при перегляді
      this.showOccupiedTiles(
        gridX,
        gridY,
        config.width,
        config.height,
        canPlace ? 0x00ff00 : 0xff0000
      )
    }
  }

  public placeBuilding(gridX: number, gridY: number): Building | null {
    if (
      !this.selectedBuildingType ||
      !this.canPlaceBuilding(this.selectedBuildingType, gridX, gridY)
    ) {
      return null
    }

    const config = BUILDINGS_CONFIG[this.selectedBuildingType]
    const texture = Assets.get(config.texture)
    const building = new Building(
      this.selectedBuildingType,
      texture,
      gridX,
      gridY,
      this.grid.getTileSize()
    )

    const iso = this.grid.cartesianToIsometric(gridX, gridY)
    building.position.set(iso.x, iso.y)
    building.zIndex = this.grid.getBuildingZIndex(gridX + config.width, gridY)

    // Позначаємо всі зайняті клітинки
    for (let y = gridY; y < gridY + config.height; y++) {
      for (let x = gridX; x < gridX + config.width; x++) {
        const tile = this.grid.getTile(x, y)
        if (tile) {
          tile.setOccupied(true)
        }
      }
    }

    this.removePreview()

    this.buildings.push(building)
    this.grid.addChild(building)

    return building
  }

  private showOccupiedTiles(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number = 0xff0000
  ): void {
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const tile = this.grid.getTile(x + dx, y + dy)
        if (tile) {
          const highlight = new Graphics()
          highlight.beginFill(color, 0.3)
          highlight.drawRect(
            -this.grid.getTileSize().width / 2,
            -this.grid.getTileSize().height / 2,
            this.grid.getTileSize().width,
            this.grid.getTileSize().height
          )
          highlight.endFill()

          const iso = this.grid.cartesianToIsometric(x + dx, y + dy)
          highlight.position.set(iso.x, iso.y)
          highlight.zIndex = this.grid.getPreviewZIndex() - 1

          this.highlights.push(highlight)
          this.grid.addChild(highlight)
        }
      }
    }
  }

  private removePreview(): void {
    this.highlights.forEach((hl) => {
      hl.destroy()
    })
    this.highlights = []
  }

  // Видаляє всі будівлі
  public removeAllBuildings(): void {
    for (const building of this.buildings) {
      // Пропускаємо першу будівлю (за умовами завдання)
      if (building === this.buildings[0]) continue
      this.grid.removeChild(building)

      // Відновлюємо початкові тайли
      const pos = building.getGridPosition()
      const size = building.getSize()

      for (let y = pos.y; y < pos.y + size.height; y++) {
        for (let x = pos.x; x < pos.x + size.width; x++) {
          const tile = this.grid.getTile(x, y)
          if (tile) {
            // Повертаємо початкову текстуру землі
            const groundTexture = AssetLoader.getTexture('ground')
            tile.updateTexture(groundTexture)
            tile.setOccupied(false)
          }
        }
      }
    }

    for (const highlight of this.highlights) {
      this.grid.removeChild(highlight)
    }

    this.highlights = []
    this.buildings.length = 1
  }
}

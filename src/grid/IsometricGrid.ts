import GameConfig from '@/core/config'
import { TileType } from '@/core/types'
import { Tile } from '@/grid/Tile'
import { AssetLoader } from '@/core/AssetLoader'
import { Container, Point, Texture } from 'pixi.js'

export class IsometricGrid extends Container {
  private readonly tileWidth: number = GameConfig.TILE_SIZE
  private readonly tileHeight: number = this.tileWidth / 2
  private readonly gridSize: number
  private tiles: (Tile | any)[][] // Матриця тайлів

  private static readonly BASE_TILE_Z_INDEX = 0
  private static readonly BUILDING_Z_INDEX = 1000
  private static readonly PREVIEW_Z_INDEX = 2000

  constructor(size: number) {
    super()
    this.gridSize = size

    // Ініціалізуємо матрицю тайлів
    this.tiles = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null))

    this.sortableChildren = true

    // Хардкодимо текстуру підлоги
    this.fillWithGround()
  }

  private fillWithGround() {
    for (let y = 0; y < this.getGridSize(); y++) {
      for (let x = 0; x < this.getGridSize(); x++) {
        this.addTile(x, y, TileType.GROUND, AssetLoader.getTexture('ground'))
      }
    }
  }

  // Метод для додавання тайлу на сітку
  public addTile(
    x: number,
    y: number,
    type: TileType,
    texture: Texture
  ): Tile | any {
    if (!this.isInBounds(x, y)) {
      return null
    }

    // Видаляємо старий тайл, якщо він є
    if (this.tiles[y][x]) {
      this.removeChild(this.tiles[y][x]!)
    }

    // Створюємо новий тайл
    const tile = new Tile(type, texture, x, y)

    // Конвертуємо координати сітки в ізометричні
    const iso = this.cartesianToIsometric(x, y)
    tile.position.set(iso.x, iso.y)

    // Встановлюємо z-index
    tile.zIndex = this.calculateTileZIndex(x, y)

    if (type === TileType.ROAD) {
      tile.setOccupied(true)
    }

    // Зберігаємо та відображаємо тайл
    this.tiles[y][x] = tile
    this.addChild(tile)

    return tile
  }

  // Отримання тайлу за координатами
  public getTile(x: number, y: number): Tile | null {
    if (!this.isInBounds(x, y)) {
      return null
    }
    return this.tiles[y][x]
  }

  // Видалення тайлу
  public removeTile(x: number, y: number): void {
    if (!this.isInBounds(x, y) || !this.tiles[y][x]) {
      return
    }

    this.removeChild(this.tiles[y][x]!)
    this.tiles[y][x] = null
  }

  public isometricToCartesian(
    isoX: number,
    isoY: number
  ): { x: number; y: number } {
    // Перетворюємо координати відносно центру тайлу
    const cartX = (2 * isoY + isoX) / (2 * this.tileWidth)
    const cartY = (2 * isoY - isoX) / (2 * this.tileWidth)

    return { x: Math.floor(cartX), y: Math.floor(cartY) }
  }

  // Оновлений метод картезіанських координат в ізометричні
  public cartesianToIsometric(
    cartX: number,
    cartY: number
  ): { x: number; y: number } {
    const isoX = (cartX - cartY) * this.tileWidth
    const isoY = (cartX + cartY) * this.tileHeight
    return { x: isoX, y: isoY }
  }

  public isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize
  }

  private calculateTileZIndex(x: number, y: number): number {
    return IsometricGrid.BASE_TILE_Z_INDEX + x + y
  }

  // Метод для отримання z-index для будівель
  public getBuildingZIndex(x: number, y: number): number {
    return IsometricGrid.BUILDING_Z_INDEX + x + y
  }

  // Метод для отримання z-index для preview
  public getPreviewZIndex(): number {
    return IsometricGrid.PREVIEW_Z_INDEX
  }

  public getTilePosition(
    screenX: number,
    screenY: number
  ): { x: number; y: number } | null {
    // Конвертуємо координати екрану в локальні координати сітки
    const localPos = this.toLocal(new Point(screenX, screenY))

    const { x, y } = this.isometricToCartesian(localPos.x, localPos.y)
    // Визначаємо координа клітинки у сітці
    const tileX = Math.max(0, Math.round(x))
    const tileY = Math.max(0, Math.round(y))

    if (this.isInBounds(tileX, tileY)) {
      return { x: tileX, y: tileY }
    }

    return null
  }

  public getRoadTiles() {
    const roadTiles = []
    // Знаходимо всі доступні дороги
    for (let y = 0; y < this.getGridSize(); y++) {
      for (let x = 0; x < this.getGridSize(); x++) {
        const tile = this.getTile(x, y)
        if (tile?.getType() === TileType.ROAD) {
          roadTiles.push({ x, y })
        }
      }
    }

    return roadTiles
  }

  public centerGrid(width: number, height: number) {
    const { x, y } = {
      x: width / 2,
      y: height / 2,
    }
    this.position.set(x, y)
  }

  public getGridSize(): number {
    return this.gridSize
  }

  public getTileSize(): { width: number; height: number } {
    return { width: this.tileWidth, height: this.tileHeight }
  }
}

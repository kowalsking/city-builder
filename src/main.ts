import GameConfig from '@/core/config'
import { BuildingManager } from '@/buildings/BuildingsManager'
import { AssetLoader } from '@/core/AssetLoader'
import { BuildingType, TileType } from '@/core/types'
import { IsometricGrid } from '@/grid/IsometricGrid'
import * as PIXI from 'pixi.js'
import { Ticker } from 'pixi.js'
import { RoadManager } from '@/grid/RoadManager'
import { WorkerManager } from '@/workers/WorkerManager'

class Game {
  protected app: PIXI.Application
  private grid!: IsometricGrid
  private buildingManager!: BuildingManager
  private workerManager!: WorkerManager
  private roadManager!: RoadManager
  private isRoadBuildingMode: boolean = false

  constructor() {
    this.app = new PIXI.Application()
    this.initGame()

    // Chrome DevTools
    // @ts-ignore
    globalThis.__PIXI_APP__ = this.app
  }

  protected async initGame(): Promise<void> {
    await this.app.init({
      background: GameConfig.BACKGROUND_COLOR,
      resizeTo: window,
      preference: 'webgl',
    })

    document
      .getElementById('game-container')!
      .appendChild(this.app.canvas as HTMLCanvasElement)

    await AssetLoader.loadAssets()

    // Створюємо сітку 10x10
    this.grid = new IsometricGrid(GameConfig.GRID_SIZE)

    // Заповнюємо сітку базовими тайлами землі
    for (let y = 0; y < this.grid.getGridSize(); y++) {
      for (let x = 0; x < this.grid.getGridSize(); x++) {
        // const isWater = x >= this.grid.getGridSize() / 2;
        this.grid.addTile(
          x,
          y,
          TileType.GROUND,
          AssetLoader.getTexture('ground')
        )
      }
    }

    this.buildingManager = new BuildingManager(this.grid)

    // Додаємо сітку до сцени
    this.app.stage.addChild(this.grid)

    // Центруємо сітку на екрані
    this.centerGrid()

    // Створюємо менеджер доріг (підставте правильні розміри фреймів)
    this.roadManager = new RoadManager(this.grid)

    this.workerManager = new WorkerManager(this.grid)

    // this.workerManager.addWorker()

    this.setupInteraction()
    this.setupUI()

    window.addEventListener('resize', this.resize.bind(this))
    this.resize()

    this.app.ticker.add(this.update.bind(this))
  }

  // ! закинуть в клас сітки
  private centerGrid(): void {
    // Центруємо сітку на екрані
    const screenCenter = {
      x: this.app.screen.width / 2,
      y: this.app.screen.height / 2,
    }

    this.grid.position.set(screenCenter.x, screenCenter.y - 200) // Зміщуємо трохи вгору
  }

  private setupInteraction(): void {
    this.app.stage.eventMode = 'dynamic'

    // Додаємо відображення поточних координат для відладки
    const debugText = document.createElement('div')
    debugText.style.position = 'fixed'
    debugText.style.top = '50px'
    debugText.style.right = '10px'
    debugText.style.backgroundColor = 'white'
    debugText.style.padding = '5px'
    document.body.appendChild(debugText)

    // Обробка руху миші для превью та відладки
    this.app.stage.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      const tilePos = this.grid.getTilePosition(event.global.x, event.global.y)

      // Оновлюємо відладочну інформацію
      debugText.textContent = `Mouse: ${Math.floor(
        event.global.x
      )},${Math.floor(event.global.y)} Tile: ${
        tilePos ? `${tilePos.x},${tilePos.y}` : 'none'
      }`

      this.buildingManager.updatePreview(
        tilePos ? tilePos.x : null,
        tilePos ? tilePos.y : null
      )
    })

    // Обробка кліку для розміщення будівлі
    this.app.stage.on('pointertap', (event: PIXI.FederatedPointerEvent) => {
      const tilePos = this.grid.getTilePosition(event.global.x, event.global.y)
      if (!tilePos) return
      if (this.isRoadBuildingMode) {
        this.roadManager.placeRoad(tilePos.x, tilePos.y)
        // this.road.placeRoad(tilePos.x, tilePos.y, this.grid)
      } else {
        // Логіка будівництва будівель
        const building = this.buildingManager.placeBuilding(
          tilePos.x,
          tilePos.y
        )
        if (building?.getType() === BuildingType.BARRACKS) {
          // Знаходимо найближчу дорогу для спавну робітника
          const spawnPoint = this.findNearestRoad(tilePos.x, tilePos.y)
          if (spawnPoint) {
            const worker = this.workerManager.addWorker(
              spawnPoint.x,
              spawnPoint.y
            )
          }
        }
      }
    })

    let isDragging = false
    this.app.stage.on('pointerdown', () => (isDragging = true))
    this.app.stage.on('pointerup', () => (isDragging = false))
    this.app.stage.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      if (isDragging && this.isRoadBuildingMode) {
        const tilePos = this.grid.getTilePosition(
          event.global.x,
          event.global.y
        )
        if (tilePos) {
          this.roadManager.placeRoad(tilePos.x, tilePos.y)
          // this.road.placeRoad(tilePos.x, tilePos.y, this.grid)
        }
      }
    })
  }

  // ! в клас сітки
  private findNearestRoad(
    x: number,
    y: number
  ): { x: number; y: number } | null {
    // Пошук найближчої дороги по спіралі
    const maxRadius = Math.max(this.grid.getGridSize(), this.grid.getGridSize())
    for (let r = 1; r <= maxRadius; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const newX = x + dx
          const newY = y + dy
          const tile = this.grid.getTile(newX, newY)
          if (tile?.getType() === TileType.ROAD) {
            return { x: newX, y: newY }
          }
        }
      }
    }
    return null
  }

  private setupUI(): void {
    // Створюємо кнопки для вибору типу будівлі
    const buttonContainer = document.createElement('div')
    buttonContainer.style.position = 'fixed'
    buttonContainer.style.top = '10px'
    buttonContainer.style.left = '10px'

    const createButton = (type: BuildingType, label: string) => {
      const button = document.createElement('button')
      button.textContent = label
      button.onclick = () => this.buildingManager.selectBuildingType(type)
      buttonContainer.appendChild(button)
    }

    createButton(BuildingType.COALMINE, 'Build Coalmine')
    createButton(BuildingType.BARRACKS, 'Build Barracks')
    createButton(BuildingType.SENAT, 'Build Senat')

    // Кнопка скидання
    const resetButton = document.createElement('button')
    resetButton.textContent = 'Reset'
    resetButton.onclick = () => this.buildingManager.removeAllBuildings()
    buttonContainer.appendChild(resetButton)

    document.body.appendChild(buttonContainer)

    // Додаємо кнопку будівництва доріг
    const roadButton = document.createElement('button')
    roadButton.textContent = 'Build Road'
    roadButton.onclick = () => {
      this.isRoadBuildingMode = !this.isRoadBuildingMode
      roadButton.style.backgroundColor = this.isRoadBuildingMode
        ? '#88ff88'
        : ''
      // Вимикаємо режим будівництва будівель при включенні режиму доріг
      if (this.isRoadBuildingMode) {
        this.buildingManager.selectBuildingType(null)
      }
    }
    buttonContainer.appendChild(roadButton)

    document.body.appendChild(buttonContainer)
  }

  private resize(): void {
    const parent = this.app.canvas.parentNode as HTMLElement
    this.app.renderer.resize(parent.clientWidth, parent.clientHeight)
    if (this.grid) {
      this.centerGrid()
    }
  }

  private update({ deltaTime }: Ticker): void {
    this.workerManager.update(deltaTime)
  }
}

// Start the game when the window loads
document.addEventListener('DOMContentLoaded', () => {
  new Game()
})

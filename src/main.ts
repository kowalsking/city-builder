import { Application, FederatedPointerEvent, Ticker } from 'pixi.js'
import GameConfig from '@/core/config'
import { BuildingManager } from '@/buildings/BuildingsManager'
import { AssetLoader } from '@/core/AssetLoader'
import { IsometricGrid } from '@/grid/IsometricGrid'
import { RoadManager } from '@/grid/RoadManager'
import { WorkerManager } from '@/workers/WorkerManager'
import { GameUI } from '@/ui/gameUI'
import { BuildingType } from '@/core/types'

export class Game {
  private app: Application
  public grid!: IsometricGrid
  public buildingManager!: BuildingManager
  public workerManager!: WorkerManager
  public roadManager!: RoadManager
  private gameUI!: GameUI

  constructor() {
    this.app = new Application()
    this.initGame()

    // Chrome DevTools
    // @ts-ignore
    globalThis.__PIXI_APP__ = this.app
  }

  private async initGame(): Promise<void> {
    await this.app.init({
      background: GameConfig.BACKGROUND_COLOR,
      resizeTo: window,
      preference: 'webgl',
    })

    document
      .getElementById('game-container')!
      .appendChild(this.app.canvas as HTMLCanvasElement)

    await AssetLoader.loadAssets()

    // Менеджер сітки
    this.grid = new IsometricGrid(GameConfig.GRID_SIZE)

    // Менеджер будівель
    this.buildingManager = new BuildingManager(this.grid)

    // Менеджер доріг
    this.roadManager = new RoadManager(this.grid)

    // Менеджер робітників
    this.workerManager = new WorkerManager(this.grid)

    // Менеджер UI
    this.gameUI = new GameUI(this)

    // Позиціонуємо UI
    this.gameUI.position.set(10, 30)

    this.app.stage.addChild(this.grid, this.gameUI)

    // Підписуємся на події
    this.addEventListeners()

    this.resize()

    this.createFirstCitizen()

    this.app.ticker.add(this.update.bind(this))


    if (this.isMobile()) {
      this.app.stage.scale.set(0.5)
    }
  }

  private createFirstCitizen() {
    for (const [x, y] of GameConfig.UNTOUCHABLE_ROAD) {
      this.roadManager.placeRoad(x, y)
    }

    this.buildingManager.selectBuildingType(BuildingType.BARRACKS)
    this.buildingManager.placeBuilding(0, 0)
    this.workerManager.addWorker(0, 3)
    this.buildingManager.selectBuildingType(null)
  }

  private addEventListeners(): void {
    window.addEventListener('resize', this.resize.bind(this))

    this.app.stage.eventMode = 'dynamic'

    this.app.stage.on('pointermove', (event: FederatedPointerEvent) => {
      this.gameUI.onPointerMove(event)
    })
    this.app.stage.on('pointertap', (event: FederatedPointerEvent) => {
      this.gameUI.onPointerTap(event)
    })
    this.app.stage.on('pointerdown', () => {
      this.gameUI.onPointerDown()
    })
    this.app.stage.on('pointerup', () => {
      this.gameUI.onPointerUp()
    })
  }

  private resize(): void {
    const parent = this.app.canvas.parentNode as HTMLElement
    this.app.renderer.resize(parent.clientWidth, parent.clientHeight)
    this?.grid.centerGrid(this.app.screen.width * (this.isMobile() ? 2 : 1), this.app.screen.height)
  }

  private isMobile = (): boolean => {
    // Перевіряємо userAgent
    const userAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    // Перевіряємо тип сенсорного введення
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Перевіряємо розмір екрану
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    
    return userAgent || (hasTouch && isSmallScreen);
  };

  private update({ deltaTime }: Ticker): void {
    this.workerManager.update(deltaTime)
  }
}

// Start the game when the window loads
document.addEventListener('DOMContentLoaded', () => {
  new Game()
})

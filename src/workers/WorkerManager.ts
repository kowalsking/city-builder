import { IsometricGrid } from '@/grid/IsometricGrid'
import { Texture } from 'pixi.js'
import { Worker } from '@/workers/Worker'
import { AssetLoader } from '@/core/AssetLoader'
import { AStar } from '@/core/pathfinding/AStar'
import { TileType } from '@/core/types'

export class WorkerManager {
  private workers: Worker[] = []
  private pathfinder: AStar
  private grid: IsometricGrid

  constructor(grid: IsometricGrid) {
    this.grid = grid
    this.pathfinder = new AStar(grid)
  }

  public addWorker(
    startX: number,
    startY: number
  ): Worker {
    const worker = new Worker(AssetLoader.getTexture('worker').textures)

    // Встановлюємо початкову позицію
    const isoPos = this.grid.cartesianToIsometric(startX, startY)
    worker.position.set(isoPos.x, isoPos.y)

    // Встановлюємо правильний z-index
    worker.zIndex = this.grid.getBuildingZIndex(startX, startY) + 1

    this.workers.push(worker)
    this.grid.addChild(worker)

    // Запускаємо циклічний рух
    this.startPatrolling(worker, startX, startY)

    return worker
  }

  private async startPatrolling(
    worker: Worker,
    startX: number,
    startY: number
  ): Promise<void> {
    // Знаходимо всі доступні дороги
    const roadTiles: Array<{ x: number; y: number }> = []
    for (let y = 0; y < this.grid.getGridSize(); y++) {
      for (let x = 0; x < this.grid.getGridSize(); x++) {
        const tile = this.grid.getTile(x, y)
        if (tile?.getType() === TileType.ROAD) {
          roadTiles.push({ x, y })
        }
      }
    }

    console.log('this.roadTiles', roadTiles)

    while (true) {
      // Вибираємо випадкову точку призначення з доріг
      const target = roadTiles[Math.floor(Math.random() * roadTiles.length)]

      // Знаходимо шлях
      const path = this.pathfinder.findPath(startX, startY, target.x, target.y)

      if (path.length > 0) {
        // Встановлюємо шлях для робітника
        worker.setPath(path)

        // Чекаємо поки робітник дійде до цілі
        await this.waitForPathCompletion(worker)

        // Оновлюємо початкову позицію
        startX = target.x
        startY = target.y
      }

      // Невелика пауза між маршрутами
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  private waitForPathCompletion(worker: Worker): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!worker.isMoving()) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)
    })
  }

  public update(delta: number): void {
    this.workers.forEach((worker) => {
      worker.update(delta)

      // Оновлюємо z-index на основі поточної позиції
      const cartPos = this.grid.isometricToCartesian(
        worker.position.x,
        worker.position.y
      )
      worker.zIndex =
        this.grid.getBuildingZIndex(
          Math.floor(cartPos.x),
          Math.floor(cartPos.y)
        ) + 1
    })
  }

  public removeAllWorkers(): void {
    this.workers.forEach((worker) => {
      this.grid.removeChild(worker)
    })
    this.workers = []
  }
}

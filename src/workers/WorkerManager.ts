import { IsometricGrid } from '@/grid/IsometricGrid'
import { Worker } from '@/workers/Worker'
import { AStar } from '@/core/pathfinding/AStar'

export class WorkerManager {
  private workers: Worker[] = []
  private pathfinder: AStar
  private grid: IsometricGrid
  private roadTiles: Array<{ x: number; y: number }> = []

  constructor(grid: IsometricGrid) {
    this.grid = grid
    this.pathfinder = new AStar(grid)
  }

  public addWorker(startX: number, startY: number): Worker {
    const worker = new Worker()

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
    this.roadTiles = this.grid.getRoadTiles()

    while (true) {
      // Вибираємо випадкову точку призначення з доріг
      const target =
        this.roadTiles[Math.floor(Math.random() * this.roadTiles.length)]

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
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }

  private waitForPathCompletion(worker: Worker): Promise<void> {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!worker.isMoving()) {
          // Поки ми ходити, могли побудуватись нові дороги, тому оновлюємо цей список перед кожним маршрутом
          this.roadTiles = this.grid.getRoadTiles()
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
    this.workers.forEach((worker, idx) => {
      if (idx === 0) return
      this.grid.removeChild(worker)
    })
    this.workers.length = 1
  }
}

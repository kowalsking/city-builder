import { AnimatedSprite, Container, Texture } from 'pixi.js'
import GameConfig from '@/core/config'
import { WorkerState, WorkerDirection } from '@/core/types'
import { AssetLoader } from '@/core/AssetLoader'

export class Worker extends Container {
  private animation: AnimatedSprite
  private currentState: WorkerState = WorkerState.IDLE
  private currentDirection: WorkerDirection = WorkerDirection.DOWN
  private animations: Map<string, Texture[]> = new Map()
  private path: Array<{ x: number; y: number }> = []
  private currentPathIndex: number = 0
  private speed: number = 1
  private animationSpeed: number = 0.2
  private isMovingFlag: boolean = false

  constructor() {
    super()
    // Хардкодимо текстури робітника
    // Хоча краще прокидувати текстури з батьківських класів
    this.setupAnimations(AssetLoader.getTexture('worker').textures)
    const defaultAnimation = this.animations.get('idle_down') || []
    this.animation = new AnimatedSprite(defaultAnimation)
    this.animation.anchor.set(0.5, 1.2)
    this.animation.y = GameConfig.TILE_SIZE / 2
    this.addChild(this.animation)
    this.setState(WorkerState.IDLE, WorkerDirection.DOWN)
  }

  private setupAnimations(textures: Record<string, Texture>): void {
    // Розділяємо текстури по анімаціях
    const frameMap: Record<string, Texture[]> = {
      idle_down: [],
      walk_down: [],
      walk_up: [],
    }

    // Визначаємо, до якої анімації належить текстура
    Object.keys(textures).forEach((name) => {
      Object.keys(frameMap).forEach((key) => {
        if (name.includes(key)) {
          frameMap[key].push(textures[name])
        }
      })
    })

    // Сортуємо фрейми за іменем для правильного порядку
    Object.entries(frameMap).forEach(([key, frames]) => {
      frames.sort((a: Texture, b: Texture) => {
        const aName = a.label as string
        const bName = b.label as string
        return aName!.localeCompare(bName)
      })
      this.animations.set(key, frames)
    })
  }

  public setState(state: WorkerState, direction: WorkerDirection): void {
    const animationKey =
      state === WorkerState.IDLE
        ? 'idle_down'
        : `${state}_${direction.toLowerCase()}`
    const frames = this.animations.get(animationKey)
    if (
      frames?.length &&
      (this.currentState !== state || this.currentDirection !== direction)
    ) {
      this.currentState = state
      this.currentDirection = direction
      this.animation.textures = frames

      this.animation.animationSpeed = this.animationSpeed
      this.animation.play()
      this.isMovingFlag = state === WorkerState.WALKING
    }
  }

  public setPath(path: Array<{ x: number; y: number }>): void {
    this.path = path
    this.currentPathIndex = 0
    if (path.length > 0) {
      this.setState(WorkerState.WALKING, this.getDirectionToNextPoint())
    }
  }

  private getDirectionToNextPoint(): WorkerDirection {
    if (this.currentPathIndex >= this.path.length - 1)
      return this.currentDirection

    const current = this.path[this.currentPathIndex]
    const next = this.path[this.currentPathIndex + 1]

    // В ізометричній проекції визначаємо напрямок
    const dx = next.x - current.x
    const dy = next.y - current.y

    // Визначаємо напрямок руху
    if (dy === -1 && dx === 0) {
      // right top
      this.scale.x = 1 // Змінюємо поворот анімації в залежності від напрямку
      return WorkerDirection.UP
    } else if (dy === 1 && dx === 0) {
      // left down
      this.scale.x = 1
      return WorkerDirection.DOWN
    } else if (dy === 0 && dx === 1) {
      // right down
      this.scale.x = -1
      return WorkerDirection.DOWN
    } else {
      // (dy === 0 && dx === -1) left top
      this.scale.x = -1
      return WorkerDirection.UP
    }
  }

  public update(delta: number): void {
    if (this.path.length === 0 || this.currentPathIndex >= this.path.length) {
      if (this.currentState !== WorkerState.IDLE) {
        this.setState(WorkerState.IDLE, this.currentDirection)
      }
      return
    }

    const targetPoint = this.path[this.currentPathIndex]
    const iso = this.cartesianToIsometric(targetPoint.x, targetPoint.y)

    // Розраховуємо відстань до цільової точки
    const dx = iso.x * 2 - this.position.x
    const dy = iso.y * 2 - this.position.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < this.speed) {
      this.currentPathIndex++
      if (this.currentPathIndex < this.path.length) {
        this.setState(WorkerState.WALKING, this.getDirectionToNextPoint())
      }
    } else {
      // Рухаємося до точки
      const vx = (dx / distance) * this.speed
      const vy = (dy / distance) * this.speed

      this.position.x += vx * delta
      this.position.y += vy * delta
    }
  }

  private cartesianToIsometric(x: number, y: number): { x: number; y: number } {
    return {
      x: ((x - y) * GameConfig.TILE_SIZE) / 2,
      y: ((x + y) * GameConfig.TILE_SIZE) / 4,
    }
  }

  public isMoving(): boolean {
    return this.isMovingFlag
  }
}

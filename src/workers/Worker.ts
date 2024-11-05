import { AnimatedSprite, Container, Texture } from 'pixi.js'
import GameConfig from '@/core/config'
import { WorkerState, WorkerDirection } from '@/core/types'

export class Worker extends Container {
  private sprite: AnimatedSprite
  private currentState: WorkerState = WorkerState.IDLE
  private currentDirection: WorkerDirection = WorkerDirection.DOWN
  private animations: Map<string, Texture[]> = new Map()
  private path: Array<{ x: number; y: number }> = []
  private currentPathIndex: number = 0
  private speed: number = 1
  private isMovingFlag: boolean = false

  constructor(textures: Record<string, Texture>) {
    super()
    this.setupAnimations(textures)
    const defaultAnimation = this.animations.get('idle_down') || []
    this.sprite = new AnimatedSprite(defaultAnimation)
    this.sprite.anchor.set(0.5, 0.5)
    this.sprite.y = 32
    this.addChild(this.sprite)
    this.setState(WorkerState.IDLE, WorkerDirection.DOWN)
  }

  private setupAnimations(textures: Record<string, Texture>): void {
    // Розділяємо текстури по анімаціях
    const frameMap: Record<string, Texture[]> = {
      idle_down: [],
      walk_down: [],
      walk_up: [],
      wave_down: [],
    }

    Object.keys(textures).forEach((name) => {
      // Визначаємо, до якої анімації належить текстура
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
    const animationKey = `${state}_${direction.toLowerCase()}`
    const frames = this.animations.get(animationKey)

    if (
      frames?.length &&
      (this.currentState !== state || this.currentDirection !== direction)
    ) {
      this.currentState = state
      this.currentDirection = direction
      this.sprite.textures = frames

      // Налаштовуємо швидкість анімації
      this.sprite.animationSpeed = 0.2

      if (state === WorkerState.IDLE) {
        this.sprite.play()
        this.isMovingFlag = false
      } else if (state === WorkerState.WALKING) {
        this.sprite.play()
        this.isMovingFlag = true
      } else if (state === WorkerState.WAVING) {
        this.sprite.loop = false
        this.sprite.play()
        this.isMovingFlag = false
        this.sprite.onComplete = () => {
          this.setState(WorkerState.IDLE, direction)
        }
      }
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

    // Визначаємо напрямок на основі переважаючого руху
    if (Math.abs(dy) > Math.abs(dx)) {
      return dy < 0 ? WorkerDirection.UP : WorkerDirection.DOWN
    } else {
      return WorkerDirection.DOWN // Для бокового руху використовуємо DOWN
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
    const dx = iso.x - this.position.x
    const dy = iso.y - this.position.y
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

  public wave(): void {
    this.setState(WorkerState.WAVING, WorkerDirection.DOWN)
  }
}

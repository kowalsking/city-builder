import * as PIXI from 'pixi.js'

export class Button extends PIXI.Container {
  private sprite: PIXI.Sprite
  private buttonLabel: PIXI.Text
  private isPressed: boolean = false

  constructor(
    texture: PIXI.Texture,
    text: string,
    private onClick: () => void
  ) {
    super()

    // Створюємо спрайт кнопки
    this.sprite = new PIXI.Sprite(texture)
    this.sprite.anchor.set(0.5)

    this.label = text
    // Створюємо текст
    this.buttonLabel = new PIXI.Text(text, {
      fontFamily: 'Arial',
      fontSize: 22,
      fill: 0xffffff,
      align: 'center',
    })
    this.buttonLabel.anchor.set(0.5)
    this.buttonLabel.y = 40

    // Додаємо до контейнера
    this.addChild(this.sprite, this.buttonLabel)

    // Налаштовуємо інтерактивність
    this.eventMode = 'static'
    // this.interactive = true
    this.cursor = 'pointer'

    // Додаємо обробники подій
    this.on('pointerdown', this.onButtonDown, this)
    this.on('pointerup', this.onButtonUp, this)
    this.on('pointerupoutside', this.onButtonUp, this)
  }

  private onButtonDown(e: PIXI.FederatedPointerEvent): void {
    e.stopPropagation() // don't work
    this.onClick()

    this.isPressed = true
  }

  private onButtonUp(): void {
    this.isPressed = !this.isPressed
  }

  public setSpriteWidth(width: number): void {
    this.sprite.width = width
  }

  public getSpriteWidth(): number {
    return this.sprite.width
  }
  public setSpriteHeight(height: number): void {
    this.sprite.height = height
  }

  public getSpriteHeight(): number {
    return this.sprite.height
  }

  public setEnabled(enabled: boolean): void {
    this.sprite.alpha = enabled ? 1 : 0.5
  }
}

import * as PIXI from 'pixi.js'
import { Ticker } from 'pixi.js'

class Game {
  protected app: PIXI.Application

  constructor() {
    this.app = new PIXI.Application()
    this.initGame()
  }

  protected async initGame(): Promise<void> {
    await this.app.init({
      background: '#1099bb',
      resizeTo: window,
      preference: 'webgl',
    })

    document
      .getElementById('game-container')!
      .appendChild(this.app.canvas as HTMLCanvasElement)

    window.addEventListener('resize', this.resize.bind(this))
    this.resize()

    this.app.ticker.add(this.update.bind(this))
  }

  private resize(): void {
    const parent = this.app.canvas.parentNode as HTMLElement
    this.app.renderer.resize(parent.clientWidth, parent.clientHeight)
  }

  private update(ticker: Ticker): void {
    //
  }
}

// Start the game when the window loads
document.addEventListener('DOMContentLoaded', () => {
  new Game()
})

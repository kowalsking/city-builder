import GameConfig from '@/core/config'
import { Assets } from 'pixi.js'

export class AssetLoader {
  public static async loadAssets(): Promise<void> {
    try {
      await Assets.load([
        {
          alias: 'ground',
          src: `/assets/${GameConfig.debugMode ? 'floor' : 'granite'}.png`,
        },
        { alias: 'coalmine', src: '/assets/coalmine_2.png' },
        { alias: 'barracks', src: '/assets/barracks_2.png' },
        { alias: 'senat', src: '/assets/senat.png' },
        { alias: 'road', src: '/assets/road1.png' },
        { alias: 'roadButton', src: '/assets/road_button.png' },
        { alias: 'worker', src: '/assets/man2.json' },
        { alias: 'reset', src: '/assets/reset.png' },
      ])
    } catch (error) {
      console.error('Failed to load assets:', error)
      throw error
    }
  }

  public static getTexture(name: string): any {
    const texture = Assets.cache.get(name)
    if (!texture) {
      throw new Error(`Texture ${name} not found!`)
    }
    return texture
  }
}

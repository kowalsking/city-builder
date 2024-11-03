import * as PIXI from 'pixi.js'

export class AssetLoader {
  public static async loadAssets(): Promise<void> {
    try {
      await PIXI.Assets.load([
        // Базові тайли
        { alias: 'ground', src: '/assets/floor.png' },
        { alias: 'coalmine', src: '/assets/coalmine_2.png' },
        { alias: 'barracks', src: '/assets/barracks_2.png' },
        { alias: 'senat', src: '/assets/senat.png' },
        { alias: 'road', src: '/assets/road1.png' },
      ])
    } catch (error) {
      console.error('Failed to load assets:', error)
      throw error
    }
  }

  public static getTexture(name: string): PIXI.Texture {
    const texture = PIXI.Assets.cache.get(name)
    if (!texture) {
      throw new Error(`Texture ${name} not found!`)
    }
    return texture
  }
}

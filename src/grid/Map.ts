import { AssetLoader } from '@/core/AssetLoader'
import { Container, Point, Sprite, Texture } from 'pixi.js'

export class Map extends Container {
  protected TILE_SIZE = 64
  protected levelData = [
    [1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1],
  ]

  constructor() {
    super()

    for (let i = 0; i < this.levelData.length; i++) {
      for (let j = 0; j < this.levelData[i].length; j++) {
        // const { x, y } = this.cartesianToIsometric({ x: j * this.TILE_SIZE, y: i * this.TILE_SIZE })

        const isWater = this.levelData[i][j] === 1
        // const granite = AssetLoader.getTexture('granite')
        // const floor = AssetLoader.getTexture('floor')
        // const block = AssetLoader.getTexture('block')
        // const tileType = new Sprite(isWater ? block : floor)
        // tileType.anchor.set(0.5)
        // tileType.position.set(x, y)
        // tileType.width = this.TILE_SIZE
        // tileType.height = this.TILE_SIZE
        // tileType.angle = 45

        // this.addChild(tileType)
      }
    }
  }

  getTileCoordinates(cartPt: any, tileHeight: any) {
    var tempPt = new Point()
    tempPt.x = Math.floor(cartPt.x / tileHeight)
    tempPt.y = Math.floor(cartPt.y / tileHeight)
    return tempPt
  }

  cartesianToIsometric(cartPt: any) {
    var tempPt = new Point()
    tempPt.x = cartPt.x - cartPt.y
    tempPt.y = (cartPt.x + cartPt.y) / 2
    return tempPt
  }

  isometricToCartesian(isoPt: any) {
    var tempPt = new Point()
    tempPt.x = (2 * isoPt.y + isoPt.x) / 2
    tempPt.y = (2 * isoPt.y - isoPt.x) / 2
    return tempPt
  }
}

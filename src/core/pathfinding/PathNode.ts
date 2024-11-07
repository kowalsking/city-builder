import { Tile } from '@/grid/Tile'
export class PathNode {
  public f: number = 0 // Повна вартість (g + h)
  public g: number = 0 // Вартість від старту
  public h: number = 0 // Евристична оцінка до цілі
  public parent: PathNode | null = null
  public neighbors: Tile[] = []

  constructor(public x: number, public y: number) {
    this.x = x
    this.y = y
  }

  // Чи знаходиться нода у якомусь списку
  public isInList(list: this[]) {
    return list.find((node) => {
      return node.x === this.x && node.y === this.y
    })
  }
}

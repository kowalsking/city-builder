import { PathNode } from '@/core/pathfinding/PathNode'
import { TileType } from '@/core/types'
import { IsometricGrid } from '@/grid/IsometricGrid'

export class AStar {
  constructor(private grid: IsometricGrid) {}

  public findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): Array<{ x: number; y: number }> {
    const openList: PathNode[] = []
    const closedList: PathNode[] = []
    const startNode = new PathNode(startX, startY)
    const endNode = new PathNode(endX, endY)

    openList.push(startNode)

    while (openList.length > 0) {
      // Знаходимо вузол з найменшою оцінкою f
      let currentNode = openList[0]
      let currentIndex = 0

      openList.forEach((node, index) => {
        if (node.f < currentNode.f) {
          currentNode = node
          currentIndex = index
        }
      })

      // Перемістити поточний вузол з відкритого списку в закритий
      openList.splice(currentIndex, 1)
      closedList.push(currentNode)

      // Знайшли кінцеву точку
      if (currentNode.x === endNode.x && currentNode.y === endNode.y) {
        const path: Array<{ x: number; y: number }> = []
        let current = currentNode
        while (current) {
          path.push({ x: current.x, y: current.y })
          current = current.parent!
        }
        return path.reverse()
      }

      // Генеруємо сусідів
      const neighbors: PathNode[] = []
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const newX = currentNode.x + dx
        const newY = currentNode.y + dy

        // Перевіряємо чи можна ходити по цьому тайлу
        if (!this.isWalkable(newX, newY)) continue

        neighbors.push(new PathNode(newX, newY))
      }

      for (const neighbor of neighbors) {
        // Пропускаємо якщо вузол вже в закритому списку
        if (
          closedList.find(
            (node) => node.x === neighbor.x && node.y === neighbor.y
          )
        ) {
          continue
        }

        neighbor.g = currentNode.g + 1
        neighbor.h = this.heuristic(neighbor, endNode)
        neighbor.f = neighbor.g + neighbor.h
        neighbor.parent = currentNode

        // Додаємо до відкритого списку якщо ще не там
        if (
          !openList.find(
            (node) => node.x === neighbor.x && node.y === neighbor.y
          )
        ) {
          openList.push(neighbor)
        }
      }
    }

    return [] // Шлях не знайдено
  }

  private isWalkable(x: number, y: number): boolean {
    const tile = this.grid.getTile(x, y)
    return tile?.getType() === TileType.ROAD
  }

  private heuristic(a: PathNode, b: PathNode): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }
}

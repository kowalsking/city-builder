export class PathNode {
  public f: number = 0;  // Повна вартість (g + h)
  public g: number = 0;  // Вартість від старту
  public h: number = 0;  // Евристична оцінка до цілі
  public parent: PathNode | null = null;
  
  constructor(
      public x: number,
      public y: number,
  ) {}
}
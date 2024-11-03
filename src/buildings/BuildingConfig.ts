import { BuildingType } from '@/core/types'

export interface BuildingConfig {
  type: BuildingType
  width: number
  height: number
  texture: string
  workerCount?: number // Кількість робітників, які додаються при будівництві казарм
}

export const BUILDINGS_CONFIG: Record<BuildingType, BuildingConfig> = {
  [BuildingType.COALMINE]: {
    type: BuildingType.COALMINE,
    width: 2,
    height: 2,
    texture: 'coalmine',
  },
  [BuildingType.BARRACKS]: {
    type: BuildingType.BARRACKS,
    width: 3,
    height: 3,
    texture: 'barracks',
    workerCount: 1,
  },
  [BuildingType.SENAT]: {
    type: BuildingType.SENAT,
    width: 6,
    height: 6,
    texture: 'senat',
  },
}

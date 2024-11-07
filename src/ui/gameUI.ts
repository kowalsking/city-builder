import * as PIXI from 'pixi.js'
import { ButtonConfig, ButtonNames } from '@/core/types'
import { AssetLoader } from '@/core/AssetLoader'
import { BuildingType } from '@/core/types'
import { Game } from '@/main'
import { Button } from '@/ui/Button'

export class GameUI extends PIXI.Container {
  private buttons: Map<string, Button> = new Map()
  private selectedButton: Button | null = null
  private scene: Game
  private isDragging: boolean = false

  constructor(scene: Game) {
    super()
    this.scene = scene
    this.setup()
  }

  private async setup(): Promise<void> {
    // Створюємо кнопки будівництва
    const buttonsConfig: ButtonConfig[] = [
      {
        id: ButtonNames.COALMINE,
        name: ButtonNames.COALMINE,
        type: BuildingType.COALMINE,
        texture: 'coalmine',
      },
      {
        id: ButtonNames.BARRACKS,
        name: ButtonNames.BARRACKS,
        type: BuildingType.BARRACKS,
        texture: 'barracks',
      },
      {
        id: ButtonNames.SENAT,
        name: ButtonNames.SENAT,
        type: BuildingType.SENAT,
        texture: 'senat',
      },
      {
        id: ButtonNames.ROAD,
        name: ButtonNames.ROAD,
        type: ButtonNames.ROAD,
        texture: 'roadButton',
      },
      {
        id: ButtonNames.RESET,
        name: ButtonNames.RESET,
        type: ButtonNames.RESET,
        texture: 'reset',
      },
    ]

    buttonsConfig.forEach(({ id, name, texture, type }, idx: number) => {
      const buttonTexture = AssetLoader.getTexture(texture)
      const button = new Button(buttonTexture, name, () => {
        switch (type) {
          case BuildingType.COALMINE:
          case BuildingType.BARRACKS:
          case BuildingType.SENAT:
            this.scene.buildingManager.selectBuildingType(type)
            this.onBuildingButtonClick(button, type)
            return
          case ButtonNames.ROAD:
            this.onRoadButtonClick(button)
            return
          case ButtonNames.RESET:
            this.onResetButtonClick()
        }
      })

      button.setSpriteWidth(100)
      button.setSpriteHeight(button.width / 1.6)

      const x = button.getSpriteWidth() * 1.2
      const y = button.getSpriteHeight() / 3
      button.position.set(x + idx * x, y)
      this.buttons.set(id, button)

      this.addChild(button)
    })
  }

  private onBuildingButtonClick(button: Button, type: BuildingType): void {
    this.scene.roadManager.isRoadBuildingMode = false
    const isBuildingButton = this.selectedButton === button
    this.selectedButton = isBuildingButton ? null : button
    this.onBuildingSelect(isBuildingButton ? null : type)
    this.activateAllButtons()
    button.setEnabled(isBuildingButton)
  }

  private onRoadButtonClick(button: Button): void {
    const isRoadButton = this.selectedButton === button
    this.selectedButton = isRoadButton ? null : button
    this.onRoadBuildingToggle()
    this.activateAllButtons()
    button.setEnabled(isRoadButton)
  }

  private onResetButtonClick(): void {
    this.scene.buildingManager.selectBuildingType(null)
    this.scene.roadManager.isRoadBuildingMode = false
    this.selectedButton = null

    this.activateAllButtons()
    this.onReset()
  }

  private onReset() {
    this.scene.buildingManager.removeAllBuildings()
    this.scene.roadManager.removeAllRoads()
    this.scene.workerManager.removeAllWorkers()
  }

  private onRoadBuildingToggle() {
    this.scene.roadManager.isRoadBuildingMode =
      !this.scene.roadManager.isRoadBuildingMode
    if (this.scene.roadManager.isRoadBuildingMode) {
      this.scene.buildingManager.selectBuildingType(null)
    }
  }

  private onBuildingSelect(buildingType: BuildingType | null) {
    this.scene.buildingManager.selectBuildingType(buildingType)
  }

  private activateAllButtons() {
    this.buttons.forEach((button) => {
      button.setEnabled(true)
    })
  }

  private isButtonName(value: string): value is ButtonNames {
    return Object.values(ButtonNames).includes(value as ButtonNames)
  }

  public onPointerTap({ x, y, target }: PIXI.FederatedPointerEvent) {
    const grid = this.scene.grid

    // Запобігаємо провалюванню івента на app.stage, бо чомусь preventDefault на кнопці не хоче працювати
    if (this.isButtonName(target.label)) return

    const roadManager = this.scene.roadManager
    const buildingManager = this.scene.buildingManager
    const tilePos = grid.getTilePosition(x, y)
    if (!tilePos) return
    if (roadManager.isRoadBuildingMode) {
      roadManager.placeRoad(tilePos.x, tilePos.y)
    } else {
      // Ставимо будівлю
      const building = buildingManager.placeBuilding(tilePos.x, tilePos.y)
      if (!building) return
      // Прибираємо прев'ю
      this.scene.buildingManager.selectBuildingType(null)
      this.activateAllButtons()

      // Для бараків окрема логіка
      if (building?.getType() === BuildingType.BARRACKS) {
        const roadTiles = this.scene.grid.getRoadTiles()
        if (!roadTiles.length) return
        const { x, y } = roadTiles[Math.floor(roadTiles.length * Math.random())]
        this.scene.workerManager.addWorker(x, y)
      }
    }
  }

  public onPointerDown() {
    this.isDragging = true
  }
  public onPointerUp() {
    this.isDragging = false
  }

  public onPointerMove({ x, y }: PIXI.FederatedPointerEvent) {
    const tilePos = this.scene.grid.getTilePosition(x, y)
    this.scene.buildingManager.updatePreview(
      tilePos ? tilePos.x : null,
      tilePos ? tilePos.y : null
    )

    if (this.isDragging && this.scene.roadManager.isRoadBuildingMode) {
      const tilePos = this.scene.grid.getTilePosition(x, y)
      if (tilePos) {
        this.scene.roadManager.placeRoad(tilePos.x, tilePos.y)
      }
    }
  }
}

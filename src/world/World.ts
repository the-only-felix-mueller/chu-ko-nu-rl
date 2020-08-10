import * as ROT from 'rot-js'
import * as actions from './actions'
import { EntityComponents, EntityManager } from './entities'
import { TileType } from './tiles'
import { Vector, Dense2DArray } from '../geometry'
import * as prototypes from './entity-prototypes'
import { movement } from './movement.system'
import { ProtocolPhase, ExpectingInput, ExpectingTurn } from './protocol'

export class World {
  readonly comps: EntityComponents
  readonly entityManager: EntityManager
  readonly dimensions: Vector
  readonly map: Dense2DArray<TileType>
  turnCounter: number
  isPlayerTurn: boolean
  effects: string[] = [] // Things that happened, that aren't encoded is entities or tiles.
  nextPlayerAction: actions.Action
  // TODO A phase has one world and a world has one phase property. Is that an OOP design flaw? Coupling?
  phase: ProtocolPhase
  // Possible protocol phases: TODO: Make them accessible only to classes in "/world/".
  readonly expectingTurn = new ExpectingTurn(this)
  readonly expectingInput = new ExpectingInput(this)

  constructor () {
    this.comps = new EntityComponents()
    this.entityManager = new EntityManager(this.comps)
    this.turnCounter = 0
    this.isPlayerTurn = true

    this.dimensions = new Vector(40, 40)
    this.map = new Dense2DArray<TileType>(this.dimensions)
    const mapgenerator = new ROT.Map.Digger(this.dimensions.x, this.dimensions.y, { dugPercentage: 0.8 })
    mapgenerator.create((x, y, content) => {
      this.map.set(new Vector(x, y), content === 1 ? TileType.WALL : TileType.FLOOR)
    })

    this.entityManager.create(prototypes.player, new Vector(33, 33))
    this.entityManager.create(prototypes.bat, new Vector(28, 34))
    this.entityManager.create(prototypes.barrel, new Vector(30, 34))
    this.entityManager.create(prototypes.turtle, new Vector(32, 34))
    this.entityManager.create(prototypes.turtle, new Vector(34, 33));
    [[35, 35], [35, 31], [31, 31]].forEach((pos: [number, number]) => {
      this.entityManager.create(prototypes.goblin, new Vector(...pos))
    })

    this.phase = this.expectingInput
  }

  getPlayerPos (): Vector {
    const playerID = this.comps.player
    return this.comps.position.get(playerID)
  }

  enemyTurn (): void {
    this.turnCounter++
    movement(this)
  }

  visibleEntityActions (): boolean {
    // TODO Implement this, when FOV is implemented.
    return true
  }
}

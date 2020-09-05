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

    this.placeEntities()

    this.phase = this.expectingInput
  }

  private placeEntities () {
    const list: [prototypes.EntityPrototype, number][] = [
      [prototypes.player, 1],
      [prototypes.bat, 2],
      [prototypes.barrel, 3],
      [prototypes.turtle, 3],
      [prototypes.goblin, 5],
      [prototypes.wisp, 5]
    ]
    for (const [type, num] of list) {
      for (let i = 0; i < num; i++) {
        let posCandidate // Apparently this can't be declared as a `const` inside the loop.
        while (true) {
          const x = ROT.RNG.getUniformInt(1, this.dimensions.x - 1)
          const y = ROT.RNG.getUniformInt(1, this.dimensions.y - 1)
          posCandidate = new Vector(x, y)
          if (!this.map.get(posCandidate).solid && !this.comps.position.atPosition(posCandidate)) {
            break
          }
        }
        this.entityManager.create(type, posCandidate)
      }
    }
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

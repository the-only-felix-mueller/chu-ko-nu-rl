import { World } from './World'
import * as ROT from 'rot-js'
import { EntityID, MovementStrategy } from './entities'
import { Vector, directions } from '../geometry'
import { getActiveEntities } from './speed.system'

export function movement (world: World): void {
  // TODO This function is very complicated and should be testet thoroughly.

  // helper function
  function determineGoalDestination (id: EntityID, ignorePosition?: Vector): Vector | null {
    // If this function returns null, the entity doesn't want to move.
    // The desired position is never an entity *without* movementStrategy-component
    // or a solid tile, like a wall.

    const strategy = world.comps.movementStrategy.get(id)
    const oldPosition = world.comps.position.get(id)
    let newPosition = null // default: don't move

    switch (strategy) {
      // case MovementStrategy.FLEEING:
      //     // TODO implement - Currently fleeing is just wandering.
      // case MovementStrategy.HUNTING:
      //     // TODO implement - Currently hunting is just wandering.
      // case MovementStrategy.WANDERING:
      // TODO MovementStrategy.USER isn't handled here. Should it?
      case MovementStrategy.USER:
        break
      case MovementStrategy.WANDERING: {
        let dirIndex = ROT.RNG.getUniformInt(0, 3)

        for (let i = 0; i < 4; ++i) {
          const direction = directions[dirIndex]
          newPosition = oldPosition.add(direction)

          const entity = world.comps.position.atPosition(newPosition)
          const blockingEntityIsAtDestination = entity && !world.comps.movementStrategy.has(entity)

          const isIgnoredPos = ignorePosition && ignorePosition.equals(newPosition)

          if (world.map.get(newPosition).solid || blockingEntityIsAtDestination || isIgnoredPos) {
            dirIndex = (dirIndex + 1) % 4 // rotate 90°
          } else {
            break
          }
        }
        break
      }
      default:
        throw new Error('Unimplemented movement strategy.')
    }
    return newPosition
  }

  // Sparse array that associates entities that want to move this turn with their desired goals:
  const goals: Vector[] = []
  // List with all entities that want to move this turn:
  const wantsToMoveOrdered: EntityID[] = []

  // for (const id of world.comps.movementStrategy.keys()) {
  for (const id of getActiveEntities(world)) {
    if (world.comps.player !== id) {
      // console.log('moves: ' + EntityAppearance[world.comps.appearance.get(id)])
      const dest = determineGoalDestination(id)
      if (dest) {
        goals[id] = dest
        wantsToMoveOrdered.push(id)
      }
    }
  }

  // Create random order. If two entities want to go on the same time,
  // this makes the outcome unpredictable.
  const wantsToMove = ROT.RNG.shuffle(wantsToMoveOrdered)

  while (wantsToMove.length > 0) {
    let change: boolean
    do {
      // Go through each entity and try to move it once.
      change = false
      let i = 0
      while (i < wantsToMove.length) {
        const id = wantsToMove[i]
        const entityAtGoal = world.comps.position.atPosition(goals[id])
        if (entityAtGoal === undefined) { // "undefined" => no entity found
          world.comps.position.move(id, goals[id])
          wantsToMove.splice(i, 1) // Remove id at current index i.
          change = true
        } else {
          i++ // Try to move next entity.
        }
      }
      // If there was a change, there is a chance that the remaining entities wanting to move can move now.
    } while (change)

    if (wantsToMove.length > 0) {
      // Nobody could move, but there are still entities that want to move:
      // The first entity tries the second best move.
      const firstId = wantsToMove[0]
      const secondBest = determineGoalDestination(firstId, goals[0])
      const entityAtGoal = world.comps.position.atPosition(secondBest)

      wantsToMove.shift() // Remove first entity in any case
      if (entityAtGoal === undefined) { // "undefined" => no entity found
        world.comps.position.move(firstId, secondBest)
        change = true
      }
    }
  }
}

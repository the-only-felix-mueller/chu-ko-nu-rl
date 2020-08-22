import { Direction, directions, Vector } from '../geometry'
import { World } from './World'

/**
 * An `Action` is a function that transforms the world given as an argument.
 *
 * The return value indicates, whether the action was valid or not.
 * For example, if the player tries to walk through a wall, the world object
 * will not be changed and the `Action` will return `false`.
 */
export type Action = (world: World) => boolean;

export function walk (dir: Direction): Action {
  return (world) => {
    const playerID = world.comps.player
    const playerPos = world.getPlayerPos()
    const target = playerPos.add(directions[dir])
    if (world.map.get(target).solid || world.comps.position.atPosition(target)) {
      return false
    }
    world.comps.position.move(playerID, target)
    return true
  }
}

export function wait (): Action {
  // Function, that doesn't change the world.
  return (/* world: World */) => true
}

export function shoot (target: Vector): Action {
  return (world) => {
    world.effects.push('shot')
    const hitEntity = world.comps.position.atPosition(target)
    if (hitEntity) {
      world.entityManager.delete(hitEntity)
      world.effects.push('hit')
    } else {
      world.effects.push('miss')
    }
    return true
  }
}

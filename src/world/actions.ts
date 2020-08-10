import { Direction, directions, Vector } from '../geometry'
import { World } from './World'

export type Action = (world: World) => void;

export function walk (dir: Direction): Action {
  return (world) => {
    const playerID = world.comps.player
    const playerPos = world.getPlayerPos()
    world.comps.position.move(playerID, playerPos.add(directions[dir]))
  }
}

export function wait (): Action {
  // Function, that doesn't change the world.
  return (world) => world
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
  }
}

import { EntityID } from './entities'
import { World } from './World'
import { combineIterators } from '../util'

export function getActiveEntities (world: World): IterableIterator<EntityID> {
  let result = world.comps.fast.values()

  if (world.turnCounter % 2 === 0) {
    result = combineIterators(result, world.comps.normalSpeed.values())
  }
  if (world.turnCounter % 4 === 0) {
    result = combineIterators(result, world.comps.slow.values())
  }
  return result
}

export function isActive (id: EntityID, world: World): boolean {
  // This doesn't distinguish between players and enemies
  if (world.comps.fast.has(id)) return true
  if (world.comps.normalSpeed.has(id) && world.turnCounter % 2 === 0) return true
  if (world.comps.slow.has(id) && world.turnCounter % 4 === 0) return true
  return false
}

import { EntityAppearance } from '../world/entities'
import { TileAppearance } from '../world/tiles'

export const tiles = new Map<TileAppearance, [string, string, string, string]>([
  [TileAppearance.WALL, ['a hard stone wall', '#', 'lightgray', 'black']],
  [TileAppearance.FLOOR, ['the floor', '.', 'white', 'black']]
])

export const entities = new Map<EntityAppearance, [string, string, string]>([
  [EntityAppearance.BARREL, ['a wodden barrel', 'B', 'brown']],
  [EntityAppearance.BAT, ['a quick bat', 'b', 'grey']],
  [EntityAppearance.GOBLIN, ['a smelly goblin', 'g', 'green']],
  [EntityAppearance.TURTLE, ['a slow turtle', 't', 'darkgreen']],
  [EntityAppearance.PLAYER, ['yourself', '@', 'yellow']],
  [EntityAppearance.WISP, ['a magical wisp', '|', '#FFFFEE']]
])

// TODO The maps should map to objects with named attributes instead of arrays.
// How would this work with animated entities? Maybe the constants need to become functions.
// Should all wisps look the same at each moment?

import { EntityAppearance } from '../world/entities'
import { TileAppearance } from '../world/tiles'

export const tiles = new Map<TileAppearance, [string, string, string]>([
  [TileAppearance.WALL, ['#', 'LightGray', 'black']],
  [TileAppearance.FLOOR, ['.', 'white', 'black']]
])

export const entities = new Map<EntityAppearance, [string, string]>([
  [EntityAppearance.BARREL, ['B', 'brown']],
  [EntityAppearance.BAT, ['b', 'grey']],
  [EntityAppearance.GOBLIN, ['g', 'green']],
  [EntityAppearance.TURTLE, ['t', 'DarkGreen']],
  [EntityAppearance.PLAYER, ['@', 'yellow']],
  [EntityAppearance.WISP, ['|', '#FFFFEE']]
])

// TODO Textual descriptions could be added similarly: GOBLIN -> "a smelly Greenskin"
// How would this work with animated entities? Maybe the constants need to become functions.
// Do all wisps look the same at each moment? (Yes)

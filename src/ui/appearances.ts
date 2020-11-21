import { EntityAppearance } from '../world/entities'
import { TileAppearance } from '../world/tiles'

interface TileAppearanceProperties {
  getDescription (): string,
  getGlyph (animationPhase: number): string,
  getFG (animationPhase: number): string, // foreground
  getBG (animationPhase: number): string // background
}

// TODO This class smells. Too much repetition, too little substance.
class SimpleTileApperanceProperties implements TileAppearanceProperties {
  /* eslint-disable no-useless-constructor */
  constructor (
    readonly desc: string,
    readonly glyph: string,
    readonly fg: string,
    readonly bg: string
  ) {}
  /* eslint-enable no-useless-constructor */

  getDescription (): string {
    return this.desc
  }

  getGlyph (): string {
    return this.glyph
  }

  getFG (): string {
    return this.fg
  }

  getBG (): string {
    return this.bg
  }
}

class TorchApperanceProperties implements TileAppearanceProperties {
  /* eslint-disable no-useless-constructor */
  constructor (
    readonly desc: string
  ) {}
  /* eslint-enable no-useless-constructor */

  getDescription (): string {
    return this.desc
  }

  getGlyph (): string {
    return 'i'
  }

  getFG (): string {
    return '#6a4718'
  }

  getBG (animationPhase: number): string {
    return ['#7b683c', '#9e7d35', '#9e7135', '#7b683c', '#665736'][animationPhase % 5]
  }
}

export const tiles = new Map<TileAppearance, TileAppearanceProperties>([
  [TileAppearance.WALL, new SimpleTileApperanceProperties('a hard stone wall', '#', 'black', '#606060')],
  [TileAppearance.TORCH, new TorchApperanceProperties('a torch on the wall')],
  [TileAppearance.FLOOR, new SimpleTileApperanceProperties('the floor', '.', 'white', 'black')]
])

interface EntityAppearanceProperties {
  getDescription (): string,
  getGlyph (animationPhase: number): string,
  getFG (animationPhase: number): string // foreground
}

// TODO This class is smells. Too much repetition, too little substance.
class SimpleEntityApperanceProperties implements EntityAppearanceProperties {
  /* eslint-disable no-useless-constructor */
  constructor (
    readonly desc: string,
    readonly glyph: string,
    readonly fg: string
  ) {}
  /* eslint-enable no-useless-constructor */

  getDescription (): string {
    return this.desc
  }

  getGlyph (): string {
    return this.glyph
  }

  getFG (): string {
    return this.fg
  }
}

class AnimatedEntityApperanceProperties implements EntityAppearanceProperties {
  // Maybe, instead of two arrays of animation phases, there should be one array,
  // so that a specific glyph always shows up in a specific color.

  /* eslint-disable no-useless-constructor */
  constructor (
    readonly desc: string,
    readonly glyphs: string[],
    readonly fgs: string[]
  ) {}
  /* eslint-enable no-useless-constructor */

  getDescription (): string {
    return this.desc
  }

  getGlyph (animationPhase: number): string {
    return this.glyphs[animationPhase % this.glyphs.length]
  }

  getFG (animationPhase: number): string {
    return this.fgs[animationPhase % this.fgs.length]
  }
}

export const entities = new Map<EntityAppearance, EntityAppearanceProperties>([
  [EntityAppearance.BARREL, new SimpleEntityApperanceProperties('a wodden barrel', 'B', 'brown')],
  [EntityAppearance.BAT, new SimpleEntityApperanceProperties('a quick bat', 'b', 'grey')],
  [EntityAppearance.GOBLIN, new SimpleEntityApperanceProperties('a smelly goblin', 'g', 'green')],
  [EntityAppearance.TURTLE, new SimpleEntityApperanceProperties('a slow turtle', 't', 'darkgreen')],
  [EntityAppearance.PLAYER, new SimpleEntityApperanceProperties('yourself', '@', 'yellow')],
  [EntityAppearance.WISP, new AnimatedEntityApperanceProperties(
    'a magical wisp', ['|', '/', '–', '\\'], ['#E4DF70', '#E0D470', '#FF9070']
  )]
])

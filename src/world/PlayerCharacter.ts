import * as ROT from 'rot-js'
import FOV from 'rot-js/lib/fov/fov'

import { Dense2DArray, Vector } from '../geometry'
import { World } from './World'

export class PlayerCharacter {
  private fov: FOV
  private world: World
  private readonly visibilityRadius = 10
  private readonly visiDim = new Vector(this.visibilityRadius * 2, this.visibilityRadius * 2);

  // There are three levels of knowledge about the map:
  // 1. undiscovered -- drawn black
  // 2. discovered, but currently not seen -- drawn dark
  // 3. discovered and currently seen -- drawn light
  private explored: Dense2DArray<boolean> // TODO good name?!
  private visible: Dense2DArray<boolean>

  constructor (world: World) {
    this.world = world
    console.log(`world dim is set as ${this.world.dimensions}`)

    console.log(`world: ${world}`)
    this.explored = new Dense2DArray<boolean>(this.world.dimensions, false)
    this.visible = new Dense2DArray<boolean>(this.visiDim, false)
    this.fov = new ROT.FOV.PreciseShadowcasting((x: number, y: number) => {
      const pos = new Vector(x, y)
      return pos.isWithinRect(this.world.dimensions) && !this.world.map.get(pos).solid
    })
  }

  updateFOV (): void {
    const pos = this.world.getPlayerPos()
    // Reset visible tiles to all false/hidden:
    this.visible = new Dense2DArray(this.visiDim, false)

    this.fov.compute(pos.x, pos.y, this.visibilityRadius, (x, y, _, visibility) => {
      const pos = new Vector(x, y)
      // TODO Check: What does a visibility between 0 and 1 mean?
      // console.log(`visibility: ${visibility}`)
      // Update the fog of war:
      if (visibility > 0) {
        this.explored.set(pos, true)
        const offset = new Vector(this.visibilityRadius, this.visibilityRadius)
        const relPos = pos.sub(this.world.getPlayerPos()).add(offset)
        // console.log(`pos = ${pos} relpos = ${relPos}`);
        if (relPos.isWithinRect(this.visiDim)) {
          this.visible.set(relPos, true)
        }
      }
    })
  }

  getExplored (pos: Vector): boolean {
    return this.explored.get(pos)
  }

  getVisible (pos: Vector): boolean {
    // This translates absolute coordinates on the map to coordinates relative to the "visibility square".
    // TODO: Maybe it's a stupid idea to ask for any position outside the visible range.
    const offset = new Vector(this.visibilityRadius, this.visibilityRadius)
    const relativePos = pos.sub(this.world.getPlayerPos()).add(offset)
    return relativePos.isWithinRect(this.visiDim) && this.visible.get(relativePos)
  }
}

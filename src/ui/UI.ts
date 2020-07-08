import { World } from '../world/World'
import { Vector, Direction, directions } from '../geometry'
import * as actions from '../world/actions'
import * as appearances from './appearances'
import * as ROT from 'rot-js'
import { sleep, createKeydownPromise } from '../util'
import { TileAppearance } from '../world/tiles'
import { EntityAppearance } from '../world/entities'

export class UI {
  readonly display: ROT.Display
  readonly world: World
  private readonly dimensions: Vector
  private readonly center: Vector
  keydownHandler: (evt: KeyboardEvent) => Promise<void>

  constructor () {
    this.dimensions = new Vector(60, 30)
    this.center = new Vector(this.dimensions.x / 2, this.dimensions.y / 2)
    this.display = new ROT.Display({ width: this.dimensions.x, height: this.dimensions.y })
    this.world = new World()
    this.keydownHandler = this.defaultKeydownHandler
  }

  // TODO put this in geometry.ts
  private absToRel (absolutePos: Vector): Vector {
    // Camera is centered on player character.
    return absolutePos.sub(this.world.getPlayerPos()).add(this.center)
  }

  // TODO put this in geometry.ts
  private relToAbs (relativePos: Vector): Vector {
    // Camera is centered on player character.
    return relativePos.add(this.world.getPlayerPos()).sub(this.center)
  }

  protected drawAt (position: Vector, glyph: string, fg: string, bg: string) {
    const relativePos = this.absToRel(position)
    this.display.draw(relativePos.x, relativePos.y, glyph, fg, bg)
  }

  draw (): void {
    while (this.world.events.length > 0) {
      switch (this.world.events.shift()) {
        case 'shot':
          console.log('"PFRRRR"')
          break
        case 'hit':
          console.log('"AAAARG!"')
          break
        case 'miss':
          console.log('"plink"')
          break
      }
    }

    for (let y = 0; y < this.dimensions.y; y++) {
      for (let x = 0; x < this.dimensions.x; x++) {
        const absolutePos = this.relToAbs(new Vector(x, y))
        if (absolutePos.isWithinRect(this.world.dimensions)) {
          let [glyph, fg, bg] = appearances.tiles.get(this.world.map.get(absolutePos).appearance)

          const entityID = this.world.comps.position.atPosition(absolutePos)
          if (entityID) {
            [glyph, fg] = appearances.entities.get(this.world.comps.appearance.get(entityID))
          }

          this.display.draw(x, y, glyph, fg, bg)
        } else {
          this.display.draw(x, y, 'X', '#222', '#111')
        }
      }
    }
  }

  async defaultKeydownHandler (evt: KeyboardEvent): Promise<void> {
    // Handle keydown-events, that are allowed to happen, when the game doesn't expect any other specific commands:
    return new Promise(async resolve => { // TODO "Promise executor functions should not be async."
      switch (evt.keyCode) {
        case ROT.KEYS.VK_Q:
          window.alert('Goodbye!')
          break
        case ROT.KEYS.VK_D: { // "debug"
          const abovePlayerPos = this.world.getPlayerPos().add(new Vector(0, -1))
          const tile = TileAppearance[this.world.map.get(abovePlayerPos).appearance]
          const c = this.world.comps
          const entityAbove = c.position.atPosition(abovePlayerPos)
          const entity = EntityAppearance[c.appearance.get(entityAbove)]
          console.log(`Above: ${entity} on ${tile}`)
          break
        }
        case ROT.KEYS.VK_P: { // "pause"
          for (let i = 5; i > 0; i--) {
            console.log(i.toString())
            await sleep(1000)
          }
          console.log('continue')
          break
        }
      }
      resolve()
    })
  }

  async shoot (direction: Direction): Promise<void> {
    // TODO adapt this for diagonal shots
    const vec = directions[direction]
    let pos = this.world.getPlayerPos()

    for (let i = 0; i < 4; i++) {
      // draw "*" at playerPos + vec*i
      pos = pos.add(vec)
      this.drawAt(pos, '*', null, null)
      await sleep(200)
      this.draw() // TODO don't redraw *everything*
    }
  }

  async mainLoop () {
    const playerTurnIndicator = document.getElementById('player-turn-indicator')
    const turnCounter = document.getElementById('turn-counter')

    while (true) {
      // Every third turn is a playerTurn.
      // Fast enemies act every world-turn,
      // normal enemies every second,
      // slow enemies every fourth word-turn.

      this.draw()
      await sleep(400)

      playerTurnIndicator.innerHTML = 'press a key'
      const playerAction = await this.waitForPlayerAction()
      playerTurnIndicator.innerHTML = 'wait...'
      if (playerAction) {
        // TODO Remove this, when the timeout of waitForPlayerAction is removed!
        this.world.playerTurn(playerAction)
      }
      this.draw()
      await sleep(400)

      this.world.turn()
      turnCounter.innerHTML = this.world.turnCounter.toString()
      this.draw()
      await sleep(400)

      this.world.turn()
      turnCounter.innerHTML = this.world.turnCounter.toString()
    }
  }

  waitForPlayerAction = createKeydownPromise<actions.Action>(this, then => {
    console.log('keydownHandler = playerAction')
    this.keydownHandler = async (evt: KeyboardEvent) => {
      switch (evt.keyCode) {
        case ROT.KEYS.VK_RIGHT:
          then(actions.walk(Direction.EAST))
          break
        case ROT.KEYS.VK_LEFT:
          then(actions.walk(Direction.WEST))
          break
        case ROT.KEYS.VK_DOWN:
          then(actions.walk(Direction.SOUTH))
          break
        case ROT.KEYS.VK_UP:
          then(actions.walk(Direction.NORTH))
          break
        case ROT.KEYS.VK_F: { // "fire"
          const target = await this.waitForTargeting()
          then(actions.shoot(target))
          break
        }
        case ROT.KEYS.VK_PERIOD:
          then(actions.wait())
          break
        default:
          await this.defaultKeydownHandler(evt)
      }
    }
  }, 8000) // TODO The timeout is just for testing reasons. Remove this later!

  waitForTargeting = createKeydownPromise<Vector>(this, then => {
    let crosshairPos = this.world.getPlayerPos()
    this.drawAt(crosshairPos, 'X', 'red', null)

    console.log('keydownHandler = targeting')
    this.keydownHandler = async (evt: KeyboardEvent) => {
      switch (evt.keyCode) {
        // TODO 'ESC' to cancel targeting
        // TODO create function 'keyToDirectionVector'
        case ROT.KEYS.VK_UP:
          crosshairPos = crosshairPos.add(directions[Direction.NORTH])
          break
        case ROT.KEYS.VK_DOWN:
          crosshairPos = crosshairPos.add(directions[Direction.SOUTH])
          break
        case ROT.KEYS.VK_LEFT:
          crosshairPos = crosshairPos.add(directions[Direction.WEST])
          break
        case ROT.KEYS.VK_RIGHT:
          crosshairPos = crosshairPos.add(directions[Direction.EAST])
          break
        case ROT.KEYS.VK_F: // 'Fire'
          if (crosshairPos !== this.world.getPlayerPos()) {
            then(crosshairPos)
          } else {
            console.log('You can\'t shoot yourself.')
          }
          break
        default:
          await this.defaultKeydownHandler(evt)
      }
      this.draw()
      this.drawAt(crosshairPos, 'X', 'red', null)
    }
  })
}

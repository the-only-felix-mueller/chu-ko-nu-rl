import * as ROT from 'rot-js'

import * as appearances from './appearances'

import { Vector, directions, keyToDirection, Direction } from '../geometry'
import { sleep, promiseKeydown } from '../util'

import { World } from '../world/World'
import * as actions from '../world/actions'
import { TileAppearance } from '../world/tiles'
import { EntityAppearance } from '../world/entities'
import { ExpectingInput, ExpectingTurn } from '../world/protocol'

interface Drawable {
  draw (): void
}

export class UI {
  // TODO This class is too big. Maybe break it down in ui-elements.
  readonly display: ROT.Display
  readonly world: World
  private readonly dimensions: Vector
  private readonly center: Vector
  private wispAnimationPhase: number // TODO generalize, put this in apperances.ts
  private drawables: Drawable[]

  constructor () {
    this.wispAnimationPhase = 0
    this.dimensions = new Vector(40, 26)
    this.center = new Vector(this.dimensions.x / 2, this.dimensions.y / 2)
    this.display = new ROT.Display({ width: this.dimensions.x, height: this.dimensions.y })
    this.world = new World()
    this.drawables = []
  }

  async mainLoop () {
    const playerTurnIndicator = document.getElementById('player-turn-indicator')
    const turnCounter = document.getElementById('turn-counter')

    // The world has to be drawn before the player decides what action to perform.
    this.animateAndDraw()

    while (true) {
      if (this.world.phase instanceof ExpectingInput) { // "Type Guard"
        playerTurnIndicator.innerText = 'choose an action'

        // During the wait, the display can be redrawn at regular intervals.
        this.animateAndDraw() // Draw once immediately.
        const intervalHandle = window.setInterval(() => {
          this.animateAndDraw()
        }, 200)

        const action = await this.waitForActionKey()
        window.clearInterval(intervalHandle)
        playerTurnIndicator.innerText = 'wait...'
        this.world.phase.setAction(action)
      } else if (this.world.phase instanceof ExpectingTurn) {
        this.world.phase.turn()
        turnCounter.innerText = this.world.turnCounter.toString()
        await this.displayTurn()
      } else {
        // TODO Can the compiler prove that it's impossible to reach this case?
        throw new Error('Undefined protocol phase. This should never happen.')
      }
    }
  }

  private log (text: string) {
    const oldOldLog = document.getElementById('log1')
    const oldLog = document.getElementById('log2')
    const newLog = document.getElementById('log3')
    oldOldLog.innerText = oldLog.innerText
    oldLog.innerText = newLog.innerText
    newLog.innerText = text
  }

  /**
   * Convert an absolute position on the map to a relative position on the
   * section currently displayed.
   */
  private absToRel (absolutePos: Vector): Vector {
    // Camera is centered on player character.
    return absolutePos.sub(this.world.getPlayerPos()).add(this.center)
  }

  /**
   * Convert a relative position on the displayed section of the map to an
   * absolute position.
   */
  private relToAbs (relativePos: Vector): Vector {
    // Camera is centered on player character.
    return relativePos.add(this.world.getPlayerPos()).sub(this.center)
  }

  /**
   * Helper method.
   *
   * Calls `draw`on the (ROT-)display member, but converts an absolute
   * position `Vector` to two relative x and y coordinates.
   */
  protected drawAt (position: Vector, glyph: string, fg: string, bg: string) {
    const relativePos = this.absToRel(position)
    this.display.draw(relativePos.x, relativePos.y, glyph, fg, bg)
  }

  /**
   * Does two things: This method draws the world as it is once and
   * then waits a bit (before the program continues to expect an action
   * from the player). During the waiting, the user can access menues.
   */
  async displayTurn (): Promise<void> {
    this.animateAndDraw()
    await this.waitForMenuKeyOrTimeout()
  }

  /**
   * This changes the colors or glyphs of parts of tiles and entities ("animate")
   * and then draws everything, which includes the map tiles, entities and "effects".
   * Effects are temporary animations like projectiles, blood splatters or explosions.
   */
  animateAndDraw (): void {
    const wispDescrition = 'a magical wisp'
    const wispGlyphs = ['|', '/', '–', '\\']
    const wispColors = ['#E4FF70', '#E0F470', '#FF9070']
    appearances.entities.set(EntityAppearance.WISP, [wispDescrition, wispGlyphs[this.wispAnimationPhase % 4], wispColors[this.wispAnimationPhase % 3]])
    this.wispAnimationPhase = (++this.wispAnimationPhase) % 12

    if (!this.world.visibleEntityActions()) {
      // If there are no enemies in sight of the player nothing needs to get redrawn.
      // This is especially important for the waiting time:
      // If the player is slowed down, so they only act every fourth turn but there
      // are no enemies in sight, the user shouldn't have to *wait* three turns before
      // being able to move again.
      return
    }

    while (this.world.effects.length > 0) {
      switch (this.world.effects.shift()) {
        case 'shot':
          this.log('"PFRRRR"')
          break
        case 'hit':
          this.log('"AAAARG!"') // Currently, even the barrel screams when shot.
          break
        case 'miss':
          this.log('"plink"')
          break
      }
    }

    for (let y = 0; y < this.dimensions.y; y++) {
      for (let x = 0; x < this.dimensions.x; x++) {
        const absolutePos = this.relToAbs(new Vector(x, y))
        if (absolutePos.isWithinRect(this.world.dimensions)) {
          let [_, glyph, fg, bg] = appearances.tiles.get(this.world.map.get(absolutePos).appearance)

          const entityID = this.world.comps.position.atPosition(absolutePos)
          if (entityID) {
            [_, glyph, fg] = appearances.entities.get(this.world.comps.appearance.get(entityID))
          }
          this.display.draw(x, y, glyph, fg, bg)
        } else {
          this.display.draw(x, y, 'X', '#222', '#111')
        }
      }
    }

    this.drawables.forEach(drawable => {
      drawable.draw()
    })
  }

  /**
   * Waits for either a menu key to be pressed or a short while to pass, enough for
   * the player to visually understand a scene.
   * If a menu key was pressed, the event will be handled accordingly.
   */
  async waitForMenuKeyOrTimeout (): Promise<void> {
    const menuKeys = [ROT.KEYS.VK_F1, ROT.KEYS.VK_P, ROT.KEYS.VK_Q]
    const key = await Promise.race([this.waitForKey(menuKeys), sleep(200)])
    // TODO there are three cases: menu key, non-menu key, no key within sleep time
    if (typeof key === 'number') { // If no key was pressed, "key" contains "undefined".
      await this.handleMenuKey(key)
    }
  }

  /**
   * Open a menu depending on the key-code that is passed as an argument..
   *
   * If the key is not associated to a menu this does nothing.
   */
  private async handleMenuKey (key: number) {
    const backup = window.onkeydown
    window.onkeydown = null

    switch (key) {
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
      case ROT.KEYS.VK_F1: { // help
        const outerThis = this
        this.drawables.push({
          draw () {
            outerThis.display.drawText(3, 2, '%b{blue}+--------------------------+')
            outerThis.display.drawText(3, 3, '%b{blue}| arrow keys:         move |')
            outerThis.display.drawText(3, 4, '%b{blue}| f         :   aim / fire |')
            outerThis.display.drawText(3, 5, '%b{blue}| . (period):  wait a turn |')
            outerThis.display.drawText(3, 6, '%b{blue}| x         :      examine |')
            outerThis.display.drawText(3, 7, '%b{blue}| F1 or ESC : back to game |')
            outerThis.display.drawText(3, 8, '%b{blue}+--------------------------+')
          }
        })
        this.animateAndDraw() // Optionally there could be a setInterval here,
        // but this help-menu is provisorial anyway.
        // Currently there will be animations in the background when the menu is
        // called during a player-turn, but not during an enemy-turn.
        await this.waitForKey([ROT.KEYS.VK_ESCAPE, ROT.KEYS.VK_F1])
        this.drawables.pop()
        // TODO There might be an issue when a menu is opened during an
        // enemy turn. I have to check whether the menu is drawn over
        // *immediately* or just *when it's the players turn again*.
        break
      }
      case ROT.KEYS.VK_X: { // eXamine
        const outerThis = this
        const drawableMarker = {
          position: outerThis.world.getPlayerPos(),
          draw () {
            const neighborBackgrounds = directions.map((dir) =>
              appearances.tiles.get(outerThis.world.map.get(this.position.add(dir)).appearance)[3])
            const arrows = ['<', '^', '>', 'v'] // E, S, W, N
            const dirs = [Direction.EAST, Direction.SOUTH, Direction.WEST, Direction.NORTH]
            dirs.forEach((dir: number) => {
              outerThis.drawAt(this.position.add(directions[dir]), arrows[dir], 'yellow', neighborBackgrounds[dir])
            })
          }
        }
        this.drawables.push(drawableMarker)
        this.log('This is who you are.')

        // TODO This is similar to crosshair/fire code. Check for refactoring opportunities.
        while (true) {
          // Loop is left with `return` statement, when 'ESC' is pressed.
          const key = await promiseKeydown()
          const direction = keyToDirection.get(key)
          if (direction !== undefined) {
            drawableMarker.position = drawableMarker.position.add(directions[direction])
            const tileType = this.world.map.get(drawableMarker.position)
            const tileDescription: string = appearances.tiles.get(tileType.appearance)[0]
            const c = this.world.comps
            const entityID = c.position.atPosition(drawableMarker.position)
            if (entityID) {
              const description = appearances.entities.get(this.world.comps.appearance.get(entityID))[0]
              this.log(`You see ${description} on ${tileDescription}.`)
            } else {
              this.log(`You see ${tileDescription}.`)
            }
          } else {
            switch (key) {
              case ROT.KEYS.VK_ESCAPE:
                this.drawables.pop()
                return // Statements after the switch-statement will not be executed.
              default:
                await this.handleMenuKey(key)
            }
          }
        }
      }
    }
    window.onkeydown = backup
  }

  /**
   * Create a Promise for a certain keydown-event of one of the keys
   * tin the array that is passed as an argument.
   *
   * Example: `await waitForKey([ROT.KEYS.VK_A, ROT.KEYS.VK_B])`
   * waits until either "A" or "B" was pressed.
   */
  async waitForKey (keys: number[]): Promise<number> {
    while (true) {
      const key = await promiseKeydown()
      if (keys.includes(key)) {
        return key
      }
    }
  }

  /**
   * Waits for the player to choose an action (walking, shooting) and
   * returns a Promise to the chosen Action.
   */
  async waitForActionKey (): Promise<actions.Action> {
    while (true) {
      const key = await promiseKeydown()
      switch (key) {
        case ROT.KEYS.VK_F: { // "fire"
          try {
            const target = await this.waitForTargeting()
            return actions.shoot(target)
          } catch {
            console.log('cancelled shooting')
            this.animateAndDraw()
          }
          break
        }
        case ROT.KEYS.VK_PERIOD:
          return actions.wait()
        default: {
          const direction = keyToDirection.get(key)
          if (direction !== undefined) {
            return actions.walk(direction)
          } else {
            await this.handleMenuKey(key)
          }
        }
      }
    }
  }

  /**
   * Waits for the player to choose a target and returns a Promise
   * to the chosen coordinates.
   */
  async waitForTargeting (): Promise<Vector> {
    const outerThis = this // Is there a more elegant way to do this?

    const drawableCrosshair = {
      position: this.world.getPlayerPos(),
      draw () {
        outerThis.drawAt(this.position, 'X', 'red', null)
      }
    }
    this.drawables.push(drawableCrosshair)

    while (true) {
      // Loop is left with `return` statement, when key 'F' is pressed.
      const key = await promiseKeydown()
      const direction = keyToDirection.get(key)
      if (direction !== undefined) {
        drawableCrosshair.position = drawableCrosshair.position.add(directions[direction])
      } else {
        switch (key) {
          case ROT.KEYS.VK_F: // 'Fire'
            if (drawableCrosshair.position !== this.world.getPlayerPos()) {
              this.drawables.pop()
              return drawableCrosshair.position
            } else {
              this.log('You can\'t shoot yourself.')
            }
            break
          case ROT.KEYS.VK_ESCAPE:
            this.drawables.pop() // I assume the crosshair will be the last drawable added. TODO check this!
            throw Error('targeting aborted') // Not really an "error".
          default:
            await this.handleMenuKey(key)
        }
      }
    }
  }
}

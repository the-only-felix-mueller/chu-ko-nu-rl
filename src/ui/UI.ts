import { World } from '../world/World'
import { Vector, directions, keyToDirection } from '../geometry'
import * as actions from '../world/actions'
import * as appearances from './appearances'
import * as ROT from 'rot-js'
import { sleep, promiseKeydown } from '../util'
import { TileAppearance } from '../world/tiles'
import { EntityAppearance } from '../world/entities'
import { ExpectingInput, ExpectingTurn } from '../world/protocol'

export class UI {
  readonly display: ROT.Display
  readonly world: World
  private readonly dimensions: Vector
  private readonly center: Vector

  constructor () {
    this.dimensions = new Vector(40, 26)
    this.center = new Vector(this.dimensions.x / 2, this.dimensions.y / 2)
    this.display = new ROT.Display({ width: this.dimensions.x, height: this.dimensions.y })
    this.world = new World()
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
        const action = await this.waitForActionKey()
        playerTurnIndicator.innerText = 'wait...'
        // TODO Check if action is valid before submitting it.
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
   * This changes the colors or characters parts of the world are drawn with ("animate")
   * and then draws everything, which includes the map tiles, entities and "effects".
   * Effects are temporary animations like projectiles, blood splatters or explosions.
   */
  animateAndDraw (): void {
    // TODO any animation

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

  /**
   * Waits for either a menu key to be pressed or a short while to pass, enough for
   * the player to visually understand a scene.
   * If a menu key was pressed, the event will be handled accordingly.
   */
  async waitForMenuKeyOrTimeout (): Promise<void> {
    const menuKeys = [ROT.KEYS.VK_F1, ROT.KEYS.VK_P, ROT.KEYS.VK_Q]

    const key = await Promise.race([this.waitForKey(menuKeys), sleep(200)])
    // TODO there are three cases: menu key, non-menu key, no key within sleep time
    if (typeof key === 'number') {
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
        // this.dialogWindowOpen = true
        this.display.drawText(2, 2, '%b{blue}arrow keys:         move')
        this.display.drawText(2, 3, '%b{blue}f         :   aim / fire')
        this.display.drawText(2, 4, '%b{blue}. (period):  wait a turn')
        this.display.drawText(2, 5, '%b{blue}F1 or ESC : back to game')
        await this.waitForKey([ROT.KEYS.VK_ESCAPE, ROT.KEYS.VK_F1])
        this.animateAndDraw()
        break
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
    // Closure
    let crosshairPos = this.world.getPlayerPos()
    this.drawAt(crosshairPos, 'X', 'red', null)

    while (true) {
      // Loop is left with `return` statement, when key 'F' is pressed.
      const key = await promiseKeydown()
      const direction = keyToDirection.get(key)
      if (direction !== undefined) {
        crosshairPos = crosshairPos.add(directions[direction])
        this.animateAndDraw()
        this.drawAt(crosshairPos, 'X', 'red', null)
      } else {
        switch (key) {
          case ROT.KEYS.VK_F: // 'Fire'
            if (crosshairPos !== this.world.getPlayerPos()) {
              return crosshairPos
            } else {
              console.log('You can\'t shoot yourself.')
            }
            break
          case ROT.KEYS.VK_ESCAPE:
            throw Error('targeting aborted') // Not really an error.
          default:
            this.handleMenuKey(key)
        }
      }
    }
  }
}

import { World } from './World'
import { Action } from './actions'
import { MovementStrategy } from './entities'
import { isActive } from './speed.system'

/**
 * This class represents a communication channel between the game world
 * and a user interface.
 *
 * Depending on the state of the world there are different interactions possible,
 * Either the state of the world can be pregressed with `turn()` -- this could also
 * be called "tick" or "update" -- or a player action can be passed with `setAction()`.
 */
export abstract class ProtocolPhase {
  /* eslint-disable no-useless-constructor */
  constructor (public readonly world: World) {
  }
  /* eslint-enable no-useless-constructor */
}

export class ExpectingInput extends ProtocolPhase {
  setAction (action: Action): void {
    this.world.nextPlayerAction = action
    this.world.phase = this.world.expectingTurn
  }
}

export class ExpectingTurn extends ProtocolPhase {
  turn (): void {
    const cs = this.world.comps
    const w = this.world
    if (w.isPlayerTurn) {
      // Player turn
      if (cs.normalSpeed.has(cs.player) && w.turnCounter % 2 === 0) {
        const success = w.nextPlayerAction(w)
        if (success) {
          w.isPlayerTurn = false
        } else {
          console.log('This action didn\'t work. Try something else.')
          this.world.phase = this.world.expectingInput
        }
      } else {
        w.isPlayerTurn = false
      }
    } else {
      // Enemy turn
      w.enemyTurn()
      if (cs.movementStrategy.get(cs.player) === MovementStrategy.USER &&
            isActive(cs.player, w)) {
        // The user has to choose the nextPlayerAction.
        this.world.phase = this.world.expectingInput
      } else {
        // The nextPlayerAction gets set by a status effect, such as "confused".
        this.world.phase = this.world.expectingTurn
      }
      w.isPlayerTurn = true
    }
  }
}

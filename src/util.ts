import { UI } from './ui/UI' // TODO create UI interface

export class IDManager {
  // TODO test this class
  max: number;
  skipped: number[];

  constructor () {
    this.max = 0 // "0" is an invalid ID. That way "if (id)" goes to the true-branch for any valid id.
    this.skipped = []
  }

  generate (): number {
    if (this.skipped.length > 0) {
      return this.skipped.pop()
    } else {
      this.max++
      return this.max
    }
  }

  free (id: number): void {
    /*
          initially      (0, [])
          1 = generate,  (1, [])
          2 = generate,  (2, [])
          3 = generate,  (3, [])
          4 = generate,  (4, [])
          free(3),       (4, [3])
          free(2),       (4, [3, 2])
          free(4),       (3, [3, 2])  -->  (2, [2])  -->  (1, [])
    */

    if (id === this.max) {
      while (true) {
        this.max--
        const index = this.skipped.indexOf(this.max)
        if (index !== -1) {
          // Max index is in "skipped" -> remove it and check again.
          this.skipped.splice(index, 1)
        } else {
          // Max index is not in "skipped"
          break
        }
      }
    } else {
      this.skipped.push(id)
    }
  }
}

export function sleep (milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

/**
 * This function modyfies other functions to avoid a bit of code duplication.
 *
 * The `innerFunction` sets up an event handler and eventually passes
 * a result to the 'then' function, it was passed as an argument.
 *
 * The resulting *modified* function creates a `Promise` that sets up
 * the event listener by calling `innerFunction`.
 *
 * @param ui The `keydownHandler` of this `ui` should be installed when the process of `innerFunction` has returned a result.
 * @param innerFunction This function sets up the process that will eventually pass a result to it's `then` parameter.
 * @param timeout (optional) After this duration in milliseconds, the `resolve` of the promise will be called with `null`, even if no key was pressed.
 */
export function createKeydownPromise<T> (
  ui: UI,
  innerFunction: (then: ((result: T) => void)) => void,
  timeout?: number
): () => Promise<T|null> {
  // TODO Is this the "function decorator" pattern?  Is there an @-notation, like in Python?
  return () => {
    return new Promise<T>(resolve => {
      let timeoutID: number

      innerFunction((result: T) => {
        // The result of innerFunction becomes the result of the Promise,
        // but only after resetting the keydown-handler to default.
        // THIS IS COMMENTED OUT

        console.log('keydownHandler = default')
        ui.keydownHandler = null//(evt) => ui.defaultKeydownHandler(evt)
        if (timeout) {
          // This ensures that resolve doesn't get called twice.
          window.clearTimeout(timeoutID)
        }
        resolve(result)
      })

      if (timeout) {
        timeoutID = window.setTimeout(() => {
          console.log('keydownHandler = default')
          ui.keydownHandler = (evt) => ui.defaultKeydownHandler(evt)
          resolve(null)
        }, timeout)
      }
    })
  }
}

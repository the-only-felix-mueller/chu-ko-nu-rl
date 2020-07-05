export class IDManager {
  // TODO test this class
  max: number;
  skipped: number[];

  constructor () {
    this.max = 0 // "0" is an invalid ID. That way "if(id)" goes to the true-branch for any valid id.
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
          initially     (-1, [])
          0 = generate,  (0, [])
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

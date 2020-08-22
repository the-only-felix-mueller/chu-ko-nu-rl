import { KEYS } from 'rot-js'

export class Vector {
  /* eslint-disable no-useless-constructor */
  constructor (
    readonly x: number,
    readonly y: number
  ) {}
  /* eslint-enable no-useless-constructor */

  equals (other: this): boolean {
    return this.x === other.x && this.y === other.y
  }

  add (other: this): Vector {
    return new Vector(this.x + other.x, this.y + other.y)
  }

  sub (other: this): Vector {
    return new Vector(this.x - other.x, this.y - other.y)
  }

  isWithinRect (rect: Vector): boolean {
    return this.x >= 0 && this.x < rect.x && this.y >= 0 && this.y < rect.y
  }

  toString (): string {
    return `Vector(x:${this.x}, y:${this.y})`
  }
}

export enum Direction {
    EAST, SOUTH, WEST, NORTH
}

export const keyToDirection = new Map([
  [KEYS.VK_RIGHT, Direction.EAST],
  [KEYS.VK_DOWN, Direction.SOUTH],
  [KEYS.VK_LEFT, Direction.WEST],
  [KEYS.VK_UP, Direction.NORTH]
])

export const directions: Vector[] = [
  new Vector(1, 0),
  new Vector(0, 1),
  new Vector(-1, 0),
  new Vector(0, -1)
]

interface Array2D<type> {
    get(pos: Vector): type
    set(pos: Vector, element: type): void
}

export class Dense2DArray<type> implements Array2D<type> {
    columns: type[][];

    constructor (dimensions: Vector) {
      this.columns = new Array(dimensions.x)
      for (let y = 0; y < dimensions.y; y++) {
        this.columns[y] = new Array(dimensions.y)
      }
    }

    get (pos: Vector): type | undefined {
      try {
        return this.columns[pos.x][pos.y]
      } catch (error) {
        console.error(`Was trying to access ${pos.x}|${pos.y}`)
      }
    }

    set (pos: Vector, element: type): void {
      this.columns[pos.x][pos.y] = element
    }
}

export class Sparse2DArray<type> implements Array2D<type> {
  columns: type[][];

  constructor () {
    this.columns = []
  }

  set (pos: Vector, element: type): void {
    if (pos === undefined) {
      console.trace()
      throw new Error('pos undefined')
    }
    if (!this.columns[pos.x]) {
      this.columns[pos.x] = []
    }
    this.columns[pos.x][pos.y] = element
  }

  get (pos: Vector): type | undefined {
    if (!pos || !this.columns[pos.x]) {
      return undefined
    }
    return this.columns[pos.x][pos.y]
  }

  delete (pos: Vector): void {
    // Empty columns aren't deleted. Tracking columns size would
    // take more memory than could be saved that way.
    delete this.columns[pos.x][pos.y]
  }
}

export class BidirectionalVectorMap<T> extends Map<T, Vector> {
  private reverseMap = new Sparse2DArray<T>();

  // constructor() {  // 'standardx' claims this constructor is useless.
  //     super();
  // }

  set (content: T, value: Vector): this {
    // TODO Handle case when two keys have the same value.
    super.set(content, value)
    this.reverseMap.set(value, content)
    return this
  }

  delete (content: T): boolean {
    const value = this.get(content)
    this.reverseMap.delete(value)
    return super.delete(content)
  }

  /**
   * This removes the given element from the position it was on and puts it in a new position.
   *
   * @param content The element whos (whichs?) position should be changed.
   * @param position The new position
   */
  move (content: T, position: Vector): void {
    this.delete(content)
    this.set(content, position)
  }

  /**
   * Get the entity at the given position.
   *
   * If no entity is there, the result will be "undefined".
   */
  atPosition (position: Vector): T {
    return this.reverseMap.get(position)
  }
}

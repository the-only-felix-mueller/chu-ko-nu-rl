export enum TileAppearance {
    WALL, FLOOR
}

export class TileType {
  // TODO maybe use readonly modyfier
  /* eslint-disable no-useless-constructor */
  constructor (
        public appearance: TileAppearance,
        public solid: boolean = true
  ) {};
  /* eslint-enable no-useless-constructor */

  static readonly WALL = new TileType(TileAppearance.WALL);
  static readonly FLOOR = new TileType(TileAppearance.FLOOR, false);
}

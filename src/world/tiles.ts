export enum TileAppearance {
    WALL, FLOOR
}

export class TileType {
    // TODO maybe use readonly modyfier
    constructor(
        public appearance: TileAppearance,
        public solid: boolean = true
    ) {};

    static readonly WALL = new TileType(TileAppearance.WALL);
    static readonly FLOOR = new TileType(TileAppearance.FLOOR, false);
}
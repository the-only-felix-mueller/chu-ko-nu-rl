import { World } from '../world/World';
import { Vector, Direction, directions } from '../geometry';
import * as actions from "../world/actions";
import * as appearances from "./appearances";
import * as ROT from "rot-js";
import { sleep } from '../util';
import { TileType, TileAppearance } from '../world/tiles';
import { EntityAppearance } from '../world/entities';

export class UI {
    readonly display: ROT.Display;
    readonly world: World;
    private readonly dimensions: Vector;
    private readonly center: Vector;
    private isPlayerTurn: boolean;
    afterPlayerActionCallback: (act: actions.Action) => Promise<void>;

    constructor() {
        this.dimensions = new Vector(60, 30);
        this.center = new Vector(this.dimensions.x / 2, this.dimensions.y / 2);
        this.display = new ROT.Display({ width: this.dimensions.x, height: this.dimensions.y });
        this.world = new World();
        this.isPlayerTurn = true;
    }

    private absToRel(absolutePos: Vector): Vector {
        // Camera is centered on player character.
        return absolutePos.sub(this.world.getPlayerPos()).add(this.center);
    }
    
    private relToAbs(relativePos: Vector): Vector {
        // Camera is centered on player character.
        return relativePos.add(this.world.getPlayerPos()).sub(this.center);
    }
    
    protected drawAt(position: Vector, glyph: string, fg: string, bg: string) {
        const relativePos = this.absToRel(position);
        this.display.draw(relativePos.x, relativePos.y, glyph, fg, bg);
    }

    draw(): void {
        const playerPos = this.world.getPlayerPos();
        
        for (let y = 0; y < this.dimensions.y; y++) {
            for (let x = 0; x < this.dimensions.x; x++) {
                const absolutePos = this.relToAbs(new Vector(x, y));
                if (absolutePos.isWithinRect(this.world.dimensions)) {
                    let [glyph, fg, bg] = appearances.tiles.get(this.world.map.get(absolutePos).appearance);

                    const entityID = this.world.comps.position.atPosition(absolutePos);                    
                    if (entityID) {
                        [glyph, fg] = appearances.entities.get(this.world.comps.appearance.get(entityID));
                    }
                    
                    this.display.draw(x, y, glyph, fg, bg);
                }
                else {
                    this.display.draw(x, y, "X", "#222", "#111");
                }
            }
        }
    }

    handleKeypress(evt: KeyboardEvent): void {

        // Handle keydown-events, that are allowed to happen, when it's not the players turn:
        switch (evt.keyCode) {
            case ROT.KEYS.VK_Q:
                alert("Goodbye");
                break;
            case ROT.KEYS.VK_D:  // "debug"
                const abovePlayerPos = this.world.getPlayerPos().add(new Vector(0, -1));
                const tile = TileAppearance[this.world.map.get(abovePlayerPos).appearance];
                const c = this.world.comps;
                const entityAbove = c.position.atPosition(abovePlayerPos);
                const entity = EntityAppearance[c.appearance.get(entityAbove)];
                console.log(`Above: ${entity} on ${tile}`);
                break;
            default:
                // Handle in-game actions:
                if (!this.isPlayerTurn) {
                    // In-game actions are only handled when it's the players turn.
                    return;
                }
                this.isPlayerTurn = false;

                switch (evt.keyCode) {
                    case ROT.KEYS.VK_RIGHT:
                        this.world.playerAction = actions.walk(Direction.EAST);
                        break;
                    case ROT.KEYS.VK_LEFT:
                        this.world.playerAction = actions.walk(Direction.WEST);
                        break;
                    case ROT.KEYS.VK_DOWN:
                        this.world.playerAction = actions.walk(Direction.SOUTH);
                        break;
                    case ROT.KEYS.VK_UP:
                        this.world.playerAction = actions.walk(Direction.NORTH);
                        break;
                    case ROT.KEYS.VK_F:  // "fire"
                        //this.world.act(actions.shoot);
                        break;
                    case ROT.KEYS.VK_PERIOD:
                        this.world.playerAction = actions.wait();
                        break;
                }
                // After any in-game action: Notify the game loop to start the world-turn.
                dispatchEvent(new Event('player-action-evt'));
        }

    }

    async shoot(direction: Direction): Promise<void> {
        const vec = directions[direction];
        let pos = this.world.getPlayerPos();

        for (let i = 0; i < 4; i++) {
            // draw "*" at playerPos + vec*i
            pos = pos.add(vec);
            this.drawAt(pos, '*', null, null);
            await sleep(200);
            this.draw(); // TODO don't redraw everything
        }
    }

    async playerActionEventPromise() {
        // When 'player-action-evt' happens / is dispatched, the resolve-part
        // of this Promise will be called.
        return new Promise(resolve => {
            addEventListener('player-action-evt', resolve);
        });
    }

    async mainLoop() {
        let done = false;

        while (!done) {
            // Every third turn is a playerTurn.
            // Fast enemies act every world-turn,
            // normal enemies every second,
            // slow enemies every fourth word-turn.
            
            this.draw();
            await sleep(400);
            
            this.isPlayerTurn = true;
            document.getElementById("player-turn-indicator").innerHTML = "press a key";
            // FIXME This doesn't work if the player presses "D" or "Q" (non-action functionalities)
            await this.playerActionEventPromise();
            document.getElementById("player-turn-indicator").innerHTML = "wait...";
            this.world.playerTurn();
            this.draw();
            await sleep(400);

            this.world.turn();
            document.getElementById("turn-counter").innerHTML = this.world.turnCounter.toString();
            this.draw();
            await sleep(400);

            this.world.turn();
            document.getElementById("turn-counter").innerHTML = this.world.turnCounter.toString();
        }
    }
}

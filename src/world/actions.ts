import { Direction, directions } from "../geometry";
import { World } from "./World";

export type Action = (world: World) => void;

export function walk(dir: Direction): Action {
    return (world) => {
        const playerID = world.comps.player;
        const playerPos = world.getPlayerPos();
        world.comps.position.move(playerID, playerPos.add(directions[dir]));
    };
}

export function wait(): Action {
    // Function, that doesn't change the world.
    return (world) => world;
}

/*
 function shoot
    world.animationEvents.push(AnimationEvents.Shoot(source, dest))
*/
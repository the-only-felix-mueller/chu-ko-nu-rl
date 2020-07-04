import { EntityComponents, EntityID, EntityAppearance, MovementStrategy } from "./entities";

export type EntityPrototype = (id: EntityID, entityComponents: EntityComponents) => void

export function player(id: EntityID, comps: EntityComponents): void {
    comps.appearance.set(id, EntityAppearance.PLAYER);
    comps.player = id;
}

export function goblin(id: EntityID, comps: EntityComponents): void {
    comps.appearance.set(id, EntityAppearance.GOBLIN);
    comps.movementStrategy.set(id, MovementStrategy.WANDERING);
}

export function bat(id: EntityID, comps: EntityComponents): void {
    comps.appearance.set(id, EntityAppearance.BAT);
    comps.movementStrategy.set(id, MovementStrategy.WANDERING);
    comps.fast.add(id);
}

export function turtle(id: EntityID, comps: EntityComponents): void {
    comps.appearance.set(id, EntityAppearance.TURTLE);
    comps.movementStrategy.set(id, MovementStrategy.WANDERING);
    comps.slow.add(id);
}

export function barrel(id: EntityID, comps: EntityComponents): void {
    comps.appearance.set(id, EntityAppearance.BARREL);
}


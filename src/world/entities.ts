import { Vector, BidirectionalVectorMap } from '../geometry';
import { IDManager } from '../util';
import { EntityPrototype } from './entity-prototypes';

export enum EntityAppearance {
    BARREL,
    BAT,
    GOBLIN,
    PLAYER,
    TURTLE
}

export enum MovementStrategy {
    WANDERING,
    HUNTING,
    FLEEING
}

export type EntityID = number;

export class EntityComponents {
    appearance = new Map<EntityID, EntityAppearance>();
    player: EntityID = undefined;
    wanderer = new Set<EntityID>();
    movementStrategy = new Map<EntityID, MovementStrategy>();
    position = new BidirectionalVectorMap<EntityID>();
    slow = new Set<EntityID>();
    fast = new Set<EntityID>();
}

export class EntityManager {
    private components: EntityComponents;
    private idManager: IDManager;
    
    constructor(components: EntityComponents) {
        this.components = components;
        this.idManager = new IDManager();
    }

    create(prototype: EntityPrototype, position: Vector): void {
        const id = this.idManager.generate();        
        this.components.position.set(id, position);
        prototype(id, this.components);
    }
}
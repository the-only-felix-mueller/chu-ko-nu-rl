import { Vector, BidirectionalVectorMap } from '../geometry'
import { IDManager } from '../util'
import { EntityPrototype } from './entity-prototypes'

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
  FLEEING,
  USER
}

export type EntityID = number;

export class EntityComponents {
  appearance = new Map<EntityID, EntityAppearance>();
  player: EntityID = undefined;
  wanderer = new Set<EntityID>();
  movementStrategy = new Map<EntityID, MovementStrategy>();
  position = new BidirectionalVectorMap<EntityID>();
  slow = new Set<EntityID>();
  normalSpeed = new Set<EntityID>()
  fast = new Set<EntityID>();
  // TODO Currently entities can be fast and slow at the same time
  // and yet not have a movementStrategy. That doesn't make sense.
}

export class EntityManager {
  private components: EntityComponents;
  private idManager: IDManager;

  constructor (components: EntityComponents) {
    this.components = components
    this.idManager = new IDManager()
  }

  create (prototype: EntityPrototype, position: Vector): number {
    const id = this.idManager.generate()
    this.components.position.set(id, position)
    prototype(id, this.components)
    return id
  }

  delete (id: EntityID): void {
    this.idManager.free(id)
    // TODO delete all other components
    const cs = this.components
    cs.position.delete(id)
    cs.movementStrategy.delete(id)
    cs.fast.delete(id)
    cs.normalSpeed.delete(id)
    cs.slow.delete(id)
  }
}

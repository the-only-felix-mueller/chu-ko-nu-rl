import { EntityComponents, EntityID, EntityAppearance, MovementStrategy } from './entities'

export type EntityPrototype = (id: EntityID, entityComponents: EntityComponents) => void

export function player (id: EntityID, comps: EntityComponents): void {
  comps.appearance.set(id, EntityAppearance.PLAYER)
  comps.normalSpeed.add(id)
  comps.player = id
  comps.movementStrategy.set(id, MovementStrategy.USER)
}

export function goblin (id: EntityID, comps: EntityComponents): void {
  comps.appearance.set(id, EntityAppearance.GOBLIN)
  comps.normalSpeed.add(id)
  comps.movementStrategy.set(id, MovementStrategy.WANDERING)
}

export function bat (id: EntityID, comps: EntityComponents): void {
  comps.appearance.set(id, EntityAppearance.BAT)
  comps.movementStrategy.set(id, MovementStrategy.WANDERING)
  comps.fast.add(id)
}

export function turtle (id: EntityID, comps: EntityComponents): void {
  comps.appearance.set(id, EntityAppearance.TURTLE)
  comps.movementStrategy.set(id, MovementStrategy.WANDERING)
  comps.slow.add(id)
}

export function barrel (id: EntityID, comps: EntityComponents): void {
  comps.appearance.set(id, EntityAppearance.BARREL)
}

export function wisp (id: EntityID, comps: EntityComponents): void {
  comps.appearance.set(id, EntityAppearance.WISP)
  comps.movementStrategy.set(id, MovementStrategy.WANDERING)
  comps.normalSpeed.add(id)
}

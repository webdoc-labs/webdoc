import {Vector} from "./Vector";

/**
 * Represents a physical-object and its intrinsic properties. This is useful for approximating
 * extended objects as a uniform, continous body mass (ignoring its particulate composition).
 */
export class PhysicalObject {
  constructor() {
    /**
     * The mass of this object in kilograms.
     *
     * @member {number}
     * @default 0
     */
    this.mass = 0;

    /**
     * The absolute position of this object's center of mass (in the universal reference frame)
     *
     * @member {Vector<3>}
     * @default [0, 0, 0]
     */
    this.position = Vector.create3D();

    /**
     * The absolute velocity of this object (in the universal reference frame)
     *
     * @member {Vector<3>}
     * @default [0, 0, 0]
     */
    this.velocity = Vector.create3D();

    /**
     * The mesh enclosing this object. By default, it is a "point" object at the its own
     * position.
     *
     * @member {Vector<3>}
     */
    this.bounds = [this.position];

    /**
     * All causal interactions with other objects
     *
     * @member {Array<PhysicalInteraction>}
     */
    this.interactions = [];
  }
}

/**
 * Checks whether the object is an instance of {@code PhysicalObject}.
 * @param {Object} object
 * @return {boolean}
 */
export function isPhysicalObject(object) {
  return true;
}

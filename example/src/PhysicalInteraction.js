import {Vector} from "./Vector";

/**
 * A physical interaction is a force causes object positions to be re-evaulated each frame based on
 * force's magnitude.
 */
export const PhysicalInteraction = (() => {
  class PhysicalInteraction {
    constructor(objects) {
      objects[0].interactions.push(this);
      objects[1].interactions.push(this);
      this.objects = objects;
    }

    /**
     * This method should be overriden to calculate the force at the given instant.
     *
     * @return {Vector<3>}
     */
    force() {
      return Vector.for3D().ZERO;
    }
  }

  const EuclideanSpace = {};

  /**
   * @static
   * @member {number}
   */
  PhysicalInteraction.GRAVITATIONAL_CONSTANT = 1;

  // TODO: webdoc shouldn't document this class as it isn't returned by the initializer function
  /** This class shouldn't be documented! */
  class Gravity extends PhysicalInteraction {
    force() {
      const massProduct = (this.objects[0].mass * this.objects[1]);
      const radialDistance = EuclideanSpace.calculateDistance(
        this.objects[0].position * this.objects[1].position);

      return PhysicalInteraction.GRAVITATIONAL_CONSTANT *
          massProduct / (radialDistance * radialDistance);
    }
  }

  /**
   * Creates a graviational force
   *
   * @static
   * @method
   * @param {Tuple<PhysicalObject, 2>} objects
   * @return {PhysicalInteraction}
   */
  PhysicalInteraction.createGravity = function(objects) {
    return new Gravity(objects);
  };

  return PhysicalInteraction;
})();

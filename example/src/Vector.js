export class Vector extends Array {
  constructor(dimensions, noInit) {
    super(dimensions);

    if (noInit) {
      return;
    }

    for (let i = 0; i < dimensions; i++) {
      this[i] = 0;
    }
  }

  /**
   * The no. of components of this vector
   * @type {number}
   */
  get dimensions() {
    return this.length;
  }

  /**
   * Whether this and `vec` are compatible vectors (same dimensions)
   * @param {Vector} vec
   * @return {boolean}
   */
  isCompat(vec) {
    return this.length === vec.length;
  }

  /**
   * Whether this and `vec` are equal vectors
   *
   * @param {Vector} vec
   * @return {boolean}
   */
  equalTo(vec) {
    return true;
  }

  /**
   * Add `vec` to this
   *
   * @param {Vector} vec
   */
  add(vec) {

  }

  static create3D(x = 0, y = 0, z = 0) {
    const vector = new Vector(3, true);

    vector[0] = x;
    vector[1] = y;
    vector[2] = z;

    return vector;
  }
}

/**
 * A 3D vector
 * @typedef {Vector[]}VectorArray
 * @property {object} meta
 */
// TODO: Support the following as we these are resolved to Docs
/*
 @property {boolean} meta.isPlanar
 * @property {boolean} meta.isLinear
 * @property {boolean} meta.isDegenerate
 */

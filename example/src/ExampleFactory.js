/**
 * A namespace dedicated to road manipulation utilites.
 *
 * @namespace
 */
const R = {
  /**
   * Builds a road
   *
   * @param {string} address
   * @return {ExampleFactory}
   */
  buildRoad(address) {
    return null;
  },

  /**
   * The default no. of lanes per one side of road
   */
  DEFAULT_LANES: 4,
};

/**
 * This constructor should only be used for custom contexts.
 *
 * @classdesc
 * {@link ExampleFactory} can be used to build examples.
 *
 * ```js
 * // TODO: Make the API interesting
 * ExampleFactory.getInstance()
 *  .build()
 * ```
 *
 * @param {ExampleContext}[context=null] - A custom context for the factory.
 * @class
 */
export function ExampleFactory(context= null) {

}

/**
 * Get the context of this factory.
 *
 * @return {ExampleContext}
 */
ExampleFactory.prototype.getContext = function() {
  return null;
}

/**
 * Build the road.
 */
ExampleFactory.prototype.build = function() {

}

/**
 * Gets a lazily-initialized, shared singleton instance of {@link ExampleFactory}.
 *
 * @returns {ExampleFactory}
 */
ExampleFactory.getInstance = function () {
  if (!ExampleFactory.__instance) {
    ExampleFactory.__instance = new ExampleFactory();
  }

  return ExampleFactory.__instance;
}
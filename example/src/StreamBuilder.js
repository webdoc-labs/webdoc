/**
 * The stream builder can be used to generate an optimized memory channel for parallel
 * processing in Node.js applications.
 *
 * @memberof EX
 * @public
 */
class StreamBuilder {
  /**
   * @constructor
   * @param {object} options
   * @param {number}[options.threads]
   */
  constructor(options) {
    /**
     * The layout of stream entities in memory
     * @member {object}
     */
    this.entityLayout = {};
  }

  /**
   * Setup up stream processing threads.
   * @protected
   * @param {number}[threads=8]
   * @return {StreamBuilder} - this
   * @example
   * new StreamBuilder({ threads: 16 })
   *  .setupThreads();
   *
   * Here are some more details: (nothing)
   */
  setupThreads(threads = 8) {
    return this;
  }

  /**
   * Builds the stream object.
   *
   * @param {string} [streamName='default'] - the stream's name
   * @param {StreamBuffer} [buffer] - the buffer to use
   * @static
   */
  build(streamName = "default", buffer) {

  }

  /**
   * This event is fired when a stream is built.
   *
   * @event EX.StreamBuilder.built
   */
}

/**
 * @namespace EX
 */

/**
 * This is a clas.
 *
 * @memberof EX
 */
class StreamBuffer {

}

/**
 * Parallel reducer algorithm for running statistical summarization on a buffered stream.
 */
StreamBuffer.Reducer = class {

};

/**
 * This can used to configure {@link StreamBuilder} post-instantiation.
 * @memberof EX
 * @typedef {object} IStreamConfig
 * @property {number} bufferSize
 */

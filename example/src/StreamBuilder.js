/**
 * The stream builder can be used to generate an optimized memory channel for parallel
 * processing in Node.js applications.
 *
 * @memberof EX
 * @public
 *
 * @property {string} CHAIN_KEY
 */
export class StreamBuilder {
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
 * @namespace EX.filters
 */

/**
 * Stream buffers store a portion of a stream's contents.
 *
 * @memberof EX
 */
class StreamBuffer {
  constructor() {
    /**
     * The offset of the current buffer contents in the stream.
     * @member {number}
     */
    this.offset = 0;
  }

  /**
   * Update the buffer's contents.
   */
  update() {}

  /**
   * Shift the buffer-frame right
   */
  next() {}

  /**
   * Fired when the stream buffer frame is shifted, e.g. when {@code next} or {@code prev}
   * is called.
   * @event EX.StreamBuffer.shift
   */
}

/**
 * The stream class which holds the chain-key
 *
 * @static
 * @member {Object}
 */
StreamBuffer.CHAIN_KEY_PROVIDER = StreamBuilder;


/**
 * This buffer tiles the elements for faster 2D access to neighbouring elements. This is useful if
 * you are processing pixel data of an image.
 *
 * @memberof EX
 * @augments EX.AbstractFileBuffer
 */
class TiledStreamBuffer {

}

/**
 * Base class for file buffers
 *
 * @memberof EX
 * @extends EX.StreamBuffer
 * @implements EX.IFileBuffer
 * @abstract
 */
class AbstractFileBuffer {
  /**
   * Update the buffer's contents w.r.t the file.
   */
  update() {}
}

/**
 * @memberof EX
 * @extends EX.AbstractFileBuffer
 * @mixes EX.LowpassFilter
 */
class MusicBuffer {

}

/**
 * Parallel reducer algorithm for running statistical summarization on a buffered stream.
 */
StreamBuffer.Reducer = class {

};

/**
 * Filters data points above a certain frequency threshold.
 * @memberof EX
 * @mixin
 */
const LowpassFilter = {
  /**
   * The max. frequency to be allowed in the stream
   * @param {number} t - threshold
   */
  setUpperCutoff(t) {
    /**
     * The current frequency threshold
     * @member {number}
     */
    this.currentThreshold = 0;
  },
};

/**
 * This can used to configure {@link StreamBuilder} post-instantiation.
 * @memberof EX
 * @typedef {object} IStreamConfig
 * @property {number} bufferSize
 */

/**
 * @memberof EX
 * @interface IFileBuffer
 * @property {number} dirtyID
 * @property {number} flushID
 */

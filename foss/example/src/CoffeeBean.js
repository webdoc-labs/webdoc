/**
 * This class illustrates how you can create a Java-bean like component in JavaScript
 *
 * @extends Bean
 */
export class CoffeeBean {
  /**
   * @param {object}[options]
   * @param {boolean}[options.roasted] - whether the bean is `roasted`
   * @param {number}[options.maturity]
   */
  constructor(options = {}) {
    /** @type {boolean} */
    this.roasted = typeof options.roasted === "boolean" ? options.roasted : false;

    /**
     * @name maturity
     * @type {number}
     */
    this._maturity = typeof options.maturity === "number" ? options.maturity : 1;
  }

  /**
   * Roast this coffee bean.
   *
   * NOTE: You cannot re-roast coffee beans and an error will be thrown if you try to
   * roast a roasted coffee bean.
   *
   * @throws Error
   */
  roast() {
    if (this.roasted) {
      throw new Error("Cannot roasted a roasted coffee bean");
    }

    this.roasted = true;
  }
}

/**
 * This test class is used to verify whether webdoc can document classes and their methods,
 * properties, fat-arrow methods correctly.
 */
class TestClass {// eslint-disable-line no-unused-vars
  /**
   * @param {string} arg0
   */
  constructor(arg0) {
    /**
     * This is a property0.
     * @member {string}
     */
    this.property0 = "value0";
  }

  /**
   * This is a method0.
   */
  method0() {
    /**
     * This is a property1.
     * @member {string}
     */
    this.property1 = "value1";

    /**
     * This is a class inside a method. It should have an inner scope.
     */
    class MethodClass {

    }

    /**
     * This exposes MethodClass as a member of TestClass.
     * @member {Class}
     */
    OtherClass.AliasClass = MethodClass;
  }

  /**
   * @property
   */
  static TEST_PROPERTY = "PROPERTY_VALUE_0";
}

/**
 * This class is used for testing how @member's are transferred.
 */
class OtherClass {

}

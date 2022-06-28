/**
 * Bean class
 */
abstract class Bean {
  /**
   * (optional) roasting method
   */
  abstract roast(): void;
}

/**
 * Install a bean class
 *
 * @param bean - the bean class
 */
function installBean(bean: { new(): Bean }): void {

}

import type {TemplateRenderer} from "../TemplateRenderer";

export type BindingPolicy = "partial" | "complete";

/**
 * @abstract
 */
export class Plugin {
  constructor() {
    this.bindingPolicy = "complete";
    this.renderer = null;
  }

  onBind(renderer: TemplateRenderer) {
    this.renderer = renderer;
  }

  /**
   * This method returns the plugin's "shell". The shell is a function that wraps the plugin's
   * class and can be stringified to send the plugin to another runtime environment (worker thread
   * or child process).
   *
   * Invoking the shell should return the plugin class.
   *
   * @example
   * ```
   * // Creates a new instance of the plugin "plugin"
   * const plugin2 = new (plugin.getShell()())
   * ```
   */
  getShell() {
    throw new Error("Not Implemented: Plugin did not provide a shell!");
  }
}

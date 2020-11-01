// @flow

import {Plugin} from "./Plugin";
import type {TemplateRenderer} from "../TemplateRenderer";

export type MixinPolicy = "enabled" | "disabled";

/**
 * @abstract
 */
export class MixinPlugin extends Plugin {
  constructor() {
    super();

    this.mixinPolicy = "enabled";
  }

  onBind(renderer: TemplateRenderer) {
    super.onBind(renderer);

    if (this.mixinPolicy === "enabled") {
      Object.assign(renderer, this.getMixin());
    }
  }

  /**
   * This returns the mixin this plugin exposes on the renderer object.
   *
   * @return {Object}
   */
  getMixin() {
    return {};
  }
}

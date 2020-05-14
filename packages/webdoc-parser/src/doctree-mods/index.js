// @flow

import memberResolution from "./member-resolution";
import memberof from "./memberof";
import prune from "./prune";
import relatedResolution from "./related-resolution";

const mods = [memberResolution, memberof, prune, relatedResolution];

export default function mod(doctree) {
  for (let i = 0; i < mods.length; i++) {
    console.log("mod: " + i);
    mods[i](doctree, doctree);
  }
}

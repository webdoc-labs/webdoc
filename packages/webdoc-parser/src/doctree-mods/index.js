// @flow
import type {RootDoc} from "@webdoc/types";
import member from "./member-resolution";
import memberof from "./memberof";

const mods = [
  member,
  memberof,
];

export default function mod(doctree: RootDoc) {
  for (let i = 0; i < mods.length; i++) {
    console.log("mod: " + i);
    mods[i](doctree, doctree);
  }
}

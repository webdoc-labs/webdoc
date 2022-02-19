// @flow

// The discover-members mod imports member symbols from extended classes, implemented interfaces,
// and mixed mixins.

import {addChildDoc, cloneDoc, mangled} from "@webdoc/model";
import type {Doc} from "@webdoc/types";

// The set of docs that discoverMembers has run on
const discovered = new Set<Doc>();

function ensureDiscovered(doc: Doc, depsChain: Set<Doc>): void {
  if (depsChain.has(doc)) {
    throw new Error(`${doc.path} has a cyclic dependency graph in extends, implements, or mixes`);
  }

  if (discovered.has(doc)) {
    return;
  }

  discoverMembers(doc, depsChain);
}

function findInherited(member: Doc): Doc {
  let counter = 0;
  let doc: any = member;

  while (doc.inherits) {
    doc = doc.inherits;
    ++counter;

    if (counter > 100) {
      throw new Error("Inheritance chain can't be more than 100 classes");
    }
  }

  return (doc: Doc);
}

// Finds all the members of doc, including those that are inherited, implemented, or mixed.
function discoverMembers(doc: Doc, depsChain = new Set<Doc>()): void {
  depsChain.add(doc);
  discovered.add(doc);

  if (!doc.extends && !doc.implements && !doc.mixes) {
    return;
  }

  // This maps symbol names to the members of doc, so that the same symbol is not
  // inherited/overriden multiple times.
  const membersByMangledName: { [id: string]: any } = {};
  const membersByName: { [id: string]: any } = {};

  // Prevent overridding symbols from being replaced by adding them beforehand.
  for (let i = 0; i < doc.members.length; i++) {
    const directMember = doc.members[i];

    membersByMangledName[mangled(directMember)] = directMember;
    membersByName[directMember.name] = directMember;
  }

  const parents = [];

  if (doc.extends) {
    parents.push(...doc.extends);
  }
  if (doc.implements) {
    parents.push(...(doc.implements: any));
  }
  if (doc.mixes) {
    parents.push(...(doc.mixes: any));
  }

  for (const parent of parents) {
    if (!parent) {
      console.log("Parent of " + doc.path + " includes undefined");
      continue;
    }
    if (typeof parent === "string") {
      // Unresolved parent (mod-resolve-related & mod-resolve-links couldn't find it, so skip)
      continue;
    }

    ensureDiscovered(parent, depsChain);

    for (let i = 0; i < parent.members.length; i++) {
      const member = parent.members[i];
      const memberMangled = mangled(member);

      // Only methods/properties/events are inheritable
      if (member.type !== "MethodDoc" &&
        member.type !== "PropertyDoc" &&
        member.type !== "EventDoc"
      ) {
        continue;
      }

      // Only instance methods/properties can be inherited/implemented/mixed
      if (member.scope !== "instance" && member.type !== "EventDoc") {
        continue;
      }

      // Parent symbols are hidden by inherited/implemented symbols
      // Use mangled-map to try to find the most specific override
      if (membersByMangledName[memberMangled]) {
        membersByMangledName[memberMangled].overrides = member;
        continue;
      }
      // TODO: We might want to skip setting "overrides" in this case if it already overrides a
      //  more important / primary signature.
      // Otherwise find by name
      // If the child class has another member with a different signature but same number
      if (membersByName[member.name]) {
        membersByName[member.name].overrides = member;
        continue;
      }

      // Only add an inherited member if the child has no member with the same name
      const temp = cloneDoc(member);
      membersByMangledName[memberMangled] = temp;

      temp.overrides = false;
      temp.inherited = true;
      temp.inherits = findInherited(member);

      addChildDoc(temp, doc);
    }
  }
}

export default function discover(doc: Doc): void {
  discoverMembers(doc);

  for (let i = 0; i < doc.members.length; i++) {
    // If parent-member graph is cyclic, we might be trapped into an infinite loop. This guard
    // helps prevent that.
    if (!discovered.has(doc.members[i])) {
      discover(doc.members[i]);
    }
  }
}

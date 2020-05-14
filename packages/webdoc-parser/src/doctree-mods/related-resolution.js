// @flow

import type {Doc, RootDoc, DocLink} from "@webdoc/types";
import {doc as findDoc, cloneDoc, addChildDoc} from "@webdoc/model";

// Resolve all string symbol-paths in array to the actual Doc from the tree.
function resolveArray(array: DocLink[], doc: Doc, tree: RootDoc) {
  for (let i = 0; i < array.length; i++) {
    const symbolPath = array[i];

    if (typeof symbolPath !== "string") {
      // Don't hurt already resolved docs, if any
      continue;
    }

    const symbolDoc = findDoc(symbolPath, tree);

    // Only replace symbolPath in the array if the doc is found
    if (symbolDoc) {
      array[i] = symbolDoc;
    }
  }
}

// Finds all the members of doc, including those that are inherited, implemented, or mixed.
export function discoverMembers(doc: Doc): void {
  if (!doc.extends && !doc.implements) {
    return;
  }

  const members = doc.members;
  const memberMap: { [id: string]: string } = {};

  for (let i = 0; i < doc.members.length; i++) {
    const directMember = doc.members[i];

    memberMap[directMember.name] = directMember;
  }

  const parents = [];

  if (doc.extends) {
    parents.push(...doc.extends);
  }
  if (doc.implements) {
    parents.push(...doc.implements);
  }

  for (const parent of parents) {
    if (typeof parent === "string") {
      console.log("skip " + parent);
      continue;
    }

    for (let i = 0; i < parent.members.length; i++) {
      const member = parent.members[i];

      // Only methods/properties/events are inheritable
      if (member.type !== "MethodDoc" && member.type !== "PropertyDoc" && member.type !== "EventDoc") {
        continue;
      }

      // Only instance methods/properties can be inherited/implemented/mixed
      if (member.scope !== "instance" && member.type !== "EventDoc") {
        continue;
      }

      // Parent symbols are hidden by inherited/implemented symbols
      if (memberMap[member.name]) {
        memberMap[member.name].overrides = true;
        continue;
      }

      memberMap[member.name] = member;

      const temp = cloneDoc(member);

      temp.overrides = false;
      temp.inherited = true;

      addChildDoc(temp, doc);
    }
  }
}

/**
 * + Resolves all docs listed in the "extends", "implements", "mixes". This prevent redundant
 *    searches to extended/implemented/mixed symbols.
 *
 * + Replaces the "default" scopes for properties with a good guess. (The @property tag parser puts
 *    "default" scope on the PropertyDocs it creates)
 *
 * + Brings down any methods/properties coming from parent classes & mixins. Adds the implementation
 *    property to methods/properties that come from interfaces.
 *
 * @param {Doc} doc
 * @param {RootDoc} tree
 */
export default function resolveRelated(doc: Doc, tree: RootDoc) {
  if (doc.extends) {
    resolveArray(doc.extends, doc, tree);
  }

  if (doc.implements) {
    resolveArray(doc.implements, doc, tree);
  }

  if (doc.mixes) {
    resolveArray(doc.mixes, doc, tree);
  }

  if (doc.type === "PropertyDoc" && doc.scope === "default") {
    if (doc.parent.type === "InterfaceDoc" || doc.parent.type === "ClassDoc") {
      doc.scope = "instance";
    } else {
      doc.scope = "static";
    }
  }

  discoverMembers(doc);

  for (let i = 0; i < doc.members.length; i++) {
    resolveRelated(doc.members[i], tree);
  }
}

// @flow

import {
  type Doc,
  type RootDoc,
  searchExtendedClasses,
  searchImplementedInterfaces,
  traverse,
} from "@webdoc/model";

type Relations = {
  ancestry: {
    class: Doc[],
    interfaces: Doc[],
    mixins: Doc[]
  }
}

export const RelationsPlugin = {
  buildRelations(docTree: RootDoc = this.renderer.docTree) {
    this.relations = new Map<string, Relations>();

    traverse(docTree, (doc: Doc) => {
      this.relations.set(doc.path, {
        ancestry: {
          classes: Array.from(searchExtendedClasses(doc)),
          interfaces: Array.from(searchImplementedInterfaces(doc)),
        },
      });
    });
  },
  getAncestorClasses(doc: Doc | string): Doc[] {
    return this.relations.get(typeof doc === "string" ? doc : doc.path).ancestry.classes;
  },
  getAncestorInterfaces(doc: Doc | string) {
    return this.relations.get(typeof doc === "string" ? doc : doc.path).ancestry.interfaces;
  },
};



import {Doc} from "@webdoc/model";
import {parse} from "./parse";

const code = `
/**
 * Class
 */
class Example
{
  /**
   * @ctor
   */
  constructor()
  {
    this.member = 'value';

    this.clog = {
      val: 'ddo'
    };
  }
}

Example.ChildClass = class {
  helloworld() {
    
  }
}
`;

const code2 = `
/** @class */
class PIXI {

}

/**
 * Disturbed?
 * 
 * @memberof PIXI
 */
class Renderer {
    constructor() {
      /**
       *  something
       */
      this.something = 'why';
    }
    
    /**
     * @member {TAG}
     */
    get getter() {
    }

    /**
     * last
     * @tag
     */

    /**
     * Static inner class
     * @class
     */
    static prop = class RendererScope {

      constructor() {
        /**
         * @member {string}
         */
        this.member = 'value';
      }
    }
}
`;

export function printDoc(doc: Doc) {
  let spaces = ">";

  for (let i = 0; i < doc.stack.length - 1; i++) {
    spaces += "\t";
  }

  console.log(`${spaces} ${doc.name} (${doc.constructor.name})`);

  for (let i = 0; i < doc.children.length; i++) {
    printDoc(doc.children[i]);
  }
}

require("util").inspect.defaultOptions.depth = 9;

function printPartial(d) {
  let space = "";
  for (let i = 0; i < d.path.length; i++) {
    space += " ";
  }

  console.log(space + (d.name || d.comment.split("\n")[1]) + " " + (d.node ? d.node.type : "<null>"));
  // console.log(d.loc);

  for (let i = 0; i < d.children.length; i++) {
    printPartial(d.children[i]);
  }
}

const doc = parse(code2);
// parse(code2, doc);
console.log(doc);
// printPartial(doc);

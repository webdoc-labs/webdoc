"use strict";

var _parse = require("./parse");

const code = `
/**
 * Yo yo
 * @class
 * @emitter
 */
class Babri
{
    constructor()
    {
        /**
         * What is kya?
         * @member {boolean}
         */
        this.kya = true;
    }

    /**
     * Do karta.
     * @param {boolean} kyu
     */
    karta(kyu) {

    }
}
`;
const code2 = `
/**
 * Disturbed?
 */
class Kutta {

}
`;
require('util').inspect.defaultOptions.depth = 4;
const doc = (0, _parse.parse)(code);
(0, _parse.parse)(code2, doc);
console.log(doc);
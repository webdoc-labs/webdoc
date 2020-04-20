// @flow

import {parse} from './parse';

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
         * @member {PIXI.filters}
         */
        this.kya = true;
    }

    /**
     * Do karta.
     * @param {{boolean} kyu
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

require('util').inspect.defaultOptions.depth = 5;

const doc = parse(code);
parse(code2, doc);

console.log(doc);

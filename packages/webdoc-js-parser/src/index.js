// @flow

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const code = `
/**
 * Yo yo
 * @class
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

class Tag {
  constructor(name, tokens) {
    this.name = name;
    this.tokens = tokens;
  }
}

function parseDoclet(node) {
  if (!node.leadingComments) {
    return;
  }
  let input = node.leadingComments[node.leadingComments.length - 1].value;

  if (!input) {
    return;
  }

  input = input.split('\n');

  const result = {
    tags: [],
  };

  for (let i = 0; i < input.length; i++) {
    input[i] = input[i].trim();

    if (input[i].startsWith('*')) {
      input[i] = input[i].replace('*', '').trimStart();
    }

    if (input[i].startsWith('@')) {
      const tokens = input[i].split(' ');
      const tag = tokens[0].replace('@', '');

      //      console.log(tokens);
      result.tags.push(new Tag(tag, tokens.slice(0)));
      // result.node = node;
    }
  }

  return result;
}

export function parse(expr) {
  console.log('HERE');
  const ast = parser.parse(expr);

  traverse(ast, {
    enter(p) {
      console.log(parseDoclet(p.node));
    },
  });
}

parse(code);

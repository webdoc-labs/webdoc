"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

var parser = _interopRequireWildcard(require("@babel/parser"));

var _traverse = _interopRequireDefault(require("@babel/traverse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
    tags: []
  };

  for (let i = 0; i < input.length; i++) {
    input[i] = input[i].trim();

    if (input[i].startsWith('*')) {
      input[i] = input[i].replace('*', '').trimStart();
    }

    if (input[i].startsWith('@')) {
      const tokens = input[i].split(' ');
      const tag = tokens[0].replace('@', ''); //      console.log(tokens);

      result.tags.push(new Tag(tag, tokens.slice(0))); // result.node = node;
    }
  }

  return result;
}

function parse(expr) {
  console.log('HERE');
  const ast = parser.parse(expr);
  (0, _traverse.default)(ast, {
    enter(p) {
      console.log(parseDoclet(p.node));
    }

  });
}

parse(code);
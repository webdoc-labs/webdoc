"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

var parser = _interopRequireWildcard(require("@babel/parser"));

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _transform = require("./transform");

var _jsDocmodel = require("@webdoc/js-docmodel");

var _types = require("@babel/types");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function parse(expr, root = new _jsDocmodel.RootDoc()) {
  const ast = parser.parse(expr);
  const stack = [root];
  (0, _traverse.default)(ast, {
    enter(p) {
      const doc = (0, _transform.transform)(p.node, root);

      if (!doc) {
        return;
      }

      const parent = doc.parent ? doc.parent : stack[stack.length - 1];
      stack.push(doc);
      doc.node = p;
      parent.children.push(doc);
      doc.parentDoc = parent;
    },

    exit(node) {
      const currentPtr = stack[stack.length - 1];

      if (currentPtr.node === node) {
        stack.pop();
      }
    }

  });
  return root;
}
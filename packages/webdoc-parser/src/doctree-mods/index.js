"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mod;

var _memberResolution = _interopRequireDefault(require("./member-resolution"));

var _memberof = _interopRequireDefault(require("./memberof"));

var _prune = _interopRequireDefault(require("./prune"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mods = [_memberResolution.default, _memberof.default, _prune.default];

function mod(doctree) {
  for (let i = 0; i < mods.length; i++) {
    console.log("mod: " + i);
    mods[i](doctree, doctree);
  }
}
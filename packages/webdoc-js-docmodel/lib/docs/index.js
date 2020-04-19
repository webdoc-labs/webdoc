"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ClassDoc = require("./ClassDoc");

Object.keys(_ClassDoc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _ClassDoc[key];
    }
  });
});

var _Doc = require("./Doc");

Object.keys(_Doc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _Doc[key];
    }
  });
});

var _InlineDoc = require("./InlineDoc");

Object.keys(_InlineDoc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _InlineDoc[key];
    }
  });
});

var _MethodDoc = require("./MethodDoc");

Object.keys(_MethodDoc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _MethodDoc[key];
    }
  });
});

var _RootDoc = require("./RootDoc");

Object.keys(_RootDoc).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _RootDoc[key];
    }
  });
});
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _docs = require("./docs");

Object.keys(_docs).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _docs[key];
    }
  });
});

var _tags = require("./tags");

Object.keys(_tags).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _tags[key];
    }
  });
});